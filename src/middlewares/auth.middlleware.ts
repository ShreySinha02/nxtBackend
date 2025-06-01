import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can strongly type this to Employee if needed
    }
  }
}
export const verifyJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    

    if (!token) {
      res.status(401).json({ message: "Unauthorized: Access token missing" });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

    const user = await User.findById(decoded?._id).select("-password -refreshToken");
    if (!user) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
