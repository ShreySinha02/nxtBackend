"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignupOtpAndCreateUser = exports.sendSignupOtp = void 0;
const user_model_1 = require("../models/user.model");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendSignupOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Email is required" });
        const existingUser = yield user_model_1.User.findOne({ email });
        const existingOtp = yield user_model_1.OtpModel.findOne({ email });
        if (existingOtp) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto_1.default.createHash("sha256").update(otp).digest("hex");
        yield user_model_1.OtpModel.create({ email, otp: hashedOtp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        yield transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "OTP for Signup",
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        });
        res.status(200).json({ message: "OTP sent to email" });
    }
    catch (error) {
        console.error("Signup OTP error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.sendSignupOtp = sendSignupOtp;
const verifySignupOtpAndCreateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Request body:", req.body);
        const { name, email, password, companyName, age, dob, otp } = req.body;
        const file = req.file;
        if (!otp || !email || !name || !password || !companyName || !age || !dob) {
            return res.status(400).json({ message: "All fields are required " });
        }
        // const user = await User.findOne({ email });
        const otpRecord = yield user_model_1.OtpModel.findOne({ email });
        if (!otpRecord || !otpRecord.otp || !otpRecord.otpExpiry) {
            return res.status(400).json({ message: "OTP not found" });
        }
        const hashedOtp = crypto_1.default.createHash("sha256").update(otp).digest("hex");
        if (otpRecord.otp !== hashedOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (otpRecord.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }
        yield user_model_1.OtpModel.deleteOne({ email });
        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: "Only PNG or JPG images allowed" });
        }
        const user = yield user_model_1.User.create({
            name,
            email,
            password,
            companyName,
            age,
            dob,
            image: file.filename,
        });
        // await user.save();
        const safeUser = yield user_model_1.User.findById(user._id).select("-password");
        res.status(201).json({
            message: "User created successfully",
            user: safeUser,
        });
    }
    catch (error) {
        console.error("User creation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.verifySignupOtpAndCreateUser = verifySignupOtpAndCreateUser;
