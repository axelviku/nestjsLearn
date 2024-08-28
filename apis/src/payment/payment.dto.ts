import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Matches } from 'class-validator';

export class addCardDataDto {
    @IsNotEmpty({ message: 'Please enter a valid Card Name.' })
    @ApiProperty({
        example: 'Vikrant Kumar',
        required: true,
    })
    cardName: string;

    @IsNotEmpty({ message: 'Please enter a valid Card number.' })
    @IsInt({ message: 'Card number should be a valid number' })
    @ApiProperty({
        example: 4242424242424242,
        required: true,
    })
    cardNumber: number;


    @IsInt({ message: 'Month should be a valid number' })
    @IsNotEmpty({ message: 'Please enter a valid month number.' })
    @ApiProperty({
        example: 1,
        required: true,
    })
    month: number;

    @IsInt({ message: 'Year should be a valid number' })
    @IsNotEmpty({ message: 'Please enter a valid Year.' })
    @ApiProperty({
        example: 2024,
        required: true,
    })
    year: number;

    @IsInt({ message: 'CVC should be a valid number' })
    @IsNotEmpty({ message: 'Please enter a valid CVC number.' })
    @ApiProperty({
        example: 123,
        required: true,
    })
    cvc: number;
}

export class deleteCardDataDto {
    @IsNotEmpty({ message: 'Please enter a valid cardId.' })
    @ApiProperty({
        example: "card_1PqCX5BmXDXZipJz86swFH6F",
        required: true
    })
    cardId: string
}

export class setDefaultCardDataDto {
    @IsNotEmpty({ message: 'Please enter a valid customerStripeId.' })
    @ApiProperty({
        example: 'cus_QhcUQSIIwxujm1',
        required: true,
    })
    customerStripeId: string;

    @IsNotEmpty({ message: 'Please enter a valid cardId.' })
    @ApiProperty({
        example: 'card_1PqDiIBmXDXZipJzlnmWZobi',
        required: true,
    })
    cardId: string;
}

export class sendAmountDto {
    @IsNotEmpty({ message: 'Please select amount' })
    @ApiProperty({
        example: 100,
        required: true
    })
    amount: number
    
    @IsNotEmpty({ message: 'Please enter valid carId' })
    @ApiProperty({
        example: 'card_1PqDiIBmXDXZipJzlnmWZobi',
        required: true
    })
    cardId: string

    @IsNotEmpty({ message: 'Please enter interpreterId' })
    @ApiProperty({
        example: '669a095ff75714f4fffa6e22',
        required: true
    })
    interpreterId: string

    @ApiPropertyOptional({
        example: 'Your interpretation skill is good. so i am happy with your skill and want to tip you money.',
    })
    description: string
}
