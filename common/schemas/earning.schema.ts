import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Earning extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true })
    lifetimeEarnedCredits: string;
 
    @Prop({ type: String, required: true })
    earnedCredits: string;
}

export const EarningSchema = SchemaFactory.createForClass(Earning);
