import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Model, Types } from 'mongoose';
@Injectable()
export class UtilityService {
  getAuthToken(headers: object): string {
    return headers['authorization'];
  }

  getPlatform(headers: object): string {
    return headers['oyraa-platform'];
  }

  formatToken(token: string): string {
    if (token.startsWith('Bearer ')) {
      return token.substring(7);
    }
    return token;
  }

  validTillTime(): number {
    return 15 * 60;
  }

  getSlug(str: string, count?: number): string {
    str = str.toLowerCase();
    str = str.replace(/[^a-zA-Z0-9]+/g, '-');
    if (count) return str + '-' + count;
    return str;
  }

  arrayToObject(array: string[]): any {
    return array.map((items) => {
      return new Types.ObjectId(items);
    });
  }

  randomString(len: number, charSet?: string): string {
    charSet =
      charSet ||
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipher(
      'aes-256-cbc',
      'your-encryption-key',
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateLoginToken(userId: string): string {
    return this.encrypt(userId + this.randomString(5));
  }

  async dataMapper(dataArray: any, appLanguage: string) {
    const data = dataArray.map((objValue) => ({
      _id: objValue._id,
      name: objValue.name[appLanguage],
    }));
    return data;
  }
}
