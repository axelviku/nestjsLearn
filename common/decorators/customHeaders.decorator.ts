import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { SetMetadata } from '@nestjs/common';
export function CustomHeaders() {
  return applyDecorators(
    ApiHeader({
      name: 'language',
      required: true,
      schema: { type: 'string', default: 'en', enum: ['en', 'jp', 'ko'] },
    }),
    ApiHeader({
      name: 'os',
      required: true,
      schema: { type: 'string', default: 'ios', enum: ['ios', 'android'] },
    }),
    ApiHeader({
      name: 'version',
      required: true,
      schema: {
        type: 'string',
        default: '1.0',
        pattern: '^\\d+\\.\\d+$',
      },
    }),
    ApiHeader({
      name: 'device_name',
      required: false,
      schema: {
        type: 'string',
        default: 'Iphone 1',
      },
    }),
    ApiHeader({
      name: 'device_version',
      required: false,
      schema: {
        type: 'string',
        default: '14.0.0',
        pattern: '^\\d+\\.\\d+\\.\\d+$',
      },
    }),
  );
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
