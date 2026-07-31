import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { RedisIoAdapter } from './realtime/redis-io.adapter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting NestJS application...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('Basaer', {
              colors: true,
              prettyPrint: process.env.NODE_ENV !== 'production',
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  // ── Global Exception Filter ────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  logger.log('NestJS application core created.');

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  app.enableShutdownHooks();

  // ── Logging ─────────────────────────────────────────────────────────────────
  app.useGlobalInterceptors(
    new TenantContextInterceptor(),
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // ── Global Route Prefix ─────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  // Trust proxy to correctly read X-Forwarded-Proto and X-Forwarded-For headers
  // This ensures req.protocol returns 'https' when behind Nginx
  app.set('trust proxy', 1);

  // ── Serve static files for local fallback uploads ──────────────────────────
  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/uploads/',
    index: false,
  });

  // ── Serve static documents (event rules PDFs etc.) ────────────────────────
  app.useStaticAssets(path.join(__dirname, '..', 'public', 'documents'), {
    prefix: '/documents/',
    index: false,
  });

  // ── Security Headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
  app.use(cookieParser());
  app.disable('x-powered-by');

  // ── CORS ────────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
    ...(process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',')
      : []),
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ── Global Validation ───────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Graceful Shutdown ────────────────────────────────────────────────────────
  const prismaService = app.get(PrismaService);
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'];

  for (const signal of signals) {
    process.on(signal, () => {
      (async () => {
        logger.log(`Received ${signal}. Starting graceful shutdown...`);
        await app.close();
        if (prismaService && typeof prismaService.$disconnect === 'function') {
          await prismaService.$disconnect();
        }
        logger.log('Graceful shutdown completed.');
        process.exit(0);
      })().catch((err) => {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
      });
    });
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Basaer API')
    .setDescription('Basaer School Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }

  // Without this, Socket.IO falls back to its in-memory adapter: broadcasts
  // (sendToUser/sendToBranch) only reach clients connected to the SAME
  // instance that emitted them, so once the app scales beyond one process,
  // a subset of users silently stop receiving realtime events.
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = process.env.PORT || 3001;
  logger.log(`Attempting to bind to port ${port}...`);

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  new Logger('Bootstrap').error('Application failed to start:', err);
  process.exit(1);
});
