import express from "express";
import {
 verifySignupOtpAndCreateUser,
  sendSignupOtp,
 
} from "../controller/createUser.controller";
import { upload } from "../middlewares/upload.middleware";

const router = express.Router();

router.post("/sendOtp" , sendSignupOtp);
router.post("/verifyOtp",upload.single('file') ,verifySignupOtpAndCreateUser);

export default router;
