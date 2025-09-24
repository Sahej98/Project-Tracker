import mongoose, { Schema, Document, Model } from 'mongoose';
import { Role, UserStatus, LeaveRequestStatus } from './Shared';

// Interfaces for TypeScript type safety
export interface IUser extends Document {
  id: number;
  name: string;
  role: Role;
  avatar: string;
  status: UserStatus;
  password?: string;
  hourlyRate?: number;
  jobTitle?: string;
  email?: string;
  phone?: string;
}

export interface ILeaveRequest extends Document {
    id: number;
    employeeId: number;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: LeaveRequestStatus;
}

export interface IDailyStandup extends Document {
    id: number;
    employeeId: number;
    date: Date;
    yesterday: string;
    today: string;
    blockers: string;
}

// Mongoose Schemas
const UserSchema = new Schema<IUser>({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), required: true },
  avatar: { type: String },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.Active },
  password: { type: String },
  hourlyRate: { type: Number },
  jobTitle: { type: String },
  email: { type: String },
  phone: { type: String },
});

const LeaveRequestSchema = new Schema<ILeaveRequest>({
    id: { type: Number, unique: true },
    employeeId: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(LeaveRequestStatus), default: LeaveRequestStatus.Pending },
});

const DailyStandupSchema = new Schema<IDailyStandup>({
    id: { type: Number, unique: true },
    employeeId: { type: Number, required: true },
    date: { type: Date, required: true },
    yesterday: { type: String, required: true },
    today: { type: String, required: true },
    blockers: { type: String },
});

// Auto-increment ID pre-save hook
async function preSaveHook(this: Document & { id?: number }, next: () => void) {
    if (this.isNew) {
        const model = this.constructor as Model<any>;
        const lastDoc = await model.findOne().sort({ id: -1 });
        this.id = lastDoc ? lastDoc.id + 1 : 1;
    }
    next();
}

UserSchema.pre('save', preSaveHook);
LeaveRequestSchema.pre('save', preSaveHook);
DailyStandupSchema.pre('save', preSaveHook);

// Mongoose Models
export const User = mongoose.model<IUser>('User', UserSchema);
export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
export const DailyStandup = mongoose.model<IDailyStandup>('DailyStandup', DailyStandupSchema);