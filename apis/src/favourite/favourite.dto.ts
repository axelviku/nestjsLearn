import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsMongoId } from 'class-validator';

export class favouriteDataDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    required: true,
  })
  @IsMongoId({ message: 'Something went wrong !' })
  userId: string;
}
