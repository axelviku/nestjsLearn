import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'common/schemas/user.schema';
import { Transaction } from 'common/schemas/transaction.schema';
import { MyLogger } from 'apis/src/my-logger.service';
import { I18nService } from 'nestjs-i18n';
import { constant } from 'common/constant/constant';
import { UtilityService } from './utils.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    private readonly logger: MyLogger,
    private readonly i18n: I18nService,
    private readonly utilService: UtilityService
  ) {
    this.stripe = new Stripe(process.env.NODE_ENV == 'development' ? process.env.STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async createCustomer(email: string, name: string, countryCode: string) {
    try {
      const customer = await this.stripe.customers.create({
        email: email,
        name: name,
        address: {
          country: countryCode
        }
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
      if (cardBrand === constant.JCB) {
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
        "stripeInfo.cardData.$.isVerified": constant.APPROVED,
        "stripeInfo.cardData.$.isRefunded": false,
        "stripeInfo.cardData.$.type": constant.NORMAL,
      };

      await this.userModel.updateOne(
        { _id: userId, "stripeInfo.cardData.cardId": cardId },
        { $set: objUpdatedData },
      ).exec();
      this.logger.log("/stripeChargePayment======>>", 'Charge successful and user data updated')
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


  async stripeRefundPayment(userId: string, cardId: string) {
    try {
      let query: any = {
        'status.isActive': true,
        'status.isSelfdelete': false,
        'stripeInfo.cardData': { $elemMatch: { isRefunded: false } },
      };

      if (userId && userId !== '') {
        query._id = userId;
      }

      const users: any = await this.userModel.findOne(query).select('stripeInfo.cardData').exec();
      if (users) {
        let findCardData = users.stripeInfo.cardData.filter(updateRefund => updateRefund.isRefunded === false && updateRefund.cardId == cardId);
        try {
          // Create a refund
          const data = await this.stripe.refunds.create({
            charge: findCardData[0].chargeId,
            reason: 'requested_by_customer',
            metadata: {
              reason: 'requested_by_customer',
            },
          });

          // Update the card data to mark it as refunded
          await this.userModel.updateOne(
            {
              _id: userId,
              'stripeInfo.cardData._id': findCardData[0]._id,
            },
            {
              $set: { 'stripeInfo.cardData.$.isRefunded': true },
            },
          ).exec();
          console.log('/addCard/Refund success=========>>>>');
          return { success: true, refund: data }
        } catch (error) {
          return { success: false, refund: error.message }
        }
      } else {
        this.logger.log("/stripeChargePaymentSTRIPE REFUND RECORD NOT FOUND======>>",)
      }
    } catch (error) {
      this.logger.error("/stripeChargePayment Error in processing refunds======>>", error)
      return { success: false, refund: error.message };
    }
  }

  async paymentMessage(code: any, applanguage: string) {
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

  async quickpayWithInvoice(cardId: string, amount: number, currency: string, customerId: string, description: string) {
    try {
      let invoiceItemId = '';
      console.log("quickpayWithInvoice=====> invoice item creation !! ", cardId, amount, currency, customerId, process.env.OYRAA_CONSUMPTION_TAX, process.env.OYRAA_SERVICE_CHARGE);

      if (amount && currency && customerId) {
        console.log("quickpayWithInvoice=====> invoice item creation !! ");
        try {
          // Update the customer with default payment method

          const dd = await this.stripe.customers.update(customerId, {
            default_source: cardId,
            invoice_settings: { default_payment_method: cardId },
          });

          // Create invoice item
          const invoiceItem: any = await this.stripe.invoiceItems.create({
            customer: customerId,
            description: description,
            unit_amount: amount, // Amount in cents
            currency:currency,
            quantity: 1,
          });

          // console.log("--------------", invoiceItem);
          invoiceItemId = invoiceItem.id;

          // Create invoice
          const invoice = await this.stripe.invoices.create({
            customer: invoiceItem.customer,
            currency: currency,
            collection_method: "charge_automatically",
            default_tax_rates: [
              process.env.OYRAA_CONSUMPTION_TAX,
              process.env.OYRAA_SERVICE_CHARGE,
            ],
            default_source: cardId,
            auto_advance: true,
            pending_invoice_items_behavior: 'include'
          });
          let paymentResult: any;
          if (cardId) {
            console.log("quickpayWithInvoice=====> invoice creation ====> Pay With SOURCE ID !! ",);
            paymentResult = await this.stripe.invoices.pay(invoice.id, {
              source: cardId,
            });
          } else {
            console.log("quickpayWithInvoice=====> invoice creation ====> Pay Without SOURCE ID !! ");
            paymentResult = await this.stripe.invoices.pay(invoice.id);
          }

          if (paymentResult && paymentResult.status === "paid") {
            console.log("quickpayWithInvoice=====> Payment success paid case !! " );
            return {
              id: paymentResult.charge,
              invoice_url: paymentResult.hosted_invoice_url,
              service_fee_amount: paymentResult.total_tax_amounts[1]?.amount / 100,
              consumption_tax_amount: paymentResult.total_tax_amounts[0]?.amount / 100,
            };
          } else {
            console.log("quickpayWithInvoice=====> Payment fail case !! ");
            return { success: false, message: "Payment failed" }
          }
        } catch (err) {
          console.error("quickpayWithInvoice=====> Error: ", err);
          if (invoiceItemId) {
            // Delete the invoice item if there's an error
            await this.stripe.invoiceItems.del(invoiceItemId);
          }
          return { success: false, message: err.message }
        }
      } else {
        console.log("payWithInvoiceForQuickPay=====> else case -> EMPTY !!");
        return { success: false, message: "Invalid payment data" }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async getPricesQuickPay(amount: number, priceDetails: any) {
    try {
      const currencyRates = (global as any).currencyRates;
      const totalAmount = amount;
      // totalAmount to credits
      const usedCredits = await this.utilService.roundCurrency(
        priceDetails.creditsCurrency,
        totalAmount * currencyRates[priceDetails.currency][priceDetails.creditsCurrency]
      );

     // Calculate earnings deduction and share
      const earningsDeduction = (usedCredits * 60) / 100;
      const share = parseFloat(((usedCredits - earningsDeduction) * currencyRates[priceDetails.creditsCurrency]["USD"]).toFixed(2));

     // Convert totalAmount to earning currency
      const totalAmount1 = await this.utilService.roundCurrency(
        priceDetails.earningCurrency,
        totalAmount * currencyRates[priceDetails.currency][priceDetails.earningCurrency]
      );

      //Calculate earnings
      const earnings = await this.utilService.roundCurrency(
        priceDetails.earningCurrency,
        (totalAmount1 * 60) / 100
      );

      //Return results through callback
      console.log("payment service",usedCredits,earnings,share);
      
      return {
        success:true,
        credits: usedCredits,
        earning: earnings,
        share: share,
      }
    } catch (error) {
      return {
        success:false, message :error.message
      }
    }
  }
}

