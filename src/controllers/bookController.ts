import {  Request, Response } from 'express';
import Book from '../models/bookModel';



export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error });
  }
};

export const addBook = async (req: Request, res: Response) => {
  try {
    const { title, author, gradeLevel, subject, series, coverImageUrl } = req.body;
    const newBook = new Book({ title, author, gradeLevel, subject, series, coverImageUrl });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: 'Error adding book', error });
  }
};
