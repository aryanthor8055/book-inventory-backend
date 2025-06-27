import { NextFunction, Request, Response } from 'express';
import Book from '../models/bookModel';
import sharp from 'sharp';
import { extractBookDetails } from '../services/visionService';

export const processBookImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ 
        success: false,
        message: 'No image file provided' 
      });
      return;
    }

    let processedImage: Buffer;
    try {
      processedImage = await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (sharpError) {
      console.error('Image processing error:', sharpError);
      res.status(400).json({
        success: false,
        message: 'Failed to process image file'
      });
      return;
    }

    const bookDetails = await extractBookDetails(processedImage);
    
    res.json({
      success: true,
      data: {
        ...bookDetails,
        coverImage: processedImage.toString('base64'),
        coverImageType: 'image/jpeg'
      }
    });
    
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    const booksWithImages = books.map(book => ({
      ...book.toJSON(),
      coverImage: book.coverImage ? `data:${book.coverImageType};base64,${book.coverImage.toString('base64')}` : undefined
    }));
    res.json(booksWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error });
  }
};

export const addBook = async (req: Request, res: Response) => {
  try {
    const { title, author, gradeLevel, subject, series, coverImage, coverImageType } = req.body;
    const newBook = new Book({ 
      title, 
      author, 
      gradeLevel, 
      subject, 
      series,
      coverImage: coverImage ? Buffer.from(coverImage, 'base64') : undefined,
      coverImageType
    });
    await newBook.save();
    res.status(201).json({
      ...newBook.toJSON(),
      coverImage: newBook.coverImage ? `data:${newBook.coverImageType};base64,${newBook.coverImage.toString('base64')}` : undefined
    });
  } catch (error) {
    res.status(400).json({ message: 'Error adding book', error });
  }
};

export const searchBooks = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const books = await Book.find({
      $or: [
        { title: { $regex: query as string, $options: 'i' } },
        { author: { $regex: query as string, $options: 'i' } },
        { subject: { $regex: query as string, $options: 'i' } }
      ]
    });
    const booksWithImages = books.map(book => ({
      ...book.toJSON(),
      coverImage: book.coverImage ? `data:${book.coverImageType};base64,${book.coverImage.toString('base64')}` : undefined
    }));
    res.json(booksWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error searching books', error });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Book.findByIdAndDelete(id)
    res.json({ message: 'Book deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error })
  }
}