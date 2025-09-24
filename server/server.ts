// FIX: Replaced the express import to alias Request and Response types.
// This prevents conflicts with global types (e.g., from DOM) and resolves type errors throughout the file.
// FIX: Replaced the express import to explicitly import and alias Request and Response types to avoid conflicts with global DOM types.
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, LeaveRequest, DailyStandup } from './models/User';
import { Project, Notification, BillingRecord, IProject, IProjectFile } from './models/Project';
import { ITask } from './models/Task';
import { ProjectHealth, ProjectStatus, TaskStatus } from './models/Shared';

dotenv.config();

const app = express();
const port = 4000;

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error("MongoDB URI not found. Please set MONGODB_URI in your environment variables.");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });


app.use(cors());
app.use(express.json());

// --- Helper Functions ---
const recalculateProjectProgress = (project: IProject) => {
    if (!project.tasks || project.tasks.length === 0) {
        project.progress = 0;
        project.status = ProjectStatus.NotStarted;
    } else {
        const onHoldTasksCount = project.tasks.filter((t: ITask) => t.status === TaskStatus.OnHold).length;
        const completedTasksCount = project.tasks.filter((t: ITask) => t.status === TaskStatus.Completed).length;
        const calculableTasksCount = project.tasks.length - onHoldTasksCount;

        project.progress = calculableTasksCount > 0 ? Math.round((completedTasksCount / calculableTasksCount) * 100) : 0;
        
        if (project.status !== ProjectStatus.OnHold) {
            if (calculableTasksCount > 0 && completedTasksCount === calculableTasksCount) {
                project.status = ProjectStatus.Completed;
            } else if (completedTasksCount > 0 || project.tasks.some((t: ITask) => t.status === TaskStatus.InProgress)) {
                project.status = ProjectStatus.InProgress;
            } else {
                project.status = ProjectStatus.NotStarted;
            }
        }
    }
    project.totalLoggedHours = project.tasks.reduce((sum: number, task: ITask) => sum + task.loggedHours, 0);
    // Note: Health recalculation is more complex and depends on budget usage, which requires user rates.
    // This is a simplified version. A full implementation would fetch user rates.
    project.health = ProjectHealth.OnTrack; // Placeholder
    return project;
};

// --- API Routes ---

// A single endpoint to fetch all initial data for the app from MongoDB
app.get('/api/data', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const [users, projects, leaveRequests, dailyStandups, notifications, billingRecords] = await Promise.all([
            User.find().sort({id: 1}),
            Project.find().sort({id: -1}),
            LeaveRequest.find().sort({id: -1}),
            DailyStandup.find().sort({id: -1}),
            Notification.find().sort({id: -1}),
            BillingRecord.find().sort({id: -1}),
        ]);
        
        res.json({ users, projects, leaveRequests, dailyStandups, notifications, billingRecords });
    } catch (error) {
        console.error('Failed to fetch data from MongoDB:', error);
        res.status(500).json({ message: 'Failed to fetch data from database' });
    }
});

// --- Projects ---
app.post('/api/projects', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const projectData = { ...req.body, tasks: [], files: [], comments: [], milestones: [] };
        const newProject = new Project(projectData);
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
});

app.put('/api/projects/:id', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const updatedProject = await Project.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project', error });
    }
});

app.delete('/api/projects/:id', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        await Project.findOneAndDelete({ id: req.params.id });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error });
    }
});

// --- Users ---
app.post('/api/users', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

app.put('/api/users/:id', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const updatedUser = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});

app.delete('/api/users/:id', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        // Also remove user from any projects they are assigned to
        await Project.updateMany({ assignedTo: req.params.id }, { $pull: { assignedTo: req.params.id } });
        await User.findOneAndDelete({ id: req.params.id });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});


// --- Tasks (Sub-document of Project) ---
app.post('/api/projects/:projectId/tasks', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const project = await Project.findOne({ id: req.params.projectId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const newTask = { ...req.body, id: Date.now(), comments: [], loggedHours: 0 };
        project.tasks.push(newTask as ITask);
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error adding task', error });
    }
});

app.put('/api/projects/:projectId/tasks/:taskId', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { projectId, taskId } = req.params;
        const updates = req.body;
        
        const project = await Project.findOne({ id: projectId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const taskIndex = project.tasks.findIndex((t: ITask) => t.id == Number(taskId));
        if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

        Object.assign(project.tasks[taskIndex], updates);
        
        // If status is updated, set completedAt
        if (updates.status === TaskStatus.Completed && !project.tasks[taskIndex].completedAt) {
            project.tasks[taskIndex].completedAt = new Date();
        }

        recalculateProjectProgress(project);
        
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
});

// --- Comments (Sub-document) ---
app.post('/api/projects/:projectId/comments', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const project = await Project.findOne({ id: req.params.projectId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const newComment = { ...req.body, id: Date.now(), createdAt: new Date() };
        project.comments.push(newComment);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
});

app.post('/api/projects/:projectId/tasks/:taskId/comments', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const project = await Project.findOne({ id: req.params.projectId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const task = project.tasks.find((t: ITask) => t.id == Number(req.params.taskId));
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        const newComment = { ...req.body, id: Date.now(), createdAt: new Date() };
        task.comments.push(newComment);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
});

// --- Files (Sub-document) ---
app.post('/api/projects/:projectId/files', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const project = await Project.findOne({ id: req.params.projectId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const newFile = { ...req.body, id: Date.now() };
        project.files.push(newFile);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error adding file', error });
    }
});

app.delete('/api/projects/:projectId/files/:fileId', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { projectId, fileId } = req.params;
        const project = await Project.findOne({ id: projectId });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.files = project.files.filter((f: IProjectFile) => f.id != Number(fileId));
        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting file', error });
    }
});


// --- Leave Management ---
app.post('/api/leave-requests', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const newRequest = new LeaveRequest(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: 'Error creating leave request', error });
    }
});

app.put('/api/leave-requests/:id', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const updatedRequest = await LeaveRequest.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: 'Error updating leave request', error });
    }
});

// --- Daily Standups ---
app.post('/api/standups', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const newStandup = new DailyStandup(req.body);
        await newStandup.save();
        res.status(201).json(newStandup);
    } catch (error) {
        res.status(500).json({ message: 'Error creating standup', error });
    }
});

// --- Notifications ---
app.post('/api/notifications', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const newNotification = new Notification(req.body);
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
});

app.put('/api/notifications/read', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        await Notification.updateMany({ read: false }, { $set: { read: true } });
        const updatedNotifications = await Notification.find().sort({ id: -1 });
        res.json(updatedNotifications);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error });
    }
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});