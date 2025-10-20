import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { testConnection } from './config/database';
import { env } from './config/env';

// Importar rotas
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import sheetsRoutes from './modules/sheets/sheets.routes';
import wahaRoutes from './modules/waha/waha.routes';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function buildApp() {
  // Registrar plugins
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  await fastify.register(cookie, {
    secret: env.JWT_SECRET,
  });

  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  // Registrar rotas
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(usersRoutes, { prefix: '/api/users' });
  await fastify.register(sheetsRoutes, { prefix: '/api/sheets' });
  await fastify.register(wahaRoutes, { prefix: '/api/waha' });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return fastify;
}

async function start() {
  try {
    // Testar conexão com banco
    await testConnection();

    // Construir app
    const app = await buildApp();

    // Iniciar servidor
    await app.listen({ 
      port: env.PORT, 
      host: '0.0.0.0' 
    });

    console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`);
    console.log(`📊 Health check: http://localhost:${env.PORT}/health`);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

start();
