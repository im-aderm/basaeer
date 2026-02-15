import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

const createNestServer = async (expressInstance) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );
    app.enableCors({
        origin: '*', // Adjust this to your frontend URL in production
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    await app.init();
};

createNestServer(server)
    .then(() => console.log('NestJS initialized'))
    .catch((err) => console.error('NestJS initialization failed', err));

export default server;
