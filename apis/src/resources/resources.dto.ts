import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CountryIdDto {
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    required: true,
  })
  @IsMongoId({ message: 'Something went wrong !' })
  countryId: string;
}
