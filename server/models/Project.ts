import mongoose, { Schema, Document, Model } from 'mongoose';
import { ProjectStatus, ProjectHealth } from './Shared';
import { TaskSchema, ITask } from './Task';
import { CommentSchema, IComment } from './Shared';

// Interfaces for TypeScript type safety
export interface IProjectFile {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url: string;
}

export interface IMilestone {
  id: number;
  name: string;
  date: Date;
  status: 'COMPLETED' | 'UPCOMING';
}

export interface IProject extends Document {
  id: number;
  name: string;
  clientId: number;
  assignedTo: number[];
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number;
  description: string;
  deadline: Date;
  startDate: Date;
  tasks: ITask[];
  category: string;
  files: IProjectFile[];
  budget: number;
  totalLoggedHours: number;
  comments: IComment[];
  milestones: IMilestone[];
}

export interface IBillingRecord extends Document {
    id: number;
    projectId: number;
    description: string;
    hours: number;
    rate: number;
    total: number;
    date: Date;
}

export interface INotification extends Document {
  id: number;
  message: string;
  createdAt: Date;
  read: boolean;
  link?: string;
}

// Mongoose Schemas
const ProjectFileSchema = new Schema<IProjectFile>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, required: true },
  uploadedAt: { type: String, required: true },
  url: { type: String, required: true },
}, { _id: false });


const MilestoneSchema = new Schema<IMilestone>({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['COMPLETED', 'UPCOMING'], required: true },
}, { _id: false });

const ProjectSchema = new Schema<IProject>({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  clientId: { type: Number, required: true },
  assignedTo: [{ type: Number }],
  status: { type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.NotStarted },
  health: { type: String, enum: Object.values(ProjectHealth), default: ProjectHealth.OnTrack },
  progress: { type: Number, default: 0 },
  description: { type: String },
  deadline: { type: Date, required: true },
  startDate: { type: Date, required: true },
  tasks: [TaskSchema],
  category: { type: String },
  files: [ProjectFileSchema],
  budget: { type: Number },
  totalLoggedHours: { type: Number, default: 0 },
  comments: [CommentSchema],
  milestones: [MilestoneSchema],
});

const BillingRecordSchema = new Schema<IBillingRecord>({
    id: { type: Number, unique: true },
    projectId: { type: Number, required: true },
    description: { type: String, required: true },
    hours: { type: Number, required: true },
    rate: { type: Number, required: true },
    total: { type: Number, required: true },
    date: { type: Date, required: true },
});

const NotificationSchema = new Schema<INotification>({
  id: { type: Number, unique: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  link: { type: String },
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

ProjectSchema.pre('save', preSaveHook);
BillingRecordSchema.pre('save', preSaveHook);
NotificationSchema.pre('save', preSaveHook);


// Mongoose Models
export const Project = mongoose.model<IProject>('Project', ProjectSchema);
export const BillingRecord = mongoose.model<IBillingRecord>('BillingRecord', BillingRecordSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);