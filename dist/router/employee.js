"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("../controller/employee.controller");
const verifyAdmin_middleware_1 = require("../middlewares/verifyAdmin.middleware"); // Fixed typo in filename
const router = express_1.default.Router();
// Public route or role-protected depending on your logic
router.post("/create", verifyAdmin_middleware_1.verifyAdmin, employee_controller_1.createEmployee);
// Protected routes (requires JWT verification)
router.use(verifyAdmin_middleware_1.verifyAdmin);
router.get("/getEmployee/:email", employee_controller_1.getEmployeeByEmail);
router.get("/getAll", employee_controller_1.getAllEmployees);
// Future routes (implement and uncomment when ready)
// router.delete("/employee/delete/:id", deleteEmployee);
// router.patch("/employee/update/:id", updateEmployee);
exports.default = router;
