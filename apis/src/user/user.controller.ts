import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UsePipes,
  Next,
  UseGuards,
  Put,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import {
  CustomHeaders,
  Public,
} from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ResponseService } from 'common/services/response.service';
import { UtilityService } from 'common/utils/utils.service';
import { OptionalGuard } from 'common/guards/optional-auth.guard';
// import { AtGuard } from 'common/guards/auth-guard';
import { AppService } from '../app.service';

declare module 'express' {
  export interface Request {
    user: any;
  }
}

@ApiTags('Auth')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
    private readonly appService: AppService,
  ) {}
}
