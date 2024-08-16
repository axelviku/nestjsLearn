import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agenda } from 'agenda';
import axios from 'axios';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as async from 'async';
import { Currency } from '../schemas/currency.schema';
import { CurrencyHistory } from '../schemas/currencyHistory.schema';
import { currenciesList } from 'common/constant/constant';
import { MyLogger } from 'apis/src/my-logger.service';
import { User } from 'common/schemas/user.schema';
import { Coverage } from 'common/schemas/coverage.schema';

@Injectable()
export class AgendaService implements OnModuleInit {
  private agenda: Agenda;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Coverage.name) private coverageModel: Model<Coverage>,
    @InjectModel(CurrencyHistory.name)
    private currencyHistoryModel: Model<CurrencyHistory>,
    private readonly logger: MyLogger,
  ) {
    const mongoUri = this.configService.get<string>('MONGO_URI');
    this.agenda = new Agenda({
      db: { address: mongoUri, collection: 'agendaJobs' },
    });
  }

  async onModuleInit() {
    await this.init();
  }

  async init() {
    this.agenda
      .on('ready', async () => {
        this.logger.log(`Agenda started!`);

        await this.defineJobs();
        await this.scheduleJobs();
      })
      .on('error', (error) => {
        this.logger.error(
          `Agenda connection error! =====> Catch S Error : `,
          error,
        );
      });

    await this.agenda.start();
  }

  async defineJobs() {
    this.agenda.define('open-exchange-currency-update', async (job, done) => {
      this.logger.log(
        'Cron Start =============> "open-exchange-currency-update"',
      );
      await this.currencyUpdateJob();
      done();
    });

    this.agenda.define('coverage-update', async (job, done) => {
      this.logger.log(
        'Cron Start =============> "coverage-update"',
      );
      await this.defineUpdateLanguageCoverageJob();
      done();
    });
  }

  async scheduleJobs() {
    // This agenda will run once in a day
    // '0 0 * * *' means it run "At 00:00 (midnight) every day
    await this.agenda.every('0 0 * * *', 'open-exchange-currency-update');

    // This agenda will run once in a day
   // '0 10 * * *' means it run "At 10:00AM (morning) every day  */1 * * * *
    await this.agenda.every('0 10 * * *', 'coverage-update');
  }

  async createCurrencyUpdate() {
    this.logger.log(
      `Cron Manually triggering ====================> "open-exchange-currency-update"`,
    );
    await this.agenda.now('open-exchange-currency-update', {});
  }

  async currencyUpdateJob() {
    const keyArr = Object.keys(currenciesList);
    const currencyApiKey = this.configService.get<string>('CURRENCY_API_KEY');
    const currencyApiEndpoint = this.configService.get<string>(
      'CURRENCY_API_ENDPOINT',
    );
    const url = `${currencyApiEndpoint}?app_id=${currencyApiKey}`;

    try {
      const response = await axios.get(url);
      const bodyJson = response.data;

      const currenciesArr = [];
      await async.eachSeries(keyArr, async (currencyCode) => {
        const exchangeRates = keyArr.map((key) => ({
          conversionToCurrency: key,
          conversionValue: (key === currencyCode
            ? 1
            : bodyJson.rates[key] / bodyJson.rates[currencyCode]
          ).toFixed(5),
        }));
        await this.currencyModel
          .updateOne(
            { baseCurrency: currencyCode },
            { $set: { exchangeRates } },
            { upsert: true },
          )
          .exec();

        currenciesArr.push({ baseCurrency: currencyCode, exchangeRates });
      });

      const newCurrency = new this.currencyHistoryModel({
        currencies: currenciesArr,
      });
      await newCurrency.save();
      this.logger.log(
        'Cron Complete Successfully =============> "open-exchange-currency-update"',
      );
    } catch (error) {
      this.logger.error(
        `Error In Cron  =============> "open-exchange-currency-update" =====> Catch S Error : `,
        error,
      );
    }
  }

 async defineUpdateLanguageCoverageJob() {
      const coverageArr = [];
      const coverageData:any = await this.userModel.aggregate([
        {
          $match: {
            roleId: new mongoose.Types.ObjectId("66a9d765eac12fe542939421"),
            'status.isActive': true,
            'status.isSelfdelete': false,
          },
        },
        {
          $unwind: '$interpreterInfo.interpreterRates',
        },
        {
          $redact: {
            $cond: {
              if: { $eq: ['$interpreterInfo.interpreterRates.fee', 0] },
              then: '$$PRUNE',
              else: '$$DESCEND',
            },
          },
        },
      ]);

      const occurrences = {};
      coverageData.forEach( async(item) => {
        // const [lang1, lang2] = item.rates.languages;
        const [lang1, lang2] = item.interpreterInfo.interpreterRates.languages;
        const sortedLanguages = lang1 > lang2 ? [lang1, lang2] : [lang2, lang1];
        const key = sortedLanguages.join(',');

        occurrences[key] = (occurrences[key] || 0) + 1;
      });

      for (const [key, value] of Object.entries(occurrences)) {
        const [lang1, lang2] = key.split(',');
        coverageArr.push({
          coverage: value,
          languages: [new mongoose.Types.ObjectId(lang1), new mongoose.Types.ObjectId(lang2)],
        });
      }
      await this.coverageModel.deleteMany({});
      await this.coverageModel.insertMany(coverageArr);
      this.logger.log(
        'Cron Complete Successfully =============> "coverage-update"',coverageArr
      );

  }
}
