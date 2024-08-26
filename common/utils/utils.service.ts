import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
@Injectable()
export class UtilityService {
  private readonly algorithmCrypto = process.env.CRYPTO_ALGO;
  private readonly passwordKey = process.env.PASSWORD_KEY;
  private readonly iv = randomBytes(16);
  private async getKey(): Promise<Buffer> {
    return (await promisify(scrypt)(this.passwordKey, 'salt', 32)) as Buffer;
  }

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

  // encrypt(text: string): string {
  //   const cipher = crypto.createCipher('aes-256-cbc', 'your-encryption-key');
  //   let encrypted = cipher.update(text, 'utf8', 'hex');
  //   encrypted += cipher.final('hex');
  //   return encrypted;
  // }

  // decrypt(encryptedText: string): string {
  //   const decipher = crypto.createDecipher(
  //     'aes-256-cbc',
  //     'your-encryption-key',
  //   );
  //   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  //   decrypted += decipher.final('utf8');
  //   return decrypted;
  // }

  async encrypt(text: string): Promise<string> {
    const key = await this.getKey();
    const cipher = createCipheriv(this.algorithmCrypto, key, this.iv);
    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${this.iv.toString('hex')}:${encryptedText.toString('hex')}`;
  }

  async decrypt(encryptedText: string): Promise<string> {
    const [iv, content] = encryptedText.split(':');
    const key = await this.getKey();
    const decipher = createDecipheriv(
      this.algorithmCrypto,
      key,
      Buffer.from(iv, 'hex'),
    );
    const decryptedText = Buffer.concat([
      decipher.update(Buffer.from(content, 'hex')),
      decipher.final(),
    ]);
    return decryptedText.toString('utf8');
  }

  generateLoginToken(userId: string): Promise<string> {
    return this.encrypt(userId + this.randomString(5));
  }

  async dataMapperArray(dataArray: any, appLanguage: string) {
    const data = dataArray.map((objValue) => ({
      _id: objValue._id,
      name: objValue.name[appLanguage],
    }));
    return data;
  }

  utcDateTime = (date: Date = new Date(), minutesToAdd = 0): Date => {
    date = new Date(date);
    const utcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
      ),
    );

    utcDate.setMinutes(utcDate.getMinutes() + minutesToAdd);

    return utcDate;
  };

  async dataMapperObject(resourceId: any, appLanguage: string) {
    return {
      _id: resourceId._id,
      name: resourceId.name[appLanguage] || resourceId.name['en'],
    };
  }

  async comparePassword(
    oldPassword: string,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(oldPassword, password);
  }

  async addHoursInCuurentTime(hours: number) {
    const currentTime = new Date();
    return new Date(currentTime.getTime() + hours * 60 * 60 * 1000);
  }

  async roundCurrency(currency_code: any, amount: any) {
    let currencyRound = {};
    if (currencyRound[currency_code] == true) {
      const amt = parseInt(amount);
      return Math.round(amt);
    } else {
      return parseFloat((amount * 1).toFixed(2));
    }
  }

  async getUsersFreeMinutes(referralFreeMinutes: any) {
    if (referralFreeMinutes && referralFreeMinutes.remaningFreeMinutes) {
      if (referralFreeMinutes.remaningFreeMinutes > 0) {
        return referralFreeMinutes.remaningFreeMinutes;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  async getUsersFreeMinutesUserType(referralFreeMinutes: any) {
    if (referralFreeMinutes && referralFreeMinutes.freeSeconds) {
      if (referralFreeMinutes.freeSeconds > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
