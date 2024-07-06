import { Body, Controller, Get, Post, Res, Req, UsePipes, Next, UseGuards, Put } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { CustomHeaders, Public } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ResponseService } from 'common/services/response.service';
import { UtilityService } from 'common/utils/utils.service';
import { LogInDto } from './user.dto';
import { OptionalGuard } from 'common/guards/optional-auth.guard';
// import { AtGuard } from 'common/guards/auth-guard';
import { AppService } from '../app.service';

declare module "express" {
  export interface Request {
    user: any
  }
}

@ApiTags("Auth")
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
    private readonly appService: AppService,
    private readonly utilService :UtilityService
  ) { }
  @ApiOperation({ summary: 'Country Details' })
  @Post('/Login')
  async Login(@Body() loginBody: LogInDto,@Res() res: Response, @Req() req: Request): Promise<void> {
    try {
      const xyz:string=this.utilService.generateLoginToken('5aa7d2bb27afb022fa06a1b6');
      //const xxx = await this.userModel.updateOne({loginToken :xyz})
      console.log(xyz);
    } catch (error) {

    }
  }
}