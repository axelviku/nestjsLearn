import { Body, Controller, Get, Post, Res, Req, UsePipes, Next, UseGuards } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AppService } from '../app.service';
import { CustomHeaders, Public } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe'
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth,ApiParam  } from '@nestjs/swagger';
import { ResponseService } from 'common/services/response.service';

@ApiTags("Auth")
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appService: AppService,
    private readonly responseService: ResponseService,
  ) {}
  
}