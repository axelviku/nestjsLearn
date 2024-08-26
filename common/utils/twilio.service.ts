import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { MyLogger } from 'apis/src/my-logger.service';
import { constant } from 'common/constant/constant';

@Injectable()
export class TwilioService {
  private twilioVerifyServiceId: string;
  private twilioVerifyFromEmail: string;
  private twilioVerifyEmailTemplateId: string;
  private twilioVerifyEmailFromName: string;

  constructor(private twilioClient: Twilio, private readonly logger: MyLogger) {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    this.twilioVerifyServiceId = process.env.TWILIO_VERIFY_SERVICE_ID;
    this.twilioVerifyEmailTemplateId =
      process.env.TWILIO_VERIFY_EMAIL_TEMPLATE_ID;
    this.twilioVerifyFromEmail = process.env.TWILIO_VERIFY_FROM_EMAIL;
    this.twilioVerifyEmailFromName = process.env.TWILIO_VERIFY_EMAIL_FROM_NAME;
    this.twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }

  async twilioRequestPhoneOtp(requestOtp: any) {
    const formattedPhoneNumber: string = `${requestOtp.countryCode}${requestOtp.phone}`;
    const result = await this.twilioClient.verify.v2
      .services(this.twilioVerifyServiceId)
      .verifications.create({
        channel: constant.CHANNEL_TYPE_SMS,
        to: formattedPhoneNumber,
      });
    this.logger.log(`twilioRequestPhoneOtp====> Twilio Response : `, result);
    return result;
  }

  async twilioVerifyPhoneOtp(otp: {
    otp: string;
    countryCode: string;
    phone: string;
  }) {
    try {
      const formattedPhoneNumber: string = `${otp.countryCode}${otp.phone}`;
      this.logger.log(
        `twilioVerifyPhoneOtp====> formattedPhoneNumber : `,
        formattedPhoneNumber,
      );
      const result = await this.twilioClient.verify.v2
        .services(this.twilioVerifyServiceId)
        .verificationChecks.create({
          code: otp.otp,
          to: formattedPhoneNumber,
        });
      this.logger.log(`twilioVerifyPhoneOtp====> Twilio Response : `, result);
      return { success: true, info: result };
    } catch (error) {
      this.logger.error(`twilioVerifyPhoneOtp====> Twilio error : `, error);
      if (error && error.status && error.status === 404) {
        return { success: false, info: {} };
      } else {
        return { success: false, info: {} };
      }
    }
  }

  async twilioRequestEmailOtp(email: string) {
    const result = await this.twilioClient.verify.v2
      .services(this.twilioVerifyServiceId)
      .verifications.create({
        channel: constant.CHANNEL_TYPE_EMAIL,
        channelConfiguration: {
          template_id: this.twilioVerifyEmailTemplateId,
          from: this.twilioVerifyFromEmail,
          from_name: this.twilioVerifyEmailFromName,
        },
        to: email,
      });
    this.logger.log(`twilioRequestEmailOtp====> Twilio Response : `, result);
    return result;
  }

  async twilioVerifyEmailOtp(requestOtp: { otp: string; email: string }) {
    try {
      const result = await this.twilioClient.verify.v2
        .services(this.twilioVerifyServiceId)
        .verificationChecks.create({
          code: requestOtp.otp,
          to: requestOtp.email,
        });
      this.logger.log(`twilioVerifyEmailOtp====> Twilio Response : `, result);
      return { success: true, info: result };
    } catch (error) {
      this.logger.error(`twilioVerifyEmailOtp====> Twilio error : `, error);
      if (error && error.status && error.status === 404) {
        return { success: false, info: {} };
      } else {
        return { success: false, info: {} };
      }
    }
  }
}
