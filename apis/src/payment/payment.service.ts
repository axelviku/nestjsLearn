import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { StripeService } from 'common/utils/stripe.service';
import { User } from 'common/schemas/user.schema';
import { MyLogger } from '../my-logger.service';
import { UtilityService } from 'common/utils/utils.service';
import { constant } from 'common/constant/constant';
import { Transaction } from 'common/schemas/transaction.schema';
import { QuickPay } from 'common/schemas/quickpay.schema';
import { EmailService } from 'common/email/email.service';
import { PushNotificationService } from 'common/utils/notification.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    @InjectModel(QuickPay.name) private readonly quickPayModel: Model<QuickPay>,
    private readonly stripeService: StripeService,
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
    private readonly utilService: UtilityService,
    private readonly emailService: EmailService,
    private readonly pushNotificationService: PushNotificationService,
  ) { }

  async addCard(userDetail: any, cardDetails: any, applanguage: string): Promise<object> {
    try {
      this.logger.log(`/payment/addCard/=====>`);
      let customerType: string;
      let customerStripeId: string;
      if (!userDetail.stripeInfo?.customerId) {
        const customer: any = await this.stripeService.createCustomer(userDetail.email, userDetail.fullName, userDetail.personalInfo.countryId.dialCode);
        if (customer && customer.success === false) {
          return {
            success: false,
            info: {
            },
            message: this.i18n.t('lang.ERROR_CUSTOMER', { lang: applanguage })
          }
        }
        customerType = 'new';
        customerStripeId = customer.customerId;
      } else {
        customerType = 'old';
        customerStripeId = userDetail.stripeInfo.customerId;
      }
      const token: any = await this.stripeService.createToken(cardDetails);

      if (token && token.success === false) {
        this.logger.error(`/payment/addCard/ card=====> token `, token);
        const data = await this.stripeService.paymentMessage(token.tokenDetail.raw, applanguage);
        return {
          success: false,
          info: {
          },
          message: data
        }
      }
      const card: any = await this.stripeService.createSource(customerStripeId, token.tokenDetail.id);
      if (card && card.success === false) {
        this.logger.error(`/payment/addCard/ card=====> error `, card);
        const data = await this.stripeService.paymentMessage(card.cardDetails.raw, applanguage);
        return {
          success: false,
          info: {
          },
          message: data
        }
      }
      await this.stripeService.setDefaultCard(customerStripeId, card.cardDetails.id);

      if (userDetail.stripeInfo && userDetail.stripeInfo.cardData) {
        await this.userModel.updateOne(
          { _id: userDetail._id },
          { $set: { 'stripeInfo.cardData.$[elem].isDefault': false } },
          { arrayFilters: [{ 'elem.isDefault': true }] }
        );
      }

      let cardBrand = card.cardDetails.brand ? card.cardDetails.brand : null;
      if (cardBrand && cardBrand === 'MasterCard') {
        cardBrand = cardBrand.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
      }

      const result = await this.userModel.updateOne(
        { _id: userDetail._id },
        {
          $set: { 'stripeInfo.customerId': customerStripeId },
          $push: {
            'stripeInfo.cardData': {
              _id: new mongoose.Types.ObjectId(),
              number: `xxxx-xxxx-xxxx-${card.cardDetails.last4}`,
              brand: cardBrand,
              name: card.name ? card.cardDetails.name : cardDetails.cardName || null,
              cardId: card.cardDetails.id,
              fingerPrint: card.cardDetails.fingerprint,
              isDefault: true
            },
          },
        },
      )
      if (result.modifiedCount === 0) {
        await this.stripeService.deleteUser(card.customer, card.cardDetails.id)
        return {
          success: false,
          info: {
          },
          message: this.i18n.t('lang.ERROR_CARD_ADD', { lang: applanguage })
        }
      }

      let price: any = 0;
      let updatedCurrency = 'USD';
      price = process.env.CARD_CHARGE_AMOUNT ? process.env.CARD_CHARGE_AMOUNT : 1;
      price = await this.utilService.roundCurrency("USD", price);
      let chargeAmount: any = parseInt(process.env.CARD_CHARGE_AMOUNT) * 100;

      const chargeCreate = await this.stripeService.stripeChargePayment(userDetail._id, card.cardDetails.id, chargeAmount, updatedCurrency, customerStripeId, price, cardBrand);
      if (chargeCreate.success === false) {
        this.logger.error(`/payment/addCard/ chargeCreate=====> error `, chargeCreate);
        return {
          success: false,
          info: {
          },
          message: chargeCreate.chargeCreate
        }
      }
      this.logger.log(`/payment/addCard/ Charge 1 =====>`, chargeCreate.success);
      const refund = await this.stripeService.stripeRefundPayment(userDetail._id, card.cardDetails.id);

      return {
        success: true,
        info: {
        },
        message: this.i18n.t('lang.CARD_ADD', { lang: applanguage })
      }
    } catch (error) {
      this.logger.error(`/payment/addCard/=====> error`, error);
      return {
        success: false,
        info: {
        },
        message: error.message
      }
    }
  }

  async setDefaultCard(cardData: { customerStripeId: any, cardId: string }, userId: string, appLanguage: string): Promise<object> {
    try {
      this.logger.log(`/payment/setDefaultCard/=====> `);
      const data: any = await this.stripeService.setDefaultCard(cardData.customerStripeId, cardData.cardId);
      if (data.success === true) {
        await this.userModel.updateMany(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { 'stripeInfo.cardData.$[elem].isDefault': false } },
          { arrayFilters: [{ 'elem.isDefault': true }] }
        ).exec();
        await this.userModel.updateOne(
          { _id: new mongoose.Types.ObjectId(userId), 'stripeInfo.cardData.cardId': cardData.cardId },
          { $set: { 'stripeInfo.cardData.$.isDefault': true } }
        ).exec();
        return {
          success: true,
          info: {
          },
          message: this.i18n.t('lang.DEFAULT_CARD', { lang: appLanguage })
        }
      } else {
        return {
          success: false,
          info: {
          },
          message: this.i18n.t('lang.ERROR_IN_ADDING_DEF_CARD', { lang: appLanguage })
        }
      }
    } catch (error) {
      this.logger.error(`/payment/setDefaultCard/=====> error`, error);
      return {
        success: false,
        info: {
        },
        message: error.message
      }
    }
  }

  async deleteCard(_id: string, stripeInfo: any, cardId: string, appLanguage: string): Promise<object> {
    try {
      this.logger.log(`/payment/deleteCard/=====> `,);
      const cardsLength = stripeInfo.cardData.length;
      const remainingCards = stripeInfo.cardData.filter(card => card.cardId !== cardId);

      const selectedCards = stripeInfo.cardData.filter(card => card.cardId === cardId);

      if (remainingCards.length >= cardsLength) {
        return {
          success: false,
          info: {
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: appLanguage })
        }
      }

      if (remainingCards.length > 0 && selectedCards[0]?.isDefault) {
        remainingCards[remainingCards.length - 1].isDefault = true;
      }

      try {
        const deleteCard: any = await this.stripeService.deleteUser(stripeInfo.customerId, cardId)
        if (deleteCard.success === false) {
          return {
            success: false,
            info: {},
            message: this.i18n.t('lang.ERROR_DELETE_CARD', { lang: appLanguage })
          }
        }
        await this.userModel.updateOne(
          { _id: new mongoose.Types.ObjectId(_id) },
          { $set: { 'stripeInfo.cardData': remainingCards } },
        ).exec();
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.CARD_REMOVE', { lang: appLanguage })
        }
      } catch (error) {
        this.logger.error(`/payment/deleteCard/=====> error`, error);
        return {
          success: false,
          info: {
          },
          message: error.message
        }
      }

    } catch (error) {
      this.logger.error(`/payment/deleteCard/=====> error`, error);
      return {
        success: false,
        info: {
        },
        message: error.message
      }
    }
  }

  async quickPayByCard(postBody: any, stripeInfo: any, _id: string, fullName: string, userCurrency: string, appLanguage: string): Promise<object> {
    try {
      const { cardId, amount, interpreterId, description } = postBody;
      const currencyRates = (global as any).currencyRates;
      const credits: any = await this.utilService.roundCurrency(userCurrency, amount);
      const price = parseFloat((credits * currencyRates[userCurrency]['USD']).toFixed(2));

      console.log('quickpay-bycard====> ', fullName, interpreterId);
      const interpreter: any = await this.userModel.findOne({
        _id: postBody.interpreterId,
        'status.isActive': true,
      })

      if (!interpreter) {
        return {
          success: false,
          info: {

          },
          message: 'Interpreter not found'
        }
      }
      let brand = ''
      for (let i = 0; i < stripeInfo.cardData.length; i++) {
        if (stripeInfo.cardData[i].cardId == cardId) {
          brand = stripeInfo.cardData[i].brand;
          break;
        }
      }

      let chargeAmount = Math.round(price * 100);
      let currency = 'USD';
      if (brand === constant.JCB) {
        currency = 'JPY';
        const stripePrice = parseFloat((credits * currencyRates[currency]['JPY']).toFixed(2));
        chargeAmount = Math.round(stripePrice);
      }
      try {
        const charge: any = await this.stripeService.quickpayWithInvoice(
          cardId,
          chargeAmount,
          currency,
          stripeInfo.customerId,
          'Quick Pay Amount',
        );
        console.log("charge", charge);

        let consumptionTaxAmount: number = 0;
        let serviceFeeAmount: number = 0;
        if (charge.currency === 'usd') {
          consumptionTaxAmount = charge.consumption_tax_amount / 100;
          serviceFeeAmount = charge.service_fee_amount / 100;
        } else {
          consumptionTaxAmount = parseFloat((charge.consumption_tax_amount * currencyRates['JPY']['USD']).toFixed(2));
          serviceFeeAmount = parseFloat((charge.service_fee_amount * currencyRates['JPY']['USD']).toFixed(2));
        }
        const newTransaction = {
          userId: _id,
          gateway: 'stripe',
          type: 'credit',
          amount: price,
          currency: 'USD',
          paymentId: charge.id,
          status: 'approved',
          consumptionTaxAmount,
          serviceFeeAmount,
        };

        await this.transactionModel.create(newTransaction);
        const details: any = {
          creditsCurrency: currency,
          earningCurrency: interpreter.personalInfo.preferredCurrency,
          shareCurrency: 'USD',
          currency: currency,
        };
        const priceData = await this.stripeService.getPricesQuickPay(amount, details)
        if (priceData.success == true) {
          details.credits = priceData.credits;
          details.earning = priceData.earning;
          details.share = priceData.share;
          details.userId = new mongoose.Types.ObjectId(_id);
          details.interpreterId = new mongoose.Types.ObjectId(interpreterId);
          details.description = description;
          details.consumptionTaxAmount = consumptionTaxAmount;
          details.serviceFeeAmount = serviceFeeAmount;
          details.consumptionTaxPercentage = process.env.CONSUMPTION_TAX_PERCENTAGE;
          details.serviceFeePercentage = process.env.SERVICE_FEE_PERCENTAGE;
          const savedQuickPay: any = await this.quickPayModel.create(details);

          await this.userModel.updateOne(
            { _id: interpreterId },
            { $inc: { earnedCredits: details.earning, lifetimeEarnedCredits: details.earning } },
          );

          if (interpreter._id && interpreter.token.arn) {
            const notificationData = {
            activity: 'Payment Received',
            os: interpreter.deviceInfo.os,
            badge: 0,
            language: interpreter.deviceInfo.language || 'en',
            userId: interpreter._id.toString(),
            clientName: fullName,
            currency: savedQuickPay.earningCurrency,
            amount: savedQuickPay.earning,
            };
            await this.pushNotificationService.sendNotification(notificationData, interpreter.token.arn);
          }
          const lang = interpreter.deviceInfo.language || 'en';
          await this.emailService.sendEmailMailTemplate(
            'quick-pay-notiifcation',
            {
              email: interpreter.email,
              INTERPRETER: interpreter.fullName,
              name: fullName,
              CURRENCY: savedQuickPay.earningCurrency,
              AMOUNT: savedQuickPay.earning,
            },
            '',
            '',
            lang,
          );
          return { success: true, info: {}, message: 'Quickpay amount successfully sent to Interpreter' };
        }
      } catch (err) {
        console.log("service ", err);
        const newTransaction = {
          userId: _id,
          gateway: 'stripe',
          type: 'credit',
          amount: price,
          currency: 'USD',
          paymentId: '',
          status: 'failed',
          description: err.message || 'Unable to deduct amount',
        };
        await this.transactionModel.create(newTransaction);
        return {
          success: false, info: {}, message: 'Payment failed'
        }
      }
    } catch (error) {
      console.log("Try1", error);
      return {
        success: false, info: {}, message: error.message
      }
    }
  }
}
