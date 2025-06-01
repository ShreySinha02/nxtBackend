import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import e from "express";

// Interface for instance methods
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  role: "employee" | "admin";
  isActive: boolean;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  companyName: string;
  age: number;
  dob: Date;
  image: string;
  otp?: string;
  otpExpiry?: Date;
  otpVerified?: boolean;
}

// Interface for the model (optional if no static methods)
export interface IUserModel extends Model<IUser> {}

// Schema definition
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      // required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    refreshToken: { type: String },
    companyName: { type: String, required: true },
    age: { type: Number, required: true },
    dob: { type: Date, required: true },
    image: { type: String, required: true },
   

  },
  { timestamps: true }
);

const otpSchema = new Schema({
 otp: {
  type: String,
},
otpExpiry: {
  type: Date,
},
otpVerified: {
  type: Boolean,
  default: false,
},
email: {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
  unique: true, // Ensure unique email for OTP
  }
}
)
// Password hashing middleware
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Access Token method
userSchema.methods.generateAccessToken = function (): string {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.sign(
    { _id: this._id, role: this.role, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
};

// Refresh Token method
userSchema.methods.generateRefreshToken = function (): string {
  const secret = process.env.REFRESH_TOKEN_SECRET as Secret;
  const expiry = process.env.REFRESH_TOKEN_EXPIRY as string;

  if (!secret || !expiry) {
    throw new Error("Refresh token environment variables are not defined");
  }

  return jwt.sign(
    { _id: this._id, role: this.role, email: this.email },
    secret,
    { expiresIn: "1d" } // ✅ no type confusion now
  );
};

// Model export
export const User = mongoose.model<IUser, IUserModel>(
  "User",
  userSchema
);

export const OtpModel = mongoose.model("OtpModel", otpSchema);
