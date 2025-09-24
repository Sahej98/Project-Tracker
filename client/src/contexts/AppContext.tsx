import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import type {
  User,
  LeaveRequest,
  DailyStandup,
  Project,
  Notification,
  ProjectFile,
  BillingRecord,
  Task,
} from '../types';
import {
  Role,
  UserStatus,
  ProjectStatus,
  TaskStatus,
  ProjectHealth,
  LeaveRequestStatus,
} from '../types';
import * as api from '../services/api';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  notifications: Notification[];
  billingRecords: BillingRecord[];
  leaveRequests: LeaveRequest[];
  dailyStandups: DailyStandup[];
  theme: 'light' | 'dark';
  isLoading: boolean;
  toggleTheme: () => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  findUserById: (id: number) => User | undefined;
  getEmployeeStats: (employeeId: number) => {
    totalProjects: number;
    tasksCompleted: number;
    totalHours: number;
  };
  getWeekNumber: (d: Date) => number;

  // Project Methods
  editProject: (
    updatedProject: Partial<Project> & { id: number }
  ) => Promise<void>;
  addProject: (
    projectData: Pick<
      Project,
      | 'name'
      | 'description'
      | 'clientId'
      | 'deadline'
      | 'category'
      | 'startDate'
      | 'budget'
    >
  ) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  addTask: (
    projectId: number,
    taskTitle: string,
    dueDate: string
  ) => Promise<void>;
  updateTaskStatus: (
    projectId: number,
    taskId: number,
    status: TaskStatus
  ) => Promise<void>;
  addFileToProject: (
    projectId: number,
    file: Omit<ProjectFile, 'id'>
  ) => Promise<void>;
  deleteFileFromProject: (projectId: number, fileId: number) => Promise<void>;
  logTimeToTask: (
    projectId: number,
    taskId: number,
    hours: number
  ) => Promise<void>;
  addComment: (
    type: 'project' | 'task',
    ids: { projectId: number; taskId?: number },
    content: string
  ) => Promise<void>;

  // Notification Methods
  markNotificationsAsRead: () => Promise<void>;

  // User Methods
  addUser: (userData: {
    name: string;
    role: Role;
    email?: string;
    phone?: string;
    jobTitle?: string;
    hourlyRate?: number;
  }) => Promise<void>;
  editUser: (user: Partial<User> & { id: number }) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  updateUserStatus: (userId: number, status: UserStatus) => Promise<void>;

  // Leave Management
  requestLeave: (leaveRequest: {
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
  }) => Promise<void>;
  updateLeaveStatus: (
    requestId: number,
    status: LeaveRequestStatus
  ) => Promise<void>;

  // Daily Standups
  submitStandup: (standup: {
    employeeId: number;
    date: string;
    yesterday: string;
    today: string;
    blockers: string;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [dailyStandups, setDailyStandups] = useState<DailyStandup[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.getAllData();
      const data = response.data;
      setUsers(data.users);
      setProjects(data.projects);
      setLeaveRequests(data.leaveRequests);
      setDailyStandups(data.dailyStandups);
      setNotifications(data.notifications);
      setBillingRecords(data.billingRecords);
    } catch (error) {
      console.error('Failed to fetch data from backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createAndSetNotification = useCallback(async (message: string) => {
    try {
      const response = await api.createNotification(message);
      setNotifications((prev) => [response.data, ...prev]);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const login = useCallback(
    (email: string, password: string) => {
      const user = users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      // IMPORTANT: This is an insecure, client-side password check for demonstration purposes.
      // In a real application, this validation should happen on the backend with hashed passwords.
      if (user && user.password === password) {
        if (user.status === UserStatus.Inactive) {
          alert('This user account is inactive and cannot be accessed.');
          return;
        }
        setCurrentUser(user);
      } else {
        alert('Invalid email or password.');
      }
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const findUserById = useCallback(
    (id: number) => {
      return users.find((u) => u.id === id);
    },
    [users]
  );

  const editProject = useCallback(
    async (updatedProject: Partial<Project> & { id: number }) => {
      try {
        const response = await api.updateProject(
          updatedProject.id,
          updatedProject
        );
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? response.data : p))
        );
      } catch (error) {
        console.error('Failed to edit project:', error);
      }
    },
    []
  );

  const addProject = useCallback(
    async (
      projectData: Pick<
        Project,
        | 'name'
        | 'description'
        | 'clientId'
        | 'deadline'
        | 'category'
        | 'startDate'
        | 'budget'
      >
    ) => {
      try {
        const response = await api.createProject(projectData);
        setProjects((prev) => [response.data, ...prev]);
        await createAndSetNotification(
          `New project "${projectData.name}" has been created.`
        );
      } catch (error) {
        console.error('Failed to add project:', error);
      }
    },
    [createAndSetNotification]
  );

  const deleteProject = useCallback(async (projectId: number) => {
    try {
      await api.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, []);

  const addTask = useCallback(
    async (projectId: number, taskTitle: string, dueDate: string) => {
      if (!taskTitle.trim()) return;
      try {
        const response = await api.createTask(projectId, {
          title: taskTitle.trim(),
          dueDate,
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data : p))
        );
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    },
    []
  );

  const updateTaskStatus = useCallback(
    async (projectId: number, taskId: number, status: TaskStatus) => {
      try {
        const response = await api.updateTask(projectId, taskId, { status });
        const updatedProject = response.data;
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? updatedProject : p))
        );

        const task = updatedProject.tasks.find((t: Task) => t.id === taskId);
        if (task && task.status !== status && status === TaskStatus.Completed) {
          await createAndSetNotification(
            `${currentUser?.name || 'A user'} completed task: "${task.title}"`
          );
        }
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    },
    [createAndSetNotification, currentUser]
  );

  const logTimeToTask = useCallback(
    async (projectId: number, taskId: number, hours: number) => {
      const project = projects.find((p) => p.id === projectId);
      const task = project?.tasks.find((t) => t.id === taskId);
      if (!task) return;

      try {
        const response = await api.updateTask(projectId, taskId, {
          loggedHours: task.loggedHours + hours,
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data : p))
        );
      } catch (error) {
        console.error('Failed to log time:', error);
      }
    },
    [projects]
  );

  const addComment = useCallback(
    async (
      type: 'project' | 'task',
      ids: { projectId: number; taskId?: number },
      content: string
    ) => {
      if (!currentUser || !content.trim()) return;
      try {
        let response;
        if (type === 'project') {
          response = await api.addProjectComment(ids.projectId, {
            authorId: currentUser.id,
            content: content.trim(),
          });
          const project = findUserById(ids.projectId);
          if (project)
            await createAndSetNotification(
              `${currentUser.name} commented on project: "${project.name}"`
            );
        } else if (type === 'task' && ids.taskId) {
          response = await api.addTaskComment(ids.projectId, ids.taskId, {
            authorId: currentUser.id,
            content: content.trim(),
          });
          const project = projects.find((p) => p.id === ids.projectId);
          const task = project?.tasks.find((t) => t.id === ids.taskId);
          if (task)
            await createAndSetNotification(
              `${currentUser.name} commented on task: "${task.title}"`
            );
        }
        if (response) {
          setProjects((prev) =>
            prev.map((p) => (p.id === ids.projectId ? response.data : p))
          );
        }
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    },
    [currentUser, createAndSetNotification, findUserById, projects]
  );

  const markNotificationsAsRead = useCallback(async () => {
    try {
      const response = await api.markAllNotificationsAsRead();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, []);

  const addUser = useCallback(
    async (userData: {
      name: string;
      role: Role;
      email?: string;
      phone?: string;
      jobTitle?: string;
      hourlyRate?: number;
    }) => {
      if (!userData.name.trim()) return;
      try {
        const payload = {
          ...userData,
          name: userData.name.trim(),
          avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
          status: UserStatus.Active,
        };
        const response = await api.createUser(payload);
        setUsers((prev) => [...prev, response.data]);
      } catch (error) {
        console.error('Failed to add user:', error);
      }
    },
    []
  );

  const editUser = useCallback(
    async (updatedUser: Partial<User> & { id: number }) => {
      try {
        const response = await api.updateUser(updatedUser.id, updatedUser);
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? response.data : u))
        );
        if (currentUser && currentUser.id === updatedUser.id) {
          setCurrentUser((prev) => ({ ...prev!, ...response.data }));
        }
      } catch (error) {
        console.error('Failed to edit user:', error);
      }
    },
    [currentUser]
  );

  const updateUserStatus = useCallback(
    async (userId: number, status: UserStatus) => {
      if (currentUser && userId === currentUser.id) {
        alert('You cannot change your own account status.');
        return;
      }
      try {
        const response = await api.updateUser(userId, { status });
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? response.data : u))
        );
        await createAndSetNotification(
          `User "${
            response.data.name
          }" has been set to ${status.toLowerCase()}.`
        );
      } catch (error) {
        console.error('Failed to update user status:', error);
      }
    },
    [createAndSetNotification, currentUser]
  );

  const deleteUser = useCallback(
    async (userId: number) => {
      if (currentUser && userId === currentUser.id) {
        alert('You cannot delete your own account.');
        return;
      }
      try {
        await api.deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        // Refetch projects data as user deletion on backend might affect assignments
        const response = await api.getAllData();
        setProjects(response.data.projects);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    },
    [currentUser]
  );

  const addFileToProject = useCallback(
    async (projectId: number, file: Omit<ProjectFile, 'id'>) => {
      try {
        const response = await api.addFile(projectId, file);
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data : p))
        );
      } catch (error) {
        console.error('Failed to add file:', error);
      }
    },
    []
  );

  const deleteFileFromProject = useCallback(
    async (projectId: number, fileId: number) => {
      try {
        const response = await api.deleteFile(projectId, fileId);
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data : p))
        );
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    },
    []
  );

  const getEmployeeStats = useCallback(
    (employeeId: number) => {
      const relevantProjects = projects.filter((p) =>
        p.assignedTo.includes(employeeId)
      );
      const totalProjects = relevantProjects.length;
      const tasksCompleted = relevantProjects.reduce(
        (sum, p) =>
          sum + p.tasks.filter((t) => t.status === TaskStatus.Completed).length,
        0
      );
      const totalHours = relevantProjects.reduce(
        (sum, p) => sum + p.totalLoggedHours,
        0
      );
      return { totalProjects, tasksCompleted, totalHours };
    },
    [projects]
  );

  const getWeekNumber = useCallback((d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNo;
  }, []);

  // FIX: The type of leaveRequest was corrected to a specific object type to ensure compatibility with the API service.
  const requestLeave = useCallback(
    async (leaveRequest: {
      employeeId: number;
      startDate: string;
      endDate: string;
      reason: string;
    }) => {
      try {
        const response = await api.createLeaveRequest(leaveRequest);
        setLeaveRequests((prev) => [response.data, ...prev]);
        const employee = findUserById(leaveRequest.employeeId);
        await createAndSetNotification(
          `${employee?.name || 'An employee'} submitted a leave request.`
        );
      } catch (error) {
        console.error('Failed to request leave:', error);
      }
    },
    [createAndSetNotification, findUserById]
  );

  const updateLeaveStatus = useCallback(
    async (requestId: number, status: LeaveRequestStatus) => {
      try {
        const response = await api.updateLeaveRequestStatus(requestId, status);
        const updatedRequest = response.data;
        setLeaveRequests((prev) =>
          prev.map((req) => (req.id === requestId ? updatedRequest : req))
        );
        const employee = findUserById(updatedRequest.employeeId);
        await createAndSetNotification(
          `Your leave request for ${new Date(
            updatedRequest.startDate
          ).toLocaleDateString()} was ${status.toLowerCase()}.`
        );
      } catch (error) {
        console.error('Failed to update leave status:', error);
      }
    },
    [createAndSetNotification, findUserById]
  );

  // FIX: The type of standup was corrected to a specific object type to ensure compatibility with the API service.
  const submitStandup = useCallback(
    async (standup: {
      employeeId: number;
      date: string;
      yesterday: string;
      today: string;
      blockers: string;
    }) => {
      try {
        const response = await api.createStandup(standup);
        setDailyStandups((prev) => [
          response.data,
          ...prev.filter(
            (s) =>
              !(s.employeeId === standup.employeeId && s.date === standup.date)
          ),
        ]);
        const employee = findUserById(standup.employeeId);
        await createAndSetNotification(
          `${employee?.name || 'An employee'} submitted their daily standup.`
        );
      } catch (error) {
        console.error('Failed to submit standup:', error);
      }
    },
    [createAndSetNotification, findUserById]
  );

  const contextValue: AppContextType = {
    currentUser,
    users,
    projects,
    notifications,
    billingRecords,
    leaveRequests,
    dailyStandups,
    theme,
    isLoading,
    toggleTheme,
    login,
    logout,
    editProject,
    findUserById,
    addProject,
    deleteProject,
    addTask,
    updateTaskStatus,
    addUser,
    editUser,
    deleteUser,
    updateUserStatus,
    addFileToProject,
    deleteFileFromProject,
    logTimeToTask,
    addComment,
    markNotificationsAsRead,
    getEmployeeStats,
    getWeekNumber,
    requestLeave,
    updateLeaveStatus,
    submitStandup,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
