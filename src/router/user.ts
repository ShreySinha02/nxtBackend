import express from 'express';
import { sendOtp, logoutUser,verifyOtp } from '../controller/user.controller';
import { verifyJWT } from '../middlewares/auth.middlleware';
import { User } from '../models/user.model';

import { Request, Response } from 'express';

const router = express.Router();



router.route('/login').post(sendOtp);
router.route('/verifyOtp').post(verifyOtp);
router.route('/logout').post(verifyJWT,logoutUser)
// router.route('/changePassword').post(verifyJWT,changePassword)
router.route("/home").get(verifyJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id; 

    if (!userId) {
      res.status(400).json({ message: "User ID not found in token" });
      return;
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
     const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userWithImageUrl = {
      ...user.toObject(),
      image: user.image ? `${baseUrl}/uploads/${user.image}` : null
    };

    res.status(200).json({
      message: "Welcome",
      user:userWithImageUrl,
    });
  } catch (error) {
    console.error("Home route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;