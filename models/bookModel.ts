import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  gradeLevel?: string;
  subject?: string;
  series?: string;
  coverImage?: Buffer;
  coverImageType?: string;
  createdAt: Date;
}

const bookSchema = new Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  gradeLevel: { type: String },
  subject: { type: String },
  series: { type: String },
  coverImage: { type: Buffer },
  coverImageType: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBook>('Book', bookSchema);