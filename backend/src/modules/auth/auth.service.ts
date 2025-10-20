import bcrypt from 'bcryptjs';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { User, LoginRequest, LoginResponse } from '@msgsystec/shared';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Buscar usuário por email
    const result = await db.query(
      'SELECT id, email, password, name, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Credenciais inválidas');
    }

    const user = result.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar JWT token
    const token = await this.generateToken(user.id);

    // Retornar dados do usuário (sem senha) e token
    const userResponse: Omit<User, 'password'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return {
      user: userResponse,
      token,
    };
  }

  async generateToken(userId: string): Promise<string> {
    // Simular geração de JWT (será implementado com fastify-jwt)
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 horas
    };

    // Por enquanto retornar um token simples (será substituído pelo fastify-jwt)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Verificar expiração
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expirado');
      }

      return { userId: payload.userId };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    // Validações básicas de senha
    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    return true;
  }
}
