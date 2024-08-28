import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { CALL_TYPE } from 'common/enums';

@Schema({ timestamps: true })
export class Call extends Document {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  fromUserId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  toUserId: User;
  
  @Prop({ type: String, enum: [CALL_TYPE], default: 'onetoone' , required: [true, "can't be blank"]})
  callType: string;

  @Prop({
    type: {
      callConferenceMembers: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          callDuration: {type: Number, default:0},
          ringingDuration: {type: Number, default:0},
          callStatus: {type: String},
          callSid: { type: String }
        }
      ]
    },
    _id: false,
  })
  callConferenceMembers: {
    userId: Types.ObjectId;
    callDuration: Number;
    ringingDuration: Number;
    callStatus: String;
    callSid: String;
  }[];

}

export const CallSchema = SchemaFactory.createForClass(Call);
