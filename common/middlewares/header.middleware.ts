import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequiredHeaderMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {

    const route = `/${req.originalUrl.split('/').splice(1, 2).join('/')}`;
    const routeAction = `/${req.originalUrl.split('/').splice(1, 3).join('/').split('?')[0]}`;
    const excludeHeaderUrls = [
      '/auth/forgot_password',
      '/auth/reset_password',
      '/auth/password_reset',
      '/not_found',
      '/calls/voice'
    ];
  const excludeHeaders =
    excludeHeaderUrls.indexOf(route) !== -1 ||
    excludeHeaderUrls.indexOf(routeAction) !== -1;
  if (excludeHeaders) return next();

    const language = req.headers['language']
      ? req.headers['language']
      : undefined;
    const os = req.headers['os'] ? req.headers['os'] : undefined;
    const version = req.headers['version'] ? req.headers['version'] : undefined;
    const device_version = req.headers['device_version']
      ? req.headers['device_version']
      : undefined;
    const device_name = req.headers['device_name']
      ? req.headers['device_name']
      : undefined;


    if (
      language == undefined ||
      os == undefined ||
      version == undefined ||
      device_version == undefined ||
      device_name == undefined
    ) {
      return res.status(200).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide valid headers in the request.',
      });
    }
    next();
  }
}
