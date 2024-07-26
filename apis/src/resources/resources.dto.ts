import { ApiProperty } from '@nestjs/swagger';

export class CountryIdDto {
  @ApiProperty({
    example: '669a095ff75714f4fffa6e22',
    required: true,
  })
  countryId: string;
}
