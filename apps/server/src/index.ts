import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAuthRoutes } from './routes/auth';
import { createStudentRoutes } from './routes/students';
import { createSessionRoutes } from './routes/sessions';
import { createWorkspaceRoutes } from './routes/workspaces';
import { createSubscriptionRoutes } from './routes/subscriptions';

// Load env vars
dotenv.config();

// ============================================================================
// LOGGER SETUP
// ============================================================================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'train-app-server' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

export const prisma = new PrismaClient();

// Test database connection on startup
async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Tenant context middleware (extrair workspace_id das requests)
app.use((req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.headers['x-workspace-id'] as string;
  const authorization = req.headers.authorization;

  (req as any).workspaceId = workspaceId;
  (req as any).authorization = authorization;

  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: NODE_ENV,
  });
});

// API version
app.get('/api/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Auth routes (no authentication required)
app.use('/api/auth', createAuthRoutes(prisma));

// Protected routes (authentication required)
app.use('/api/workspaces', createWorkspaceRoutes(prisma));
app.use('/api/students', createStudentRoutes(prisma));
app.use('/api/sessions', createSessionRoutes(prisma));
app.use('/api/subscriptions', createSubscriptionRoutes(prisma));

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500,
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// ============================================================================
// SOCKET.IO SETUP (Real-time)
// ============================================================================

let httpServer: HTTPServer;
let io: SocketServer;

function setupSocket() {
  httpServer = require('http').createServer(app);
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // TODO: Verificar JWT token
    next();
  });

  // Socket connection handling
  io.on('connection', (socket) => {
    logger.info(`🔗 Socket connected: ${socket.id}`);
    const workspaceId = socket.handshake.auth.workspaceId;

    // Join workspace room
    socket.join(`workspace:${workspaceId}`);

    // Listen for events
    socket.on('session:updated', (data) => {
      logger.info(`Session updated: ${data.sessionId}`);
      // Broadcast to all users in workspace
      io.to(`workspace:${workspaceId}`).emit('session:updated', data);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return httpServer;
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

async function gracefulShutdown(signal: string) {
  logger.info(`📍 Received ${signal}, starting graceful shutdown...`);

  if (httpServer) {
    httpServer.close(() => {
      logger.info('✅ HTTP server closed');
    });
  }

  await prisma.$disconnect();
  logger.info('✅ Database disconnected');

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  try {
    // Test database connection
    await testConnection();

    // Setup Socket.IO
    const server = setupSocket();

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${NODE_ENV}`);
      logger.info(`🔌 WebSocket enabled at ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export for testing
export { app, io };

// Start if not in test environment
if (process.env.NODE_ENV !== 'test') {
  start();
}
