import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Expertise extends Document {
  @Prop({
    type: Map,
    of: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      index: true,
    },
  })
  name: Map<string, string>;

  @Prop({ type: Boolean, default: false })
  isActive: boolean;
}

export const ExpertiseSchema = SchemaFactory.createForClass(Expertise);
