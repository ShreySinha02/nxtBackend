"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const attendanceSchema = new mongoose_1.default.Schema({
    employee: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave'],
        default: 'Present',
    },
    session: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'OnlineSession', // optional if you want to link session data
    },
}, { timestamps: true });
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true }); // Ensure 1 attendance per day
const Attendance = mongoose_1.default.model('Attendance', attendanceSchema);
exports.default = Attendance;
