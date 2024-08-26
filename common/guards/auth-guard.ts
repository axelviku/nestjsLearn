import { User } from 'common/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException();
      }

      const cleanedToken = authHeader.replace('Bearer ', '');
      const user: any = await this.userModel
        .findOne({ 'token.login': cleanedToken, 'status.isActive': true })
        .select(
          '_id fullName email source favUsers userReferralCode interpreterInfo status personalInfo deviceInfo roleId recentUser stripeInfo unlimitedAccess referralFreeMinutes',
        )
        .populate({
          path: 'roleId',
          select: '_id name slug',
        })
        .populate({
          path: 'userReferralCode',
          select: ' assignedSpecificInterpreters isCallRateShown isCreditCardShown isFreeCallApply',
        }).populate({
          path: 'personalInfo.countryId',
          select: 'dialCode',
        });
         
      if (!user) {
        throw new UnauthorizedException();
      }
      try {
        const userObject = {
          _id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          personalInfo: user.personalInfo,
          favUsers: user.favUsers,
          source: user.source,
          roleId: user.roleId,
          userReferralCode: user.userReferralCode,
          status: user.status,
          interpreterInfo: user.interpreterInfo,
          timezone: user.deviceInfo.timezone,
          appLanguage: (await this.getLanguage(request.headers))
            ? await this.getLanguage(request.headers)
            : 'en',
          recentUser: user.recentUser,
          stripeInfo: user.stripeInfo,
          os: user.deviceInfo.os,
          currency: user.personalInfo.preferredCurrency,
          unlimitedAccess: user.unlimitedAccess,
          referralFreeMinutes: user.referralFreeMinutes,
        };
        request['userData'] = userObject;
        return true;
      } catch (e) {
        throw new UnauthorizedException();
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async getLanguage(headers: any): Promise<string> {
    try {
      // Define the mapping of language codes
      const languageMap: { [key: string]: string } = {
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
      // Extract the user language from headers
      const userLanguage = headers?.['language'] || '';
      // Extract the language code before any hyphens
      const languageCode = userLanguage.split('-')[0];
      // Get the corresponding language code from the map, default to 'en'
      const reqLanguage = languageMap[languageCode] || 'en';

      return reqLanguage;
    } catch (error) {
      console.error('Error determining language:', error);
      return 'en';
    }
  }
}
