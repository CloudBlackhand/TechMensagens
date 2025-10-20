import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WahaService } from './waha.service';
import { AuthService } from '../auth/auth.service';

const wahaService = new WahaService();
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

export default async function wahaRoutes(fastify: FastifyInstance) {
  // Placeholder para todas as rotas Waha
  
  // Criar sessão
  fastify.post('/sessions', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await wahaService.createSession(request.userId!);
      
      return {
        success: true,
        data: session,
        message: 'Sessão Waha criada com sucesso',
      };
    } catch (error) {
      reply.code(501); // Not Implemented
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Módulo Waha ainda não implementado',
      };
    }
  });

  // Listar sessões do usuário
  fastify.get('/sessions', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sessions = await wahaService.getUserSessions(request.userId!);
      
      return {
        success: true,
        data: sessions,
      };
    } catch (error) {
      reply.code(501); // Not Implemented
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Módulo Waha ainda não implementado',
      };
    }
  });

  // Obter sessão específica
  fastify.get('/sessions/:id', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const session = await wahaService.getSession(id);
      
      if (!session) {
        reply.code(404);
        return {
          success: false,
          error: 'Sessão não encontrada',
        };
      }

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      reply.code(501); // Not Implemented
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Módulo Waha ainda não implementado',
      };
    }
  });

  // Atualizar status da sessão
  fastify.put('/sessions/:id/status', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: 'active' | 'inactive' };
      
      const session = await wahaService.updateSessionStatus(id, status);
      
      return {
        success: true,
        data: session,
        message: 'Status da sessão atualizado',
      };
    } catch (error) {
      reply.code(501); // Not Implemented
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Módulo Waha ainda não implementado',
      };
    }
  });

  // Deletar sessão
  fastify.delete('/sessions/:id', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await wahaService.deleteSession(id);
      
      return {
        success: true,
        message: 'Sessão deletada com sucesso',
      };
    } catch (error) {
      reply.code(501); // Not Implemented
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Módulo Waha ainda não implementado',
      };
    }
  });

  // Enviar mensagem (placeholder)
  fastify.post('/sessions/:id/messages', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { message } = request.body as { message: string };
      
      await wahaService.sendMessage(id, message);
      
      return {
        success: true,
        message: 'Mensagem enviada com sucesso',
      };
    } catch (error) {
      reply.code(501); // Not Implemented
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Módulo Waha ainda não implementado',
      };
    }
  });

  // Obter mensagens (placeholder)
  fastify.get('/sessions/:id/messages', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const messages = await wahaService.getMessages(id);
      
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      reply.code(501); // Not Implemented
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Módulo Waha ainda não implementado',
      };
    }
  });
}
