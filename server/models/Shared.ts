import { Schema } from 'mongoose';

export enum Role {
  Admin = 'ADMIN',
  Employee = 'EMPLOYEE',
  Client = 'CLIENT',
}

export enum UserStatus {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

export enum ProjectStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold',
}

export enum ProjectHealth {
    OnTrack = 'ON_TRACK',
    AtRisk = 'AT_RISK',
    OffTrack = 'OFF_TRACK',
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold',
}

export enum LeaveRequestStatus {
    Pending = 'PENDING',
    Approved = 'APPROVED',
    Rejected = 'REJECTED',
}

export interface IComment {
    id: number;
    authorId: number;
    content: string;
    createdAt: Date;
}

export const CommentSchema = new Schema<IComment>({
    id: { type: Number, required: true },
    authorId: { type: Number, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });


// View types
export type EmployeeView = 'dashboard' | 'tasks' | 'standups' | 'leave' | 'profile';
export type ClientView = 'dashboard' | 'projects' | 'billing' | 'profile';