import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated',
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },
  toObject: {
    getters: true,
    virtuals: true,
  },
})
export class Sequence extends Document {
  @Prop({ required: true })
  model_name: string;

  @Prop({ default: 0 })
  seq: number;

  static getNext: (model_name: string) => Promise<Sequence>;
}

export const SequenceSchema = SchemaFactory.createForClass(Sequence);

SequenceSchema.statics.getNext = async function (
  model_name: string,
): Promise<Sequence> {
  return this.findOneAndUpdate(
    { model_name },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  ).exec();
};
