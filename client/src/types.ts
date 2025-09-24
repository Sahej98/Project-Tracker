// This file contains type definitions for data structures used throughout the client application.
// It serves as the single source of truth for the frontend, ensuring consistency and
// decoupling it from the backend's internal models.

// --- Enums ---

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

// --- View Types ---

export type EmployeeView = 'dashboard' | 'tasks' | 'standups' | 'leave' | 'profile';
export type ClientView = 'dashboard' | 'projects' | 'billing' | 'profile';


// --- Type Aliases ---

export type Comment = {
    id: number;
    authorId: number;
    content: string;
    createdAt: string; // Dates are serialized as strings over API
}

export type User = {
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

export type LeaveRequest = {
    id: number;
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveRequestStatus;
}

export type DailyStandup = {
    id: number;
    employeeId: number;
    date: string;
    yesterday: string;
    today: string;
    blockers: string;
}

export type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  loggedHours: number;
  comments: Comment[];
  dueDate: string;
  completedAt?: string;
}

export type ProjectFile = {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url: string;
}

export type Milestone = {
  id: number;
  name: string;
  date: string;
  status: 'COMPLETED' | 'UPCOMING';
}

export type Project = {
  id: number;
  name: string;
  clientId: number;
  assignedTo: number[];
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number;
  description: string;
  deadline: string;
  startDate: string;
  tasks: Task[];
  category: string;
  files: ProjectFile[];
  budget: number;
  totalLoggedHours: number;
  comments: Comment[];
  milestones: Milestone[];
}

export type BillingRecord = {
    id: number;
    projectId: number;
    description: string;
    hours: number;
    rate: number;
    total: number;
    date: string;
}

export type Notification = {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}