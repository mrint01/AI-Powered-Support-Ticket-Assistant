import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax', // or 'none' if using HTTPS and different domains
        secure: false,   // set to true if using HTTPS
      },
    })
  );
  app.enableCors({
    origin: 'http://localhost:5173', // or your frontend URL
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
