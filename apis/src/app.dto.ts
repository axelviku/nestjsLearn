import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CountryIdDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '661e7820f4b90ab296aa9d08',
    required: true,
  })
  countryId: string;
}
