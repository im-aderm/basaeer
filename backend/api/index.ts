import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

const createNestServer = async (expressInstance: express.Express) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );
    app.enableCors({
        origin: ['https://basaer-frontend.vercel.app', 'http://localhost:3000'], // Update to Vercel URL
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    await app.init();
    return app;
};

export default async function handler(req: any, res: any) {
    try {
        if (!(server as any).isNestInitialized) {
            console.log('Initializing NestJS server...');
            await createNestServer(server);
            (server as any).isNestInitialized = true;
            console.log('NestJS server initialized successfully');
        }
        server(req, res);
    } catch (error) {
        console.error('Server execution failed:', error);
        // Manually set CORS headers for error response
        res.setHeader('Access-Control-Allow-Origin', 'https://basaer-frontend.vercel.app');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
