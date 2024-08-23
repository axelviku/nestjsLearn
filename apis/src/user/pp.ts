import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { StripeService } from 'common/utils/stripe.service';
import { User } from 'common/schemas/user.schema';
import { MyLogger } from '../my-logger.service';
import { UtilityService } from 'common/utils/utils.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly stripeService: StripeService,
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
    private readonly utilService: UtilityService,
  ) { }

  async addCard(userDetail: any, cardDetails: any, applanguage: string): Promise<object> {
    try {
      this.logger.log(`/payment/addCard/=====>`);
      let customerType: string;
      let customerStripeId: string;
      if (!userDetail.stripeInfo?.customerId) {
        const customer: any = await this.stripeService.createCustomer(userDetail.email, userDetail.fullName);
        if (customer.success === false) {
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
      
      if (token.success === false) {
        console.log("error token");
        const data = await this.stripeService.paymentMessage(token.tokenDetail.raw,applanguage);
        return {
          success: false,
          info: {
          },
          message: data
        }
      }
      const card: any = await this.stripeService.createSource(customerStripeId, token.tokenDetail.id);
      if (card.success === false) {
        console.log("error card"); 
        const data = await this.stripeService.paymentMessage(card.cardDetails.raw,applanguage);
        return {
          success: false,
          info: {
          },
          message: data
        }
      }
      await this.stripeService.setDefaultCard(customerStripeId, card.cardDetails.id);

      await this.userModel.updateMany(
        { _id: userDetail._id },
        { $set: { 'stripeInfo.cardData.$[elem].isDefault': false } },
        { arrayFilters: [{ 'elem.isDefault': true }] }
      );

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
      let chargeAmount: number = 1 * 100;
      
      const chargeCreate = await this.stripeService.stripeChargePayment(userDetail._id, card.cardDetails.id, chargeAmount, updatedCurrency, customerStripeId, price, cardBrand);
      if (chargeCreate.success === false) {
        return {
          success: false,
          info: {
          },
          message: chargeCreate.chargeCreate
        }
      }
      this.logger.log(`/payment/addCard/ Charge 1 =====>`, chargeCreate.success);
      const refund = await this.stripeService.stripeRefundPayment(userDetail._id);

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
}

