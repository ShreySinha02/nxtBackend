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
exports.refreshAccessToken = exports.changePassword = exports.logoutUser = exports.loginUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const employee_model_1 = require("../models/employee.model");
// Utility: Generate Access and Refresh Tokens
const generateAccessAndRefreshTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield employee_model_1.Employee.findById(userId);
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
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log("Login request body:", req.body);
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const employee = yield employee_model_1.Employee.findOne({ email });
        if (!employee) {
            res.status(401).json({ message: "Employee Does not exist" });
            return;
        }
        const isPasswordValid = yield employee.isPasswordCorrect(password);
        if (!isPasswordValid && employee.role !== "admin") {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        // console.log("Employee found:", employee);
        const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(employee._id.toString());
        const loggedInUser = yield employee_model_1.Employee.findById(employee._id).select("-password");
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
            message: "User logged in successfully",
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.loginUser = loginUser;
// Logout Controller
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const employee = yield employee_model_1.Employee.findById(userId);
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
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
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
        res.status(400).json({ message: "User ID, old password, and new password are required" });
        return;
    }
    try {
        const employee = yield employee_model_1.Employee.findById(userId);
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }
        const isPasswordValid = yield employee.isPasswordCorrect(oldPassword);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid old password" });
            return;
        }
        employee.password = newPassword;
        yield employee.save();
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.changePassword = changePassword;
// Refresh Access Token Controller
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const incomingRefreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.refreshToken);
    if (!incomingRefreshToken) {
        res.status(401).json({ message: "Refresh token not found" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const employee = yield employee_model_1.Employee.findById(decoded === null || decoded === void 0 ? void 0 : decoded._id);
        if (!employee || employee.refreshToken !== incomingRefreshToken) {
            res.status(401).json({ message: "Invalid refresh token" });
            return;
        }
        const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(employee._id.toString());
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };
        const updatedUser = yield employee_model_1.Employee.findById(employee._id).select("-password");
        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
            data: {
                user: updatedUser,
                accessToken,
                refreshToken,
            },
            message: "Access token refreshed successfully",
        });
    }
    catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});
exports.refreshAccessToken = refreshAccessToken;
