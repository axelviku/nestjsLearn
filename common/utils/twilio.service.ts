import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  constructor(private twilioClient: Twilio) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async twilioSendPhoneOtp(requestOtp: any) {
    const phoneNum: string = `${requestOtp.phone}${requestOtp.countryCode}`;
    const verification = await this.twilioClient.verify.v2
      .services(process.env.SERVICE)
      .verifications.create({
        channel: 'sms',
        to: phoneNum,
      });
    return verification;
  }

  async phoneOtpVerify(otp: {
    otp: string;
    countryCode: string;
    phone: string;
  }) {
    const phoneNum: string = `${otp.phone}${otp.countryCode}`;
    const verificationCheck = await this.twilioClient.verify.v2
      .services(process.env.SERVICE)
      .verificationChecks.create({
        code: otp.otp,
        to: phoneNum,
      });
    console.log(verificationCheck.status);
    return verificationCheck;
  }

  async sendEmail(email: string) {
    const verification = await this.twilioClient.verify.v2
      .services(process.env.SERVICE)
      .verifications.create({
        channel: 'email',
        channelConfiguration: {
          // template_id: "d-4f7abxxxxxxxxxxxx",
          from: 'oyraa@yopmail.com',
          from_name: 'Oyraa',
        },
        to: email,
      });
    return verification;
    // console.log(verification.sid);
  }

  async otpVerifyEmail(requestOtp: { otp: string; email: string }) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioClient = new Twilio(accountSid, authToken);
    const verification = await this.twilioClient.verify.v2
      .services(process.env.SERVICE)
      .verificationChecks.create({
        code: requestOtp.otp,
        to: requestOtp.email,
      });
    return verification;
    // console.log(verification.sid);
  }
}
