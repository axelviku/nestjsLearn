import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UsageHistoryDataDto {
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: '2024-07-01',
    required: true,
  })
  startDate: string;

  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: '2024-07-30',
    required: true,
  })
  endDate: string;
}
