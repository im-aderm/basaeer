import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

const createNestServer = async (expressInstance) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );
    app.enableCors({
        origin: ['https://basaeer-frontend.vercel.app', 'http://localhost:3000'], // Update to Vercel URL
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    await app.init();
    return app;
};

export default async function handler(req, res) {
    if (!(server as any).isNestInitialized) {
        await createNestServer(server);
        (server as any).isNestInitialized = true;
    }
    server(req, res);
}
