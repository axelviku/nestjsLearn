import { Module } from '@nestjs/common';
import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    I18nModule.forRootAsync({
        useFactory: (configService: ConfigService) => ({
          fallbackLanguage: 'en',
          loaderOptions: {
            path:  `${process.cwd()}/common/language/i18n`,  
            watch: true,
          },
        }),
        resolvers: [
          { use: QueryResolver, options: ['lang'] },
          AcceptLanguageResolver,
          new HeaderResolver(['x-lang']),
        ],
        inject: [ConfigService],
      }),
  ],
})
export class LanguageModule {}
