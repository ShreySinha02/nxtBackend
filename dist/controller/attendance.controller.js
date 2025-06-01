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
exports.getSessionByEmployeeIdAndDate = exports.getAttendanceByEmployeeEmail = exports.getAttendanceByEmployeeIdAndDate = exports.getAttendanceByEmployeeId = exports.endSession = exports.startSession = void 0;
const onlinesession_model_1 = require("../models/onlinesession.model");
const attendance_model_1 = __importDefault(require("../models/attendance.model"));
const employee_model_1 = require("../models/employee.model");
const startSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, date } = req.body;
        console.log("Start session request body:", req.body);
        const startTime = new Date();
        let formattedDate = new Date(date);
        formattedDate = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate());
        // Check if session already exists
        const existingSession = yield onlinesession_model_1.OnlineSession.findOne({ $and: [{ employee: employeeId }, { sessionDate: formattedDate }] });
        console.log("Existing session:", existingSession);
        if (existingSession) {
            if (existingSession === null || existingSession === void 0 ? void 0 : existingSession.logoutTime) {
                return res.status(400).json({ message: "Session already ended for this date" });
            }
            // return res.status(400).json({ message: "Session already exists" });
        }
        // if(existingSession?.logoutTime) {
        //     return res.status(400).json({ message: "Session already ended for this date" });
        // }
        // Create a new session
        const newSession = yield onlinesession_model_1.OnlineSession.create({
            employee: employeeId,
            loginTime: startTime,
            sessionDate: formattedDate,
            totalOnlineDuration: 0,
            breaks: [],
        });
        return res.status(201).json({ message: "Session started successfully", session: newSession });
    }
    catch (error) {
        console.error("Error starting session:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.startSession = startSession;
const endSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, date } = req.body;
        let formattedDate = new Date(date);
        formattedDate = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate());
        const session = yield onlinesession_model_1.OnlineSession.findOne({ $and: [{ employee: employeeId }, { sessionDate: formattedDate }] });
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        const endTime = new Date();
        const totalOnlineDuration = Math.floor((endTime.getTime() - session.loginTime.getTime()) / 1000); // seconds
        // Strip time for attendance date
        const now = new Date();
        const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (totalOnlineDuration > 9) {
            const attendance = yield attendance_model_1.default.create({
                employee: employeeId,
                date: dateOnly, // 👈 only date (time set to 00:00:00)
                status: "Present",
                session: session._id,
            });
            console.log("Attendance created:", attendance);
        }
        session.logoutTime = endTime;
        session.totalOnlineDuration = totalOnlineDuration;
        yield session.save();
        return res.status(200).json({ message: "Session ended successfully", session });
    }
    catch (error) {
        console.error("Error ending session:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.endSession = endSession;
const getSessionByEmployeeIdAndDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, date } = req.body;
        let formattedDate = new Date(date);
        formattedDate = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate());
        const session = yield onlinesession_model_1.OnlineSession.findOne({ $and: [{ employee: employeeId }, { sessionDate: formattedDate }] })
            .populate("employee", "name email")
            .sort({ sessionDate: -1 }); // Sort by date in descending order
        if (session === null || session === void 0 ? void 0 : session.logoutTime) {
            return res.status(400).json({ message: "Session already ended for this date" });
        }
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        return res.status(200).json({ message: "Session retrieved successfully", session });
    }
    catch (error) {
        console.error("Error retrieving session:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getSessionByEmployeeIdAndDate = getSessionByEmployeeIdAndDate;
// const addBreak = async (req: any, res: any) => {
//     try {
//         const { employeeId, breakStartTime, breakEndTime } = req.body;
//         // Find the session by employee ID
//         const session = await OnlineSession.findOne({ employee: employeeId });
//         if (!session) {
//             return res.status(404).json({ message: "Session not found" });
//         }
//         // Calculate break duration
//         const breakDuration = Math.floor((breakEndTime.getTime() - breakStartTime.getTime()) / 1000); // in seconds
//         // Add break to the session
//         session.breaks.push({
//             startTime: breakStartTime,
//             endTime: breakEndTime,
//             duration: breakDuration,
//         });
//         await session.save();
//         return res.status(200).json({ message: "Break added successfully", session });
//     } catch (error) {
//         console.error("Error adding break:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }
const getAttendanceByEmployeeId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.body;
        console.log("Get attendance request body:", req.body);
        const attendance = yield attendance_model_1.default.find({ employee: employeeId })
            .populate("employee", "name email")
            .populate("session", "loginTime logoutTime totalOnlineDuration breaks")
            .sort({ date: -1 }); // Sort by date in descending order
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found" });
        }
        return res.status(200).json({ message: "Attendance retrieved successfully", attendance });
    }
    catch (error) {
        console.error("Error retrieving attendance:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAttendanceByEmployeeId = getAttendanceByEmployeeId;
const getAttendanceByEmployeeIdAndDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, date } = req.body;
        let formattedDate = new Date(date);
        formattedDate = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate());
        const attendance = yield attendance_model_1.default.findOne({ employee: employeeId, date: formattedDate })
            .populate("employee", "name email")
            .populate("session", "loginTime logoutTime totalOnlineDuration breaks");
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found" });
        }
        return res.status(200).json({ message: "Attendance retrieved successfully", attendance });
    }
    catch (error) {
        console.error("Error retrieving attendance:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAttendanceByEmployeeIdAndDate = getAttendanceByEmployeeIdAndDate;
const getAttendanceByEmployeeEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Get attendance by email request params:", req.params);
    try {
        const { email } = req.params;
        // Step 1: Find the employee by email
        const employee = yield employee_model_1.Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        // Step 2: Find attendance records by employee ID
        const attendance = yield attendance_model_1.default.find({ employee: employee._id })
            .populate("employee", "name email") // include name and email in response
            .populate("session", "loginTime logoutTime totalOnlineDuration breaks sessionDate")
            .sort({ date: -1 });
        if (!attendance || attendance.length === 0) {
            return res.status(404).json({ message: "No attendance found for this employee" });
        }
        return res.status(200).json({ message: "Attendance retrieved successfully", attendance });
    }
    catch (error) {
        console.error("Error retrieving attendance by email:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAttendanceByEmployeeEmail = getAttendanceByEmployeeEmail;
