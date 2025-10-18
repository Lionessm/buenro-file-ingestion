import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PropertiesDocument = PropertiesModel & Document;

@Schema({ 
  timestamps: true,
  strict: false,
  versionKey: false,
  collection: 'properties'
})

export class PropertiesModel {
  @Prop({ type: Object, required: true })
  data: any;

  @Prop({ required: true })
  source: string;

  @Prop()
  batchId?: string;

  @Prop()
  originalId?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PropertiesSchema = SchemaFactory.createForClass(PropertiesModel);
