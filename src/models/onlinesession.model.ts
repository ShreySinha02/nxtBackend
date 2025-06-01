import mongoose, { Schema } from 'mongoose';

const breakSchema = new Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // duration in minutes or seconds
  },
}, { _id: false });

const onlineSessionSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  loginTime: {
    type: Date,
    required: true,
  },
  logoutTime: {
    type: Date,
  },
  sessionDate: {
    type: Date,
    default:()=>{
      const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
  },
  totalOnlineDuration: {
    type: Number, // total duration in minutes or seconds
  },
  breaks: [breakSchema],
}, { timestamps: true });

export const OnlineSession = mongoose.model('OnlineSession', onlineSessionSchema);
