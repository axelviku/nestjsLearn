import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types,SchemaTypes } from 'mongoose';


export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  ratedBy: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  callId: Types.ObjectId;


  @Prop({ type: Number })
  rating: number;

  @Prop({ type: String })
  comment : string

}

export const ReviewSchema = SchemaFactory.createForClass(Review);

