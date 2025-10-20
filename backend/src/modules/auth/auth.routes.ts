import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { LoginRequest } from '@msgsystec/shared';
import { db } from '../../config/database';

const authService = new AuthService();

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = loginSchema.parse(request.body);
      
      const result = await authService.login(body as LoginRequest);
      
      // Definir cookie com token
      reply.setCookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      return {
        success: true,
        data: result,
        message: 'Login realizado com sucesso',
      };
    } catch (error) {
      reply.code(401);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('token');
    return {
      success: true,
      message: 'Logout realizado com sucesso',
    };
  });

  // Verificar token (middleware)
  fastify.get('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.cookies.token;
      
      if (!token) {
        reply.code(401);
        return {
          success: false,
          error: 'Token não encontrado',
        };
      }

      const { userId } = await authService.verifyToken(token);
      
      // Buscar dados do usuário
      const result = await db.query(
        'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        reply.code(401);
        return {
          success: false,
          error: 'Usuário não encontrado',
        };
      }

      const user = result.rows[0];
      
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      };
    } catch (error) {
      reply.code(401);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token inválido',
      };
    }
  });
}
