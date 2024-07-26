import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class MyLogger extends Logger {
  log(message: string, response: any = '') {
    //console.log(`[LOG] ${message}`, response);
    super.log(`${message}`, response);
  }

  error(message: string, trace: string) {
    //console.error(`[ERROR] ${message}`, trace);
    super.error(`${message}`, trace);
  }

  warn(message: string, response: any = '') {
    //console.warn(`[WARN] ${message}`);
    super.warn(`${message}`, response);
  }

  debug(message: string) {
    //console.debug(`[DEBUG] ${message}`);
    super.debug(`${message}`);
  }

  verbose(message: string) {
    //console.log(`[VERBOSE] ${message}`);
    super.verbose(`${message}`);
  }
}
