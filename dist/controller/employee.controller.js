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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEmployees = exports.getEmployeeByEmail = exports.createEmployee = void 0;
const employee_model_1 = require("../models/employee.model");
const createEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Check if employee already exists
        const existingEmployee = yield employee_model_1.Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee already exists" });
        }
        const employee = yield employee_model_1.Employee.create({
            name,
            email,
            password
        });
        const createdEmployee = yield employee_model_1.Employee.findById(employee._id).select("-password");
        if (!createdEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.status(201).json({ message: "Employee created successfully", employee: createdEmployee });
    }
    catch (error) {
        console.error("Error creating employee:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createEmployee = createEmployee;
const getEmployeeByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        // Find employee by email
        const employee = yield employee_model_1.Employee.findOne({ email }).select("-password");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.status(200).json({ employee });
    }
    catch (error) {
        console.error("Error fetching employee:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getEmployeeByEmail = getEmployeeByEmail;
const getAllEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all employees
        const employees = yield employee_model_1.Employee.find().select("-password");
        return res.status(200).json({ employees });
    }
    catch (error) {
        console.error("Error fetching employees:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllEmployees = getAllEmployees;
