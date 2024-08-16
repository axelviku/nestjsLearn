import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { HOME_GETUSER_LIST } from 'common/enums';

export class requestUserListAndAboutOyraaDataDto {
  @IsNotEmpty({ message: 'Please enter type' })
  @ApiProperty({
    example: 'client/interpreter/referral_user',
    required: true,
  })
  @IsEnum(HOME_GETUSER_LIST)
  type: string;
}
