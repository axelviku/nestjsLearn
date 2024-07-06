import { Injectable } from '@nestjs/common';
import * as jwt from "jsonwebtoken"
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
// import { User } from 'common/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model, Types } from 'mongoose';
@Injectable()
export class UtilityService {
    constructor(
        // @InjectModel(User.name) private readonly authModel: Model<User>
    ){}
    
    getAuthToken(headers: object): string {
        return headers['authorization'];
    }

    getPlatform(headers: object): string {
        return headers['oyraa-platform'];
    }

    formatToken( token:string ): string{
        if (token.startsWith("Bearer ")) {
            return token.substring(7);
        } 
        return token
    }

    signToken(userId: number, platform: string, authTokenIssuedAt: number): string {
        const payload = {
            sub: userId,
            iat: authTokenIssuedAt,
            aud: platform,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        return token
    }

    validTillTime(): number {
        return 15 * 60;
    }

    async comparePassword(oldPassword: string, password: string): Promise<boolean> {
        return await bcrypt.compare(oldPassword, password);
    }
    
    // async getUser(id: string): Promise<boolean> {
    //     return await this.authModel.findOne({_id: id},{password:0,__v : 0}).lean();
    // }

    getSlug(str:string,count?:number):string {
        str = str.toLowerCase();
        str = str.replace(/[^a-zA-Z0-9]+/g,'-');
        if(count) return str +"-"+ count;
        return str;
    };

    arrayToObject(array:string[]):any {
        return array.map(items => {
            return new Types.ObjectId(items)
        });
    };


    randomString(len: number, charSet?: string): string {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < len; i++) {
          const randomPoz = Math.floor(Math.random() * charSet.length);
          randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
      }
    
      encrypt(text: string): string {
        const cipher = crypto.createCipher('aes-256-cbc', 'your-encryption-key');
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
      }
    
      generateLoginToken(userId: string): string {
        return this.encrypt(userId + this.randomString(5));
      }
      

}