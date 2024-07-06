import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs'
import { join } from 'path';

// import * as hbs from 'hbs';


async function bootstrap() {
  dotenv.config({ path: '.env.apis' });

  const httpsOptions = process.env.SERVER_MODE === 'https' ? {
    key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8'),
    ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8'),
  } : null;


  const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });
  
  process.env.NODE_ENV ==='development' && mongoose.set('debug', true);

  const config = new DocumentBuilder()
    .setTitle('Oyraa Apis')
    .setDescription('OyraaApis')
    .addServer(process.env.API_SERVER, 'Local development server')
    .addServer(process.env.API_STAGING_SERVER, 'Staging development server')
    .setVersion('4.3')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {});
  app.enableCors();

  app.useStaticAssets(join(__dirname, 'public'));
  app.setBaseViewsDir(join(__dirname, 'views'));
  
  app.setViewEngine('hbs');

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(+process.env.PORT);
}
bootstrap();
