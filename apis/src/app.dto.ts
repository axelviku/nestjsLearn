import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class CreateUserDto {
  firstName: string;
  lastName: string;
  avatar: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export class CountryIdDto{
  @IsNotEmpty()
  @ApiProperty({
    example: "661e7820f4b90ab296aa9d08",
    required: true,
  })
  countryId : string
}


export class CountryBody{  
  @IsNotEmpty()
  @ApiProperty({
    example: "SIGN_UP/HOME",
   required: true,
  })
  type : string
}