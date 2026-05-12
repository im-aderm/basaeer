import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting NestJS application...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Global Exception Filter ────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  logger.log('NestJS application core created.');

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  app.enableShutdownHooks();

  // ── Logging ─────────────────────────────────────────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // ── Global Route Prefix ─────────────────────────────────────────────────────
  // Ensures consistency with Nginx path-based routing (/api)
  app.setGlobalPrefix('api');

  // ── Security Headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'", 'https:', 'http:'],
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
    'http://localhost:3000',
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

  const port = process.env.PORT || 3001;
  logger.log(`Attempting to bind to port ${port}...`);

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
