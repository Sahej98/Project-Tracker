

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, LeaveRequest, DailyStandup } from './models/User';
import { Project, Notification, BillingRecord } from './models/Project';
import { Role, UserStatus, ProjectStatus, TaskStatus, ProjectHealth, LeaveRequestStatus } from './models/Shared';

// Load environment variables
dotenv.config();

const initialUsersData = [
  { id: 1, name: 'Admin', role: Role.Admin, avatar: 'https://i.pravatar.cc/150?u=admin', status: UserStatus.Active, email: 'admin@zenith.com', phone: '123-456-7890', password: 'admin123' },
  { id: 2, name: 'Alice Johnson', role: Role.Employee, avatar: 'https://i.pravatar.cc/150?u=alice', hourlyRate: 50, status: UserStatus.Active, jobTitle: 'Frontend Developer', email: 'alice@zenith.com', phone: '555-0101', password: 'password123' },
  { id: 3, name: 'Bob Williams', role: Role.Employee, avatar: 'https://i.pravatar.cc/150?u=bob', hourlyRate: 55, status: UserStatus.Active, jobTitle: 'Backend Developer', email: 'bob@zenith.com', phone: '555-0102', password: 'password123' },
  { id: 4, name: 'Charlie Brown', role: Role.Employee, avatar: 'https://i.pravatar.cc/150?u=charlie', hourlyRate: 45, status: UserStatus.Active, jobTitle: 'UI/UX Designer', email: 'charlie@zenith.com', phone: '555-0103', password: 'password123' },
  { id: 5, name: 'Innovate Corp', role: Role.Client, avatar: 'https://i.pravatar.cc/150?u=innovate', status: UserStatus.Active, email: 'contact@innovate.com', phone: '555-0201', password: 'password123' },
  { id: 6, name: 'Future Tech', role: Role.Client, avatar: 'https://i.pravatar.cc/150?u=futuretech', status: UserStatus.Active, email: 'hello@futuretech.com', phone: '555-0202', password: 'password123' },
];

const initialLeaveRequestsData = [
    { id: 1, employeeId: 2, startDate: '2024-08-10', endDate: '2024-08-12', reason: 'Vacation', status: LeaveRequestStatus.Pending },
    { id: 2, employeeId: 3, startDate: '2024-07-30', endDate: '2024-07-30', reason: 'Doctor appointment', status: LeaveRequestStatus.Approved },
];

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const initialDailyStandupsData = [
    { id: 1, employeeId: 2, date: yesterday.toISOString().split('T')[0], yesterday: 'Finished homepage components', today: 'Start CMS integration', blockers: 'None' },
    { id: 2, employeeId: 3, date: yesterday.toISOString().split('T')[0], yesterday: 'Implemented user auth logic', today: 'Build core features module', blockers: 'API documentation is unclear' },
];

const initialNotificationsData = [
    { id: 1, message: 'Alice Johnson completed task "Create new design mockups".', createdAt: '2024-07-28T10:00:00Z', read: false },
    { id: 2, message: 'New project "Marketing Campaign" has been created.', createdAt: '2024-07-27T14:30:00Z', read: true },
    { id: 3, message: 'Bob Williams left a comment on task "Design database schema".', createdAt: '2024-07-28T11:00:00Z', read: false },
    { id: 4, message: 'Project "Website Redesign" is now AT_RISK due to budget concerns.', createdAt: '2024-07-29T11:00:00Z', read: false },
    { id: 5, message: 'Alice Johnson submitted a leave request.', createdAt: new Date().toISOString(), read: false },
];

const initialBillingRecordsData = [
    { id: 1, projectId: 1, description: "Initial Design Phase", hours: 40, rate: 50, total: 2000, date: '2024-07-15' },
    { id: 2, projectId: 1, description: "Homepage Development", hours: 50, rate: 50, total: 2500, date: '2024-07-25' },
    { id: 3, projectId: 2, description: "Project Setup & Schema", hours: 40, rate: 55, total: 2200, date: '2024-07-20' },
];

const initialProjectsData = [
  {
    id: 1,
    name: 'Website Redesign',
    clientId: 5,
    assignedTo: [2],
    status: ProjectStatus.InProgress,
    health: ProjectHealth.AtRisk,
    progress: 75,
    description: 'Complete overhaul of the main company website with a new design system and CMS.',
    startDate: '2024-07-01',
    deadline: '2024-08-30',
    category: 'Web Development',
    budget: 20000,
    totalLoggedHours: 120,
    files: [
        { id: 1, name: 'Design_Mockups_v2.fig', type: 'Figma Design', size: '15.2 MB', uploadedAt: '2024-07-05', url: '#' },
        { id: 2, name: 'Project_Brief.pdf', type: 'PDF Document', size: '1.8 MB', uploadedAt: '2024-07-02', url: '#' },
    ],
    comments: [
        { id: 1, authorId: 1, content: 'Great progress so far, team. Keep it up!', createdAt: '2024-07-25T09:00:00Z' },
    ],
    milestones: [
        { id: 1, name: 'Design Complete', date: '2024-07-15', status: 'COMPLETED'},
        { id: 2, name: 'Development Complete', date: '2024-08-15', status: 'UPCOMING'},
        { id: 3, name: 'Final Launch', date: '2024-08-30', status: 'UPCOMING'},
    ],
    tasks: [
        { id: 1, title: 'Create new design mockups', status: TaskStatus.Completed, loggedHours: 40, comments: [], dueDate: '2024-07-14', completedAt: '2024-07-13' },
        { id: 2, title: 'Develop homepage components', status: TaskStatus.Completed, loggedHours: 50, comments: [], dueDate: '2024-07-30', completedAt: '2024-07-25' },
        { id: 3, title: 'Implement CMS integration', status: TaskStatus.InProgress, loggedHours: 30, comments: [], dueDate: '2024-08-10' },
        { id: 4, title: 'Deploy to staging server', status: TaskStatus.ToDo, loggedHours: 0, comments: [], dueDate: '2024-08-20' },
    ]
  },
  {
    id: 2,
    name: 'Mobile App Development',
    clientId: 6,
    assignedTo: [3, 4],
    status: ProjectStatus.InProgress,
    health: ProjectHealth.OnTrack,
    progress: 40,
    description: 'Develop a new cross-platform mobile application for iOS and Android.',
    startDate: '2024-07-10',
    deadline: '2024-09-15',
    category: 'Mobile Development',
    budget: 35000,
    totalLoggedHours: 85,
    files: [],
    comments: [],
    milestones: [
        { id: 1, name: 'Project Kickoff', date: '2024-07-10', status: 'COMPLETED'},
        { id: 2, name: 'Alpha Version', date: '2024-08-20', status: 'UPCOMING'},
        { id: 3, name: 'Public Release', date: '2024-09-15', status: 'UPCOMING'},
    ],
    tasks: [
        { id: 5, title: 'Setup project structure', status: TaskStatus.Completed, loggedHours: 15, comments: [], dueDate: '2024-07-15', completedAt: '2024-07-14' },
        { id: 6, title: 'Design database schema', status: TaskStatus.Completed, loggedHours: 25, comments: [{ id: 1, authorId: 3, content: 'Need to review the user table schema.', createdAt: '2024-07-28T11:00:00Z'}], dueDate: '2024-07-22', completedAt: '2024-07-21' },
        { id: 7, title: 'Implement user authentication', status: TaskStatus.InProgress, loggedHours: 45, comments: [], dueDate: '2024-08-05' },
        { id: 8, title: 'Build core features', status: TaskStatus.ToDo, loggedHours: 0, comments: [], dueDate: '2024-08-25' },
        { id: 9, title: 'Write unit tests', status: TaskStatus.ToDo, loggedHours: 0, comments: [], dueDate: '2024-09-01' },
    ]
  },
  {
    id: 3,
    name: 'Marketing Campaign',
    clientId: 5,
    assignedTo: [4],
    status: ProjectStatus.Completed,
    health: ProjectHealth.OnTrack,
    progress: 100,
    description: 'Q3 social media marketing campaign to boost user engagement.',
    startDate: '2024-07-01',
    deadline: '2024-07-25',
    category: 'Marketing',
    budget: 10000,
    totalLoggedHours: 60,
    files: [
        { id: 3, name: 'Campaign_Assets.zip', type: 'Archive', size: '32.5 MB', uploadedAt: '2024-07-18', url: '#' },
    ],
    comments: [],
    milestones: [],
    tasks: [
        { id: 10, title: 'Finalize campaign goals', status: TaskStatus.Completed, loggedHours: 10, comments: [], dueDate: '2024-07-05', completedAt: '2024-07-04' },
        { id: 11, title: 'Create ad creatives', status: TaskStatus.Completed, loggedHours: 30, comments: [], dueDate: '2024-07-15', completedAt: '2024-07-15' },
        { id: 12, title: 'Launch social media ads', status: TaskStatus.Completed, loggedHours: 20, comments: [], dueDate: '2024-07-20', completedAt: '2024-07-19' },
    ]
  },
  {
    id: 4,
    name: 'API Integration',
    clientId: 6,
    assignedTo: [],
    status: ProjectStatus.NotStarted,
    health: ProjectHealth.OnTrack,
    progress: 0,
    description: 'Integrate third-party payment gateway API into the existing platform.',
    startDate: '2024-09-01',
    deadline: '2024-10-01',
    category: 'Backend Development',
    budget: 15000,
    totalLoggedHours: 0,
    files: [],
    comments: [],
    milestones: [],
    tasks: [
      { id: 13, title: 'Research API documentation', status: TaskStatus.ToDo, loggedHours: 0, comments: [], dueDate: '2024-09-07' },
      { id: 14, title: 'Develop integration module', status: TaskStatus.ToDo, loggedHours: 0, comments: [], dueDate: '2024-09-20' },
    ]
  },
];


const seedDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("MongoDB URI not found for seeding. Please set MONGODB_URI in your environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await LeaveRequest.deleteMany({});
        await DailyStandup.deleteMany({});
        await Notification.deleteMany({});
        await BillingRecord.deleteMany({});
        console.log('Cleared existing data.');
        
        // Insert new data
        await User.insertMany(initialUsersData);
        await Project.insertMany(initialProjectsData);
        await LeaveRequest.insertMany(initialLeaveRequestsData);
        await DailyStandup.insertMany(initialDailyStandupsData);
        await Notification.insertMany(initialNotificationsData);
        await BillingRecord.insertMany(initialBillingRecordsData);

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

// This allows running the script directly from the command line
if (require.main === module) {
    seedDatabase();
}