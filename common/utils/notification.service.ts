import { Injectable } from "@nestjs/common";
import { I18nService } from 'nestjs-i18n';
import * as AWS from 'aws-sdk';
import { NotificationError } from '../schemas/notificationErr.schema';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MyLogger } from "apis/src/my-logger.service";


@Injectable()
export class PushNotificationService {
    private readonly sns: AWS.SNS;
    constructor(
        private readonly i18n: I18nService,
        private readonly logger: MyLogger,
        @InjectModel(NotificationError.name) private readonly notificationErrorModel: Model<NotificationError>
    ) {
        this.sns = new AWS.SNS({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
            region: process.env.AWS_S3_REGION,
        });
    }

    async sendNotification(notificationData: any, token: string) {
        try {
            var notifyMsg: string = ''
            var notificationMsg: string = ''
            const applanguage = notificationData.language
            if (token != undefined && token != "") {
                switch (notificationData.activity) {
                    case "new_call":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.NEW_CALL_NOTIFICATION', { lang: applanguage });
                        break;
                    case "new_conference":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.NEW_CONFERENCE_NOTIFICATION', { lang: applanguage });
                        break;
                    case "missed_call_ping":
                        notificationMsg = notificationData.interpreter_name + " " + this.i18n.t('lang.NOTIFICATION.MISSED_CALL_PING_NOTIFICATION', { lang: applanguage });
                        break;
                    case "Payment Due":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.LAST_PAYMENT_DUE_NOTIFICATION')
                        var notificationActivity = this.i18n.t('lang.NOTIFICATION.PAYMENT_DUE');
                        break;
                    case "New Job Request":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.YOU_JUST_RECEIVED_NEW_JOB_REQUEST');
                        break;
                    case "Payment Received":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.CONGRATS_USER_JUST_PAID_TO_YOU');
                        notificationMsg = notificationMsg.replace("[USERNAME]", notificationData.clientName);
                        notificationMsg = notificationMsg.replace("[CURRENCY]", notificationData.currency);
                        notificationMsg = notificationMsg.replace("[AMOUNT]", notificationData.amount);
                        var notificationActivity = this.i18n.t('lang.NOTIFICATION.PAYMENT_RECEIVED');
                        break;
                    case "Send Interpreter Call Request":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.SEND_INTERPRETER_CALL_REQUEST');
                        break;
                    case "Interpreter Approved Call Request":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.INTERPRETER_APPROVED_CALL_REQUEST');
                        break;
                    case "Customer Updated Call Request":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.SEND_CUSTOMER_UPDATED_CALL_REQUEST');
                        break;
                    case "Oyraa Notification":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.message');
                        break;
                    case "Other":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.message')
                        break;
                    case "disconnect_call":
                        notificationMsg = this.i18n.t('lang.NOTIFICATION.NEW_CALL_NOTIFICATION');
                        break;
                    default:
                        notificationMsg = "";
                }

                var notificaitonPayload = JSON.stringify({
                    data: {
                        message: notificationMsg,
                        activity: notificationActivity && notificationActivity != "" ? notificationActivity : notificationData.activity,
                        userId: notificationData.userId,
                    },
                });

                if (notificationData.os == "android") {
                    var payload = JSON.stringify({
                        GCM: notificaitonPayload,
                    });
                } else if (notificationData.os == "ios") {
                    var app_env_fun = process.env.PUSH_NOTIFICATION_ENVIRONMENT;
                    var app_env = app_env_fun != "production" ? "sandbox" : "production";
                    if (app_env == "sandbox") {
                        var payload = JSON.stringify({
                            APNS_SANDBOX: JSON.stringify({
                                aps: {
                                    alert: notificationMsg,
                                    sound: "default",
                                    badge: parseInt(notificationData.badge) + 1,
                                    "content-available": 1,
                                },
                                activity: notificationActivity && notificationActivity != "" ? notificationActivity : notificationData.activity,
                                userId: notificationData.userId,
                            }),
                        });
                    } else {
                        var payload = JSON.stringify({
                            APNS: JSON.stringify({
                                aps: {
                                    alert: notificationMsg,
                                    sound: "default",
                                    badge: parseInt(notificationData.badge) + 1,
                                },
                                activity: notificationActivity && notificationActivity != "" ? notificationActivity : notificationData.activity,
                                userId: notificationData.userId,
                            }),
                        });
                    }
                }
                await this.sendPush(payload, token);
            } else {
                this.logger.log(` sendNotification=====> else==>> empty Arn`);
                await this.saveNotification(payload, "", token, notificationData.os)
            }
        } catch (error) {
            this.logger.error(` sendNotification=====> error`,error);
        }
    }

    async sendPush(payload: any, endPointArn: string) {
        try {
            const dataSNS = await this.sns.publish(
                {
                    Message: payload,
                    MessageAttributes: {
                        Priority: {
                            DataType: "String",
                            StringValue: "high",
                        },
                    },
                    MessageStructure: "json",
                    TargetArn: endPointArn,
                }).promise();
                this.logger.log(`sendPush=====>>> success`,dataSNS);
        } catch (error) {
            this.logger.log(`sendPush=====>>> error`,error);
        }
    }

    async saveNotification(payload: any, voipArnToken: string, os: string, token: string) {
        const savePayload = {
            data: payload,
            voipArnToken: voipArnToken,
            os: os,
            arnToken: token
        };
        await this.notificationErrorModel.create({ data: savePayload });
    }
}

