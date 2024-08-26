import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class chatListDataDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase(), { toClassOnly: true })
  @ApiProperty({
    example: 'Enter Messages description to search!!',
    required: true,
  })
  searchKeyword: string;
}

export class chatMessageDataDto {
  @IsNotEmpty({ message: 'Please enter chatId' })
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
    required: true,
  })
  chatId: string;
}
