import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { I18nService, I18nLang } from 'nestjs-i18n';
// import { User } from '../../common/schemas/user.schema';

@Injectable()
export class AppService {
  constructor(
    // @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly i18n: I18nService,
  ) {}

  // async create(createUserDto: CreateUserDto): Promise<User> {
  //   const createdUser = new this.userModel(createUserDto);
  //   return createdUser.save();
  // }

  getPlatform(headers: object): string {
    return headers['os'];
  }
  getApiVersion(headers: object): string {
    return headers['version'];
  }
  async getLanguage(headers: object): Promise<string> {
    const languagee = headers['language'];
    let language_obj = {
      en: 'en',
      jp: 'jp',
      zho: 'zh',
      zh: 'zh',
      fr: 'fr',
      pt: 'pt',
      ko: 'ko',
      es: 'es',
      vi: 'vi',
      fil: 'tl',
      in: 'id',
      id: 'id',
      my: 'my',
    };
    let langugeChange;
    if (languagee) {
      let str = languagee;
      let firstHyphenIndex = str.indexOf('-');

      if (firstHyphenIndex !== -1) {
        langugeChange = str.slice(0, firstHyphenIndex);
      } else {
        langugeChange = str;
      }
    }
    let reqLanguage = language_obj[langugeChange];
    reqLanguage = reqLanguage == undefined ? 'en' : reqLanguage;

    return reqLanguage;
  }
  getAuthToken(headers: object): string {
    return headers['authorization'];
  }

  formatToken(token: string): string {
    if (token.startsWith('Bearer ')) {
      return token.substring(7);
    }
    return token;
  }

  utcDateTime = (date = new Date()) => {
    date = new Date(date);
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
      ),
    );
  };
}
