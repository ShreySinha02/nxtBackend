import express from "express";
import {
 verifySignupOtpAndCreateUser,
  sendSignupOtp,
 
} from "../controller/createUser.controller";
import { upload } from "../middlewares/upload.middleware";

const router = express.Router();

// Public route or role-protected depending on your logic
router.post("/sendOtp" , sendSignupOtp);
router.post("/verifyOtp",upload.single('file') ,verifySignupOtpAndCreateUser);

export default router;
