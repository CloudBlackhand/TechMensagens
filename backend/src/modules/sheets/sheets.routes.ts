import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SheetsService } from './sheets.service';
import { AuthService } from '../auth/auth.service';

const sheetsService = new SheetsService();
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

export default async function sheetsRoutes(fastify: FastifyInstance) {
  // Ler dados da planilha
  fastify.get('/read', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sheetData = await sheetsService.readSheetData();
      
      return {
        success: true,
        data: sheetData,
        message: 'Dados da planilha carregados com sucesso',
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Atualizar dados da planilha (refresh)
  fastify.post('/refresh', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sheetData = await sheetsService.readSheetData();
      
      return {
        success: true,
        data: sheetData,
        message: 'Dados da planilha atualizados com sucesso',
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Obter informações da planilha
  fastify.get('/info', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sheetInfo = await sheetsService.getSheetInfo();
      
      return {
        success: true,
        data: sheetInfo,
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });

  // Obter URL de autorização (para implementação futura)
  fastify.get('/auth-url', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authUrl = sheetsService.getAuthUrl();
      
      return {
        success: true,
        data: { authUrl },
        message: 'URL de autorização gerada',
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      };
    }
  });
}
