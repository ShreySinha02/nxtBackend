import mongoose, { Document, Schema } from 'mongoose';
export interface IEmployee extends Document {
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'admin';
  isActive: boolean;
  refreshToken?: string;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}