import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

interface EmailParams {
  to: string | string[];
  subject: string;
  template: string;
  context: any;
}

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
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

  private async renderTemplate(
    templatePath: string,
    context: any,
  ): Promise<string> {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(context);
  }
}
