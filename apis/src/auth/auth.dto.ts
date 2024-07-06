import { IsNotEmpty} from 'class-validator';


export class RequestOtpSignUp{
    @IsNotEmpty()
    type : string

    @IsNotEmpty()
    username : any
}


