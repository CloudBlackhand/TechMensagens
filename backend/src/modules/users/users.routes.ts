import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { db } from '../../config/database';

const usersService = new UsersService();
const authService = new AuthService();

// Middleware de autenticação
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.cookies.token;
    
    if (!token) {
      reply.code(401);
      throw new Error('Token não encontrado');
    }

    const { userId } = await authService.verifyToken(token);
    request.userId = userId;
  } catch (error) {
    reply.code(401);
    throw new Error('Token inválido');
  }
}

// Middleware de autorização admin
async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply);
  
  const result = await db.query(
    'SELECT role FROM users WHERE id = $1',
    [request.userId]
  );

  if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
    reply.code(403);
    throw new Error('Acesso negado. Apenas administradores.');
  }
}

// Schemas de validação
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['admin', 'user']).optional().default('user'),
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  role: z.enum(['admin', 'user']).optional(),
});

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Extender tipos do Fastify
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

export default async function usersRoutes(fastify: FastifyInstance) {
  // Listar todos os usuários (apenas admin)
  fastify.get('/', {
    preHandler: requireAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await usersService.getAllUsers();
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Obter usuário atual
  fastify.get('/me', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await usersService.getUserById(request.userId!);
      
      if (!user) {
        reply.code(404);
        return {
          success: false,
          error: 'Usuário não encontrado',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Obter usuário por ID (apenas admin)
  fastify.get('/:id', {
    preHandler: requireAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await usersService.getUserById(id);
      
      if (!user) {
        reply.code(404);
        return {
          success: false,
          error: 'Usuário não encontrado',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Criar usuário (apenas admin)
  fastify.post('/', {
    preHandler: requireAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createUserSchema.parse(request.body);
      const user = await usersService.createUser(body);
      
      reply.code(201);
      return {
        success: true,
        data: user,
        message: 'Usuário criado com sucesso',
      };
    } catch (error) {
      reply.code(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Atualizar usuário (apenas admin)
  fastify.put('/:id', {
    preHandler: requireAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const body = updateUserSchema.parse(request.body);
      const user = await usersService.updateUser(id, body);
      
      return {
        success: true,
        data: user,
        message: 'Usuário atualizado com sucesso',
      };
    } catch (error) {
      reply.code(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Alterar senha
  fastify.put('/:id/password', {
    preHandler: requireAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const body = changePasswordSchema.parse(request.body);
      await usersService.changePassword(id, body.newPassword);
      
      return {
        success: true,
        message: 'Senha alterada com sucesso',
      };
    } catch (error) {
      reply.code(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Deletar usuário (apenas admin)
  fastify.delete('/:id', {
    preHandler: requireAdmin,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await usersService.deleteUser(id);
      
      return {
        success: true,
        message: 'Usuário deletado com sucesso',
      };
    } catch (error) {
      reply.code(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });
}
