import axios from 'axios';
import type { Project, ProjectFile, User, Role, TaskStatus, LeaveRequestStatus } from '../types';

const api = axios.create({
    baseURL: 'https://project-tracker-ey5v.onrender.com/api',
});

// --- General ---
export const getAllData = () => api.get('/data');

// --- Projects ---
export const createProject = (projectData: Pick<Project, 'name' | 'description' | 'clientId' | 'deadline' | 'category' | 'startDate' | 'budget'>) => 
    api.post('/projects', projectData);

export const updateProject = (id: number, projectData: Partial<Project>) => 
    api.put(`/projects/${id}`, projectData);

export const deleteProject = (id: number) => 
    api.delete(`/projects/${id}`);

// --- Users ---
export const createUser = (userData: { name: string, role: Role, email?: string, phone?: string, jobTitle?: string, hourlyRate?: number }) =>
    api.post('/users', userData);

export const updateUser = (id: number, userData: Partial<User>) =>
    api.put(`/users/${id}`, userData);

export const deleteUser = (id: number) =>
    api.delete(`/users/${id}`);

// --- Tasks ---
export const createTask = (projectId: number, taskData: { title: string, dueDate: string }) =>
    api.post(`/projects/${projectId}/tasks`, taskData);

export const updateTask = (projectId: number, taskId: number, taskData: { status?: TaskStatus, loggedHours?: number }) =>
    api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);

// --- Comments ---
export const addProjectComment = (projectId: number, commentData: { authorId: number, content: string }) =>
    api.post(`/projects/${projectId}/comments`, commentData);

export const addTaskComment = (projectId: number, taskId: number, commentData: { authorId: number, content: string }) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/comments`, commentData);

// --- Files ---
export const addFile = (projectId: number, fileData: Omit<ProjectFile, 'id'>) =>
    api.post(`/projects/${projectId}/files`, fileData);

export const deleteFile = (projectId: number, fileId: number) =>
    api.delete(`/projects/${projectId}/files/${fileId}`);

// --- Leave Requests ---
export const createLeaveRequest = (requestData: { employeeId: number, startDate: string, endDate: string, reason: string }) =>
    api.post('/leave-requests', requestData);

export const updateLeaveRequestStatus = (id: number, status: LeaveRequestStatus) =>
    api.put(`/leave-requests/${id}`, { status });

// --- Standups ---
export const createStandup = (standupData: { employeeId: number, date: string, yesterday: string, today: string, blockers: string }) =>
    api.post('/standups', standupData);

// --- Notifications ---
export const createNotification = (message: string) =>
    api.post('/notifications', { message });

export const markAllNotificationsAsRead = () =>
    api.put('/notifications/read');

export default api;