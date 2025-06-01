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
exports.verifyOtp = exports.sendOtp = exports.logoutUser = void 0;
const user_model_1 = require("../models/user.model");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Utility: Generate Access and Refresh Tokens
const generateAccessAndRefreshTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield user_model_1.User.findById(userId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        const accessToken = employee.generateAccessToken();
        const refreshToken = employee.generateRefreshToken();
        employee.refreshToken = refreshToken;
        yield employee.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        console.error("Token generation error:", error);
        throw new Error("Failed to generate tokens");
    }
});
// Login Controller
// Logout Controller
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const employee = yield user_model_1.User.findById(userId);
        if (!employee) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        employee.refreshToken = "";
        yield employee.save({ validateBeforeSave: false });
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.logoutUser = logoutUser;
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        ;
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isPasswordValid = yield user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto_1.default.createHash("sha256").update(otp).digest("hex");
        yield user_model_1.OtpModel.create({
            email,
            otp: hashedOtp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
        });
        // Send OTP via email
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
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
        });
        res.status(200).json({ message: "OTP sent to email" });
    }
    catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ message: "Email and OTP are required" });
            return;
        }
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid request" });
            return;
        }
        const otpRecord = yield user_model_1.OtpModel.findOne({ email });
        if (!otpRecord || !otpRecord.otp || !otpRecord.otpExpiry) {
            res.status(400).json({ message: "OTP not found" });
            return;
        }
        const hashedOtp = crypto_1.default.createHash("sha256").update(otp).digest("hex");
        if (otpRecord.otp !== hashedOtp) {
            res.status(401).json({ message: "Invalid OTP" });
            return;
        }
        if (otpRecord.otpExpiry < new Date()) {
            res.status(401).json({ message: "OTP expired" });
            return;
        }
        yield user_model_1.OtpModel.deleteOne({ email });
        const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(user._id.toString());
        const loggedInUser = yield user_model_1.User.findById(user._id).select("-password");
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };
        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
            data: { user: loggedInUser, accessToken, refreshToken },
            message: "OTP verified. Logged in successfully",
        });
    }
    catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.verifyOtp = verifyOtp;
