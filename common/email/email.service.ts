import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplate } from 'common/schemas/emailTemplate.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as sgTransport from 'nodemailer-sendgrid-transport';
import * as moment from 'moment';

interface EmailParams {
  to: string | string[];
  subject: string;
  template: string;
  context: any;
}

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplate>,
    private readonly configService: ConfigService,
  ) {
    // TODO -> WE HAVE SEND GRID API KEY WHY WE ARE USING SMTP HERE?

    this.transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    } as nodemailer.SendMailOptions);

    //vikrant
    const sendGridKey = this.configService.get<string>('SENDGRID_API_KEY');
    const SGoptions = {
      auth: {
        api_key: sendGridKey,
      },
    };
    this.transporter = nodemailer.createTransport(sgTransport(SGoptions));
  }

  async sendEmail({ to, subject, template, context }: EmailParams) {
    const templatePath = path.join(
      process.cwd(),
      '/common/email/templates',
      `${template}.hbs`,
    );
    const html = await this.renderTemplate(templatePath, context);
    const recipients = Array.isArray(to) ? to : [to];
    const mailOptions = {
      from: process.env.FROM_MAIL, // replace with your email
      to: recipients,
      subject,
      html,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailMailTemplate(
    templateName: string,
    data: any,
    deviceInfo: any,
    message: string,
    appLanguage: string,
  ) {
    const emailTemplate = await this.emailTemplateModel
      .findOne({ slug: templateName })
      .exec();
    if (!emailTemplate) {
      // throw new InternalServerErrorException('Email template not found');
    }
    let dbEmailData = emailTemplate.content[appLanguage];
    let dbEmailSubject = emailTemplate.subject[appLanguage];
    let deviceInfomation = {
      os: deviceInfo.os,
      appVersion: deviceInfo.version,
      deviceVersion: deviceInfo.device_version,
      language: deviceInfo.language,
    };
    const date = moment().utcOffset('+09:00').format('MM-DD-YYYY hh:mm:ss A');
    if (emailTemplate.slug == 'feedback-bug-report') {
      dbEmailData = dbEmailData.replace('[COMMENT]', message);
      dbEmailData = dbEmailData.replace(
        '[DEVICE_DETAIL]',
        JSON.stringify(deviceInfomation),
      );
      dbEmailData = dbEmailData.replace('[DATE]', `${'JST: ' + date}`);
      dbEmailData = dbEmailData.replace('[FROM]', data.fullName);
      dbEmailData = dbEmailData.replace('[EMAIL]', data.email);

    } else if (emailTemplate.slug == 'quick-pay-notiifcation') {
      dbEmailData = dbEmailData.replace('[USER_NAME]',data.name);
      dbEmailData = dbEmailData.replace('[CURRENCY]', data.CURRENCY);
      dbEmailData = dbEmailData.replace('[AMOUNT]', data.AMOUNT);
      dbEmailData = dbEmailData.replace('[INTERPRETER]', data.INTERPRETER);
      dbEmailData = dbEmailData.replace('[DATE]', `${'JST: ' + date}`);
    }
    const mailOptions = {
      from: process.env.FROM_MAIL,
      to: data.email,
      subject: dbEmailSubject,
      html: dbEmailData,
      bcc: process.env.BCC_MAIL,
    };
    await this.transporter.sendMail(mailOptions);
  }

  private async renderTemplate(
    templatePath: string,
    context: any,
  ): Promise<string> {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(context);
  }
}
