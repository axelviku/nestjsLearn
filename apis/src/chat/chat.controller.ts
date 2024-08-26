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

import { ChatService } from './chat.service';
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
import { chatListDataDto, chatMessageDataDto } from './chat.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Chat')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'Chat List with Searching and Pagination.',
  })
  @ApiQuery({ name: 'page', type: String, example: '1' })
  @Post('/list')
  async listOfChat(
    @Query() allQueryParams: { page?: string },
    @Body() chatListData: chatListDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/chat/list/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(`/chat/list/=====> Login Data :  `, req['userdata']);
      this.logger.log(`/chat/list/=====> Request Body : `, chatListData);
      this.logger.log(`/chat/list/=====> Request Query : `, allQueryParams);

      const data = {
        paginationRequest: {
          currentPage: allQueryParams.page || 1,
          maxLimit: 50,
        },
        searchKeyword: chatListData.searchKeyword || '',
        displayedRecords: 100,
        adminChatLastMessage: {
          fullName: 'Oyraa Customer Support',
          _id: '66289a7de7e43d3a52c16e4e',
          photo: '',
          type: 'admin',
          msgType: 'text',
          msgUnreadCount: '0',
          isOnline: true,
          created: '24-07-2024:10:00UTC',
          message: 'You have a missed call from client.',
        },
        filteredRecords: [
          {
            fullName: 'Makoto',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            chatType: 'onetoone',
            msgType: 'text',
            msgUnreadCount: '2',
            isOnline: true,
            created: '26-07-2024:10:00UTC',
            message: 'Missed Call',
          },
          {
            fullName: 'Tamayo',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            chatType: 'onetoone',
            msgType: 'text',
            msgUnreadCount: '0',
            isOnline: true,
            created: '26-07-2024:10:00UTC',
            message: 'I Would like to request a Call on upcoming monday.',
          },
          {
            fullName: 'Ninon',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            chatType: 'group',
            type: 'user',
            msgType: 'image',
            msgUnreadCount: '1',
            isOnline: true,
            created: '29-07-2024:10:00UTC',
            message: '田中 美希 Sent a photo',
          },
        ],
      };

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(`/chat/list=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/chat/list=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'List Messages of Particular Chat with Pagination',
  })
  @ApiQuery({ name: 'page', type: String, example: '1' })
  @Post('/messages')
  async listOfChatMessages(
    @Query() allQueryParams: { page?: string },
    @Body() chatMessageData: chatMessageDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/chat/messages/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(`/chat/messages/=====> Login Data :  `, req['userdata']);
      this.logger.log(`/chat/messages/=====> Request Body : `, chatMessageData);
      this.logger.log(`/chat/messages/=====> Request Query : `, allQueryParams);

      const data = {
        paginationRequest: {
          currentPage: allQueryParams.page || 1,
          maxLimit: 50,
        },
        displayedRecords: 100,
        filteredRecords: [
          {
            fullName: 'Makoto',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            isRead: false,
            msgType: 'text',
            msgUnreadCount: '2',
            isOnline: true,
            created: '26-07-2024:10:00UTC',
            message: 'Missed Call',
          },
          {
            fullName: 'Ninon',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            isRead: false,
            msgType: 'image',
            msgUnreadCount: '1',
            isOnline: true,
            created: '29-07-2024:10:00UTC',
            message: '田中 美希 Sent a photo',
          },
        ],
      };

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(`/chat/messages=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/chat/messages=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
