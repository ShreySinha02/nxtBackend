"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createUser_controller_1 = require("../controller/createUser.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = express_1.default.Router();
router.post("/sendOtp", createUser_controller_1.sendSignupOtp);
router.post("/verifyOtp", upload_middleware_1.upload.single('file'), createUser_controller_1.verifySignupOtpAndCreateUser);
exports.default = router;
