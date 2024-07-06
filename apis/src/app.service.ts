import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import { User } from '../../common/schemas/user.schema';
import { CreateUserDto } from './app.dto';
import { I18nService } from 'nestjs-i18n';

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

  getHello(): string {
    return 'Oyraa Server Running!';
  }

  getPlatform(headers: object): string {
    return headers['os'];
  }
  getApiVersion(headers: object): string {
    return headers['version'];
  }
  async getLanguage(headers: object): Promise<string> {
    return headers['language'];
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
