import * as AWS from 'aws-sdk';
import { User } from 'common/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from 'common/schemas/userRole.schema';
import { RequestOtp } from 'common/schemas/requestOtp.schema';
@Injectable()
export class CommonService {
  private sns: AWS.SNS;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRole>,
    @InjectModel(RequestOtp.name)
    private readonly requestOtpModel: Model<RequestOtp>,
  ) {}

  async userDetail(condition: any) {
    return await this.userModel.findOne(condition).populate('roleId');
  }
  async updateUserDetails(where: object, set: object) {
    return await this.userModel.updateOne(where, set);
  }

  async userRole(condition: string) {
    const data = await this.userRoleModel.findOne({ _id: condition });
    return { _id: data?._id, roleName: data?.name, slug: data?.slug };
  }

  async isEmailExist(email: string) {
    const information = await this.userModel.findOne({
      email,
      'status.isActive': true,
      'status.isDeleted': false,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async isPhoneExist(mobile: string) {
    const information = await this.userModel.findOne({
      mobile,
      'status.isActive': true,
      'status.isDeleted': false,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async isEmailVerified(email: string) {
    const information = await this.requestOtpModel.findOne({
      'requestOtpType.emailAddress': email,
      isVerified: true,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async isPhoneVerified(phone: string) {
    const information = await this.requestOtpModel.findOne({
      'requestOtpType.phoneNumber': phone,
      isVerified: true,
    });

    if (!information) {
      return { status: false, data: {} };
    }
    return { status: true, data: information };
  }

  async addHoursInCurrentTime(hours: number) {
    const currentTime = new Date();
    return new Date(currentTime.getTime() + hours * 60 * 60 * 1000);
  }

  async roleData(slugData: string) {
    return await this.userRoleModel
      .findOne({
        slug: slugData,
      })
      .select('_id slug');
  }
}
