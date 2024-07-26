import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequiredHeaderMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const language = req.headers['language']
      ? req.headers['language']
      : undefined;
    const os = req.headers['os'] ? req.headers['os'] : undefined;
    const version = req.headers['version'] ? req.headers['version'] : undefined;
    const device_version = req.headers['device_version']
      ? req.headers['device_version']
      : undefined;

    if (
      language == undefined ||
      os == undefined ||
      version == undefined ||
      device_version == undefined
    ) {
      return res.status(200).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'check headers in request',
      });
    }

    next();
  }
}
