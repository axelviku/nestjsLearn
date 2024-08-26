import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { I18nValidationPipe, I18nService } from 'nestjs-i18n';

@Injectable()
export class GlobalI18nValidationPipe
  extends I18nValidationPipe
  implements PipeTransform
{
  constructor(private readonly i18nService: I18nService) {
    super();
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      // Handle the error and customize the error messages
      const customErrors = [];
      if (error?.errors && Array.isArray(error.errors)) {
        for (const err of error.errors) {
          const errorMessage = err.constraints[Object.keys(err.constraints)[0]];
          customErrors.push(this.i18nService.t(errorMessage));
        }
      } else {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          // data: {customErrors},
          message:
            customErrors[0] || this.i18nService.t('validation.validationError'),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
