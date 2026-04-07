import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('Starting NestJS application...');
  const app = await NestFactory.create(AppModule);
  console.log('NestJS application core created.');

  // ── Security Headers ────────────────────────────────────────────────────────
  // NOTE: Run `npm install helmet` to enable this.
  // Once installed, uncomment the two lines below:
  // import helmet from 'helmet';
  // app.use(helmet());

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'https://basaeer-frontend.vercel.app',
      'https://basaaer-frontend.netlify.app',
      'http://localhost:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ── Global Validation ───────────────────────────────────────────────────────
  // Strips unknown fields (whitelist) and throws on unknown properties
  // (forbidNonWhitelisted). Activates all class-validator decorators in DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3001;
  console.log(`Attempting to bind to port ${port}...`);

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
