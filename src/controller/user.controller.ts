import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User,OtpModel } from "../models/user.model";
import crypto from "crypto";
import nodemailer from "nodemailer";
// Type for JWT payload
interface RefreshTokenPayload extends JwtPayload {
  _id: string;
}

// Utility: Generate Access and Refresh Tokens
const generateAccessAndRefreshTokens = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const employee = await User.findById(userId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const accessToken = employee.generateAccessToken();
    const refreshToken = employee.generateRefreshToken();

    employee.refreshToken = refreshToken;
    await employee.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate tokens");
  }
};

// Login Controller

// Logout Controller
export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const  userId  = req.user._id;

    const employee = await User.findById(userId);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    employee.refreshToken = "";
    await employee.save({ validateBeforeSave: false });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const sendOtp = async (req: Request, res: Response):Promise<void> => {
  try {
    const { email,password } = req.body;
    if (!email) { res.status(400).json({ message: "Email is required" }); return; };

    const user = await User.findOne({ email });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
     const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid ) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await OtpModel.create({
      email,
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes

    });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const verifyOtp = async (req: Request, res: Response):Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp){  res.status(400).json({ message: "Email and OTP are required" }); return; }

    const user = await User.findOne({ email });
    if (!user ) {
       res.status(400).json({ message: "Invalid request" });
       return;
    }
    const otpRecord = await OtpModel.findOne({ email });
    if (!otpRecord || !otpRecord.otp || !otpRecord.otpExpiry) {
      res.status(400).json({ message: "OTP not found" });
      return;
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (otpRecord.otp !== hashedOtp) { res.status(401).json({ message: "Invalid OTP" });return; }

    if (otpRecord.otpExpiry < new Date())  {res.status(401).json({ message: "OTP expired" }); return; }

    
    await OtpModel.deleteOne({ email });

    

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());
    const loggedInUser = await User.findById(user._id).select("-password");

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
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// // Refresh Access Token Controller
// export const refreshAccessToken = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const incomingRefreshToken: string | undefined =
//     req.cookies?.refreshToken || req.body?.refreshToken;

//   if (!incomingRefreshToken) {
//     res.status(401).json({ message: "Refresh token not found" });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET!
//     ) as RefreshTokenPayload;

//     const employee = await User.findById(decoded?._id);

//     if (!employee || employee.refreshToken !== incomingRefreshToken) {
//       res.status(401).json({ message: "Invalid refresh token" });
//       return;
//     }

//     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(employee._id.toString());

//     const options = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//     };

//     const updatedUser = await User.findById(employee._id).select("-password");

//     res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", refreshToken, options)
//       .json({
//         data: {
//           user: updatedUser,
//           accessToken,
//           refreshToken,
//         },
//         message: "Access token refreshed successfully",
//       });
//   } catch (error) {
//     console.error("Refresh token error:", error);
//     res.status(401).json({ message: "Invalid or expired refresh token" });
//   }
// };
