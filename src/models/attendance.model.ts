import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OnlineSession', // optional if you want to link session data
  },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true }); // Ensure 1 attendance per day

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
