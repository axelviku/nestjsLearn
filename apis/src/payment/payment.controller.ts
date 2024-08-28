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
  Param,
  All,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { AuthGuard } from 'common/guards/auth-guard';

import { PaymentService } from './payment.service';
import { AppService } from '../app.service';
import { ResponseService } from 'common/services/response.service';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  addCardDataDto,
  deleteCardDataDto,
  setDefaultCardDataDto,
  sendAmountDto
} from './payment.dto';
import { userInfo } from 'os';
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Payment')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
    private readonly i18n : I18nService
  ) { }

  @ApiOperation({
    summary: 'Add Credit/Debit card of user.',
  })
  @Post('/addCard')
  async addCard(
    @Body() addCardData: addCardDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/payment/addCard/=====>`);
      const { _id, appLanguage, fullName, email, stripeInfo,personalInfo } = req['userData'];
      this.logger.log(
        `/payment/addCard/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(`/payment/addCard/=====> Request Body :  `, addCardData);

      const data: any = await this.paymentService.addCard({ _id: _id, fullName: fullName, email: email, stripeInfo: stripeInfo, personalInfo }, addCardData, appLanguage);;

      if (data && data.success === true) {
        this.responseService.sendSuccessResponse(
          res,
          data.info,
          data.message
        );
      } else {
        this.logger.warn(`/payment/addCard=====> No record found ! `);
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(`/payment/addCard=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Show list of cards registred by user.',
  })
  @Get('/listCards')
  async listCards(@Res() res: Response, @Req() req: Request): Promise<void> {
    try {
      this.logger.log(`/payment/listCards/=====>`);
      const { _id, stripeInfo, appLanguage } = req['userData'];
      this.logger.log(
        `/payment/listCards/=====> Login Data :  `,
        req['userdata'],
      );

      const data = { customerId: stripeInfo && stripeInfo.customerId ? stripeInfo.customerId : '', stripe : stripeInfo && stripeInfo.cardData ? stripeInfo.cardData :[] };

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          this.i18n.t('lang.CARD_LIST',{ lang : appLanguage})
        );
      } else {
        this.logger.warn(`/payment/listCards=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/payment/listCards=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Delete Credit/Debit card of user.',
  })
  @Post('/deleteCard')
  async deleteCard(
    @Body() deleteCardData: deleteCardDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/payment/deleteCard/=====>`);
      const { _id, stripeInfo, appLanguage } = req['userData'];
      this.logger.log(
        `/payment/deleteCard/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/payment/deleteCard/=====> Request Body :  `,
        deleteCardData,
      );

      const data:any = await this.paymentService.deleteCard(_id,stripeInfo,deleteCardData.cardId,appLanguage);

      if (data && data.success ===true) {
        this.responseService.sendSuccessResponse(
          res,
          {},
          data.message,
        );
      } else {
        this.logger.warn(`/payment/deleteCard=====> No record found ! `);
        this.responseService.sendBadRequest(res,{},data.message);
      }
    } catch (error) {
      this.logger.error(`/payment/deleteCard=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Set Default Card of the user.',
  })
  @Post('/setDefaultCard')
  async setDefaultCard(
    @Body() setDefaultCardData: setDefaultCardDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/payment/setDefaultCard/=====>`);
      const { _id, appLanguage } = req['userData'];
      this.logger.log(
        `/payment/setDefaultCard/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/payment/setDefaultCard/=====> Request Body :  `,
        setDefaultCardData,
      );

      const data : any = await this.paymentService.setDefaultCard(setDefaultCardData,_id,appLanguage);

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          {},
          data.message,
        );
      } else {
        this.logger.warn(`/payment/setDefaultCard=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/payment/setDefaultCard=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({ summary : 'Send money/tip to interpreter'})
  @Post('/sendPayment')
  async sendMoney (@Body() amountData : sendAmountDto,@Res() res: Response, @Req() req:Request): Promise<void>{
    try {
      const {_id,appLanguage,stripeInfo,fullName,currency} = req['userData']
      const data : any = await this.paymentService.quickPayByCard(amountData,stripeInfo,_id,fullName,currency,appLanguage);
      if(data && data.success && data.success === true ){
        this.responseService.sendSuccessResponse(res, data.info,data.message);
      }
    } catch (error) {
      console.log("controller",error);
      this.responseService.sendForbidden(res);
    }
  }
}
