import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'common/schemas/user.schema';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { UtilityService } from 'common/utils/utils.service';
import { ChangePasswordDto } from './user.dto';
import { MyLogger } from '../my-logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly i18n: I18nService,
    private readonly utilityService: UtilityService,
    private readonly logger: MyLogger,
  ) {}

  async changePassword(
    language: string,
    changePasswordDto: ChangePasswordDto,
    userId: any,
  ): Promise<object> {
    const { currentPassword, password, newPassword } = changePasswordDto;
    try {
      this.logger.log(`user/changePassword/=====>`);
      if (password !== newPassword) {
        this.logger.warn(`user/changePassword/=====> Password not match!`);
        return {
          status: false,
          info: {},
          message: this.i18n.t('lang.PASSWORD_NOT_MATCH', { lang: language }),
        };
      }
      const userData = await this.userModel.findOne(
        {
          _id: userId,
          'status.isActive': true,
        },
        { password: 1 },
      );
      if (!userData) {
        this.logger.warn(`user/changePassword/=====> User not found!`);
        return {
          status: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: language }),
        };
      }
      const passwordMatched = await this.utilityService.comparePassword(
        currentPassword,
        userData.password,
      );
      if (!passwordMatched) {
        this.logger.warn(`user/changePassword/=====> Incorrect old password!`);
        return {
          status: false,
          info: {},
          message: this.i18n.t('lang.INCORRECT_OLD_PASSWORD', {
            lang: language,
          }),
        };
      }
      userData.password = newPassword;
      await userData.save();
      return {
        status: true,
        info: {},
        message: this.i18n.t('lang.PASSWORD_CHANGE_SUCCESSFULLY', {
          lang: language,
        }),
      };
    } catch (error) {
      this.logger.error(`user/changePassword/=====> Catch C Error : `, error);
      return {
        status: false,
        info: {},
        message: error.message,
      };
    }
  }
}
