import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'common/schemas/user.schema';
import { Transaction } from 'common/schemas/transaction.schema';
import { MyLogger } from 'apis/src/my-logger.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    private readonly logger : MyLogger,
    private readonly i18n :I18nService
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async createCustomer(email: string, name?: string) {
    try {
      const customer = await this.stripe.customers.create({
        email: email,
        name: name,
      });
      return { success: true, customerId: customer.id };
    } catch (error) {
      return { success: false, customer: 'error' }
    }
  }

  async createToken(data: { cardNumber: string, month: string, year: string, cvc: string }) {
    try {
      const token = await this.stripe.tokens.create({
        card: {
          number: data.cardNumber,
          exp_month: data.month,
          exp_year: data.year,
          cvc: data.cvc,
        },
      });
      return { success: true, tokenDetail: token };
    } catch (error) {
      return { success: false, tokenDetail: error }
    }
  }

  async createSource(customerStripeId: string, token: any) {
    try {
      const card = await this.stripe.customers.createSource(customerStripeId, { source: token });
      return { success: true, cardDetails: card }
    } catch (error) {
      return { success: false, cardDetails: error }
    }
  }

  async setDefaultCard(customerStripeId: string, cardId: any) {
    try {
      const data = await this.stripe.customers.update(customerStripeId, {
        default_source: cardId,
      });
      return { success: true, defaultCard: data }
    } catch (error) {
      return { success: false, defaultCard: error }
    }
  }

  async deleteUser(customer: any, id: any) {
    try {
      const data = this.stripe.customers.deleteSource(customer, id);
      return { success: true, defaultCard: data }
    } catch (error) {
      return { success: false, defaultCard: error }
    }
  }

  async getDefaultCardInDb(userId: string) {
    if (userId) {
      const userData: any = await this.userModel.findOne({ _id: userId }, { 'stripeInfo.cardData': 1 });
      if (userData) {
        for (let i = 0; i < userData.stripeInfo.cardData.length; i++) {
          if (userData.stripeInfo.cardData[i].isDefault == true) {
            return { success: true, cardId: userData.stripeInfo.cardData[i].cardId };
          }
        }
      }
    } else {
      return { success: false, cardId: '' };
    }
  }

  async stripeChargePayment(
    userId: string,
    cardId: string,
    chargeAmount: number,
    currency: string,
    customerStripeId: string,
    price: number,
    cardBrand: string
  ) {
    try {
      let currencydata: any = currency;
      if (cardBrand === "JCB") {
        currencydata = "JPY";
        const currencyRates = (global as any).currencyRates;
        const stripePrice = parseFloat((price * currencyRates["USD"]["JPY"]).toFixed(2));
        chargeAmount = Math.round(stripePrice);
      }

      // Create a charge using Stripe
      const charge = await this.stripe.charges.create({
        amount: chargeAmount,
        currency: currencydata,
        customer: customerStripeId,
      });

      // If charge is successful, update user card data
      const objUpdatedData = {
        "stripeInfo.cardData.$.chargeId": charge.id,
        "stripeInfo.cardData.$.isVerified": "APPROVED",
        "stripeInfo.cardData.$.isRefunded": false,
        "stripeInfo.cardData.$.type": "NORMAL",
      };

      await this.userModel.updateOne(
        { _id: userId, "stripeInfo.cardData.cardId": cardId },
        { $set: objUpdatedData },
      ).exec();
      this.logger.log("/stripeChargePayment======>>",'Charge successful and user data updated')
      return {
        success: true,
        chargeCreate: charge
      }

    } catch (err) {
      this.logger.error("/stripeChargePayment ERROR -- SAVED IN TRANSACTION======>>", err.message)
      // Save the failed transaction data
      const newTransactionData = {
        userId: userId,
        gateway: 'stripe',
        type: 'credit',
        amount: chargeAmount,
        currency: currency,
        paymentId: '',
        status: 'failed',
        description: err.message || 'Unable to deduct amount',
      };

      const newTransaction = new this.transactionModel(newTransactionData);
      await newTransaction.save();

      // Update the user card data to reflect the declined status
      await this.userModel.updateOne(
        { _id: userId, " 'stripeInfo.cardData'.cardId": cardId },
        { $set: { "stripeInfo.cardData.$.isVerified": "DECLINED" } },
      ).exec();

      this.logger.error("/stripeChargePayment 'Transaction failed and user card data updated'======>>", err.message)
     return {
      success: true,
      chargeCreate: err.message
     }
    }
  }


  async stripeRefundPayment(userId: string) {
    try {
      let query: any = {
        'status.isActive': true,
        'status.isSelfdelete': false,
        'stripeInfo.cardData': { $elemMatch: { isRefunded: false } },
      };

      if (userId && userId !== '') {
        query._id = userId;
      }

      const users: any = await this.userModel.find(query).select('stripeInfo.cardData').exec();
      if (users && users.length > 0) {
        for (const user of users) {
          for (const card of user.stripeInfo.cardData) {
            if (card.isRefunded === false) {
              try {
                // Create a refund
                const data = await this.stripe.refunds.create({
                  charge: card.chargeId,
                  reason: 'requested_by_customer',
                  metadata: {
                    reason: 'requested_by_customer',
                  },
                });

                // Update the card data to mark it as refunded
                await this.userModel.updateOne(
                  {
                    _id: user._id,
                    'stripeInfo.cardData._id': card._id,
                  },
                  {
                    $set: { 'stripeInfo.cardData.$.isRefunded': true },
                  },
                ).exec();

                
                console.log('/addCard/Refund success=========>>>>');
                return { success: true , refund :data}
              } catch (error) {
                return { status: false , refund: error.message }
              }
            }
          }
        }
      } else {
        this.logger.log("/stripeChargePaymentSTRIPE REFUND RECORD NOT FOUND======>>",)
      }
    } catch (error) {
      this.logger.error("/stripeChargePayment Error in processing refunds======>>",error)
      return { status: false, refund :error.message};
    }
  }
  async paymentMessage(code:any,applanguage : string){
    let messageDisplay = ""
    if (code.code == 'incorrect_number') {
      messageDisplay = this.i18n.t('lang.INCORRECT_NUMBER', { lang: applanguage })
    } else if (code.code == 'card_declined') {
      messageDisplay = this.i18n.t('lang.CARD_DECLINED', { lang: applanguage })
    } else if (code.code == 'expired_card') {
      messageDisplay = this.i18n.t('lang.EXPIRED_CARD', { lang: applanguage })
    } else if (code.code == 'incorrect_cvc') {
      messageDisplay = this.i18n.t('lang.INCORRECT_CVC', { lang: applanguage })
    } else {
      messageDisplay = code.message
    }
    return messageDisplay
  }
}
