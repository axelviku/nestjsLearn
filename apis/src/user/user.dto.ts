import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Please enter current password' })
  @ApiProperty({
    example: 'current password',
    required: true,
  })
  currentPassword: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/,
    {
      message:
        'Password atleast 8 char one capital, one special chatarter and one number.',
    },
  )
  @IsNotEmpty({ message: 'Please enter password' })
  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/,
    {
      message:
        'New Password atleast 8 char one capital, one special chatarter and one number.',
    },
  )
  @IsNotEmpty({ message: 'Please enter new password' })
  @ApiProperty({
    example: 'new password',
    required: true,
  })
  newPassword: string;
}

export class UserProfileDataDto {
  @IsNotEmpty({ message: 'Please enter userId' })
  @IsMongoId({ message: 'Something went wrong !' })
  @ApiProperty({
    example: '59ca2eb54c5b0874203b7676',
    required: true,
  })
  userId: string;
}
