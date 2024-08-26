import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ResponseService {
  sendSuccessResponse(res: Response, data: any, message: any = ''): object {
    return res.status(200).json({ success: true, data, message });
  }

  sendBadRequest(res: Response, data: any, message: any = ''): object {
    return res.status(201).json({ success: false, data, message });
  }

  sendUnauthorize(res: Response, message: any = 'Unauthorize Request'): object {
    return res.status(401).json({ success: false, message });
  }

  sendForbidden(res: Response, message: any = 'Forbidden Error'): object {
    return res.status(403).json({ success: false, message });
  }

  sendNotFound(res: Response, message: any = '404 Not Found'): object {
    return res.status(404).json({ success: false, message });
  }

  sendServerError(
    res: Response,
    message: any = 'Internal Server Error',
  ): object {
    return res.status(500).json({ success: false, message });
  }
}
