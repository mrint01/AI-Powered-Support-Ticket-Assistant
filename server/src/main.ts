import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax', // or 'none' if using HTTPS and different domains
        secure: false, // set to true if using HTTPS
      },
    }),
  );
  // NEW: allow your frontend public IP or ALB
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://ticket-alb-1930192698.eu-central-1.elb.amazonaws.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',

    credentials: true,
  });

  // Lightweight health check endpoint using Express adapter
  app
    .getHttpAdapter()
    .get('/health', (_req, res) => res.status(200).send('OK'));

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
