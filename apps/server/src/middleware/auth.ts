import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    workspaceId: string;
  };
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header missing' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Invalid authorization header format' });
    return;
  }

  const token = parts[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = {
    userId: payload.userId,
    email: payload.email,
    workspaceId: payload.workspaceId,
  };

  next();
}

export function verifyWorkspaceAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const workspaceIdFromHeader = req.headers['x-workspace-id'] as string;
  const workspaceIdFromToken = req.user.workspaceId;

  if (workspaceIdFromHeader && workspaceIdFromHeader !== workspaceIdFromToken) {
    res.status(403).json({ error: 'Workspace access denied' });
    return;
  }

  next();
}
