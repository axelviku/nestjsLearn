import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Currency } from 'common/schemas/currency.schema';
import { InjectModel } from '@nestjs/mongoose';
import { currenciesList } from 'common/constant/constant';
import { Request, Response, NextFunction } from 'express';
import { MyLogger } from 'apis/src/my-logger.service';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectModel(Currency.name) private readonly currencyModel: Model<Currency>,
    private readonly logger: MyLogger,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const currencyRates = await this.getCurrencyRates();
      (global as any).currencyRates = currencyRates;

      const currencyRound = {};


      //Mange this for round currency
      const currencies:any = await this.currencyModel
          .find().exec();
          currencies.map(function (currency) {
        currency = currency.toObject();
        currencyRound[currency.baseCurrency] = currency.isRound;
      });
      (global as any).currencyRound = currencyRound;


    } catch (err) {
      this.logger.error(
        'currencyRates====> Failed to fetch currency rates => Error : ',
        err,
      );
    }
    next();
  }
  async getCurrencyRates(): Promise<{ [key: string]: any }> {
    const currencyRates: { [key: string]: any } = {};
    const currencyRatesOld: { [key: string]: any } = {};
    const keyArr = Object.keys(currenciesList);

    for (const currencyCode of keyArr) {
      currencyRates[currencyCode] = {};
      currencyRatesOld[currencyCode] = {};
      try {
        const currencies = await this.currencyModel
          .find({ baseCurrency: currencyCode })
          .sort({ updatedAt: -1 })
          .limit(1)
          .exec();

        if (currencies && currencies.length > 0) {
          currencies[0].exchangeRates.forEach((rate) => {
            currencyRatesOld[currencyCode][rate.conversionToCurrency] =
              rate.conversionValue;
            currencyRates[currencyCode][rate.conversionToCurrency] =
              currencyCode === rate.conversionToCurrency
                ? 1
                : rate.conversionValue;
          });
        }
      } catch (err) {
        this.logger.error(
          'getCurrencyRates====> Failed to fetch currency rates => Error :',
          err,
        );
      }
    }

    return currencyRates;
  }
  roundCurrency(currency_code: any, amount: any) {
    const currencyRound =  (global as any).currencyRound;
    if (currencyRound[currency_code] == true) {
      const amt = parseInt(amount);
      return Math.round(amt);
    } else {
      return parseFloat((amount * 1).toFixed(2));
    }
  }
}
