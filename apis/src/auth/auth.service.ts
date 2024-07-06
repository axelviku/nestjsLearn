import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestOtpSignUp } from './auth.dto';
import { I18nService } from 'nestjs-i18n';
import { EmailService } from 'common/email/email.service';

import e from 'express';
@Injectable()
export class AuthService {
  constructor(

    private readonly i18n: I18nService,
    private readonly emailService: EmailService,
  ) {}

  async Login(){
    
  }
}
