import { Schema } from 'mongoose';
import { TaskStatus, IComment, CommentSchema } from './Shared';

export interface ITask {
  id: number;
  title: string;
  status: TaskStatus;
  loggedHours: number;
  comments: IComment[];
  dueDate: Date;
  completedAt?: Date;
}

export const TaskSchema = new Schema<ITask>({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.ToDo },
  loggedHours: { type: Number, default: 0 },
  comments: [CommentSchema],
  dueDate: { type: Date, required: true },
  completedAt: { type: Date },
}, { _id: false });