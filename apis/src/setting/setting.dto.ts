import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { DEVICE_PERMISSION_TYPE, CURRENCY } from 'common/enums';

export class languageCoverageDataDto {
  @IsOptional()
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
  })
  languageFrom: string;

  @IsOptional()
  @ApiProperty({
    example: '59c8ba74c0d97628bf7fec34',
  })
  languageTo: string;
}
export class updateDevicePermissionDataDto {
  @ApiProperty({
    example: 'fetch/post',
    required: true,
  })
  @IsEnum(DEVICE_PERMISSION_TYPE)
  type: string;

  @IsOptional()
  @ApiProperty({
    example: '90',
  })
  batteryPercentage: string;

  @IsOptional()
  @ApiProperty({
    example: '50',
  })
  callRingtoneVolume: string;

  @IsOptional()
  @ApiProperty({
    example: '30',
  })
  mediaVolume: string;

  @IsOptional()
  @ApiProperty({
    example: '80',
  })
  microphoneVolume: string;

  @IsOptional()
  @ApiProperty({
    example: 'high',
  })
  internetConnection: string;

  @IsOptional()
  @ApiProperty({
    example: true,
  })
  microphonePermission: string;

  @IsOptional()
  @ApiProperty({
    example: true,
  })
  batteryLowPowerModeStatus: boolean;

  @IsOptional()
  @ApiProperty({
    example: true,
  })
  pushNotificationPermission: boolean;

  @IsOptional()
  @ApiProperty({
    example: true,
  })
  appNotificationBadgePermission: boolean;

  @IsOptional()
  @ApiProperty({
    example: true,
  })
  notificationSoundSettings: boolean;

  @IsOptional()
  @ApiProperty({
    example: true,
  })
  appRunInTheBackgroundPermission: boolean;
}

export class updatePreferredCurrencyDataDto {
  @ApiProperty({
    example: 'USD/JPY/EUR/EUR/GBP/CNY/MXN',
    required: true,
  })
  @IsEnum(CURRENCY)
  currencyName: string;
}

export class sendInquiryReportDataDto {
  @ApiProperty({
    example: 'Feedback and bug report email message.',
    required: true,
  })
  message: string;
}
