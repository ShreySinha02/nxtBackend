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
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user.controller");
const auth_middlleware_1 = require("../middlewares/auth.middlleware");
const user_model_1 = require("../models/user.model");
const router = express_1.default.Router();
router.route('/login').post(user_controller_1.sendOtp);
router.route('/verifyOtp').post(user_controller_1.verifyOtp);
router.route('/logout').post(auth_middlleware_1.verifyJWT, user_controller_1.logoutUser);
// router.route('/changePassword').post(verifyJWT,changePassword)
router.route("/home").get(auth_middlleware_1.verifyJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(400).json({ message: "User ID not found in token" });
            return;
        }
        const user = yield user_model_1.User.findById(userId).select("-password -refreshToken");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const userWithImageUrl = Object.assign(Object.assign({}, user.toObject()), { image: user.image ? `${baseUrl}/uploads/${user.image}` : null });
        res.status(200).json({
            message: "Welcome",
            user: userWithImageUrl,
        });
    }
    catch (error) {
        console.error("Home route error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
