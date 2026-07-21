import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  workspaceName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    workspaceId: string;
  };
}

export class AuthService {
  private prisma: PrismaClient;
  private readonly SALT_ROUNDS = 10;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const { email, password, name, workspaceName } = payload;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const workspace = await this.prisma.workspace.create({
      data: {
        name: workspaceName,
        status: 'ACTIVE',
      },
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        workspaceId: workspace.id,
        role: 'TRAINER',
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      workspaceId: workspace.id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      workspaceId: workspace.id,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: workspace.id,
      },
    };
  }

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { email, password } = payload;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { workspace: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (user.workspace.status !== 'ACTIVE') {
      throw new Error('Workspace is not active');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspaceId,
      },
    };
  }

  async refreshToken(token: string): Promise<TokenResponse> {
    const payload = verifyRefreshToken(token);

    if (!payload) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { workspace: true },
    });

    if (!user || user.workspace.status !== 'ACTIVE') {
      throw new Error('User or workspace not found');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspaceId,
      },
    };
  }

  async logout(): Promise<void> {
    // Token invalidation happens on the client side
    // Server doesn't need to do anything for logout
  }
}
