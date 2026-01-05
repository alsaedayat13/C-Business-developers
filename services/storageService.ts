
import { 
  UserRecord, 
  StartupRecord, 
  TaskRecord, 
  ServiceRequest, 
  INITIAL_ROADMAP,
  UserRole,
  UserProfile,
  LevelData,
  SupportTicket,
  TicketType,
  PartnerProfile,
  PartnershipRequest,
  KPIRecord
} from '../types';

const KEYS = {
  USERS: 'bd_users_v2',
  STARTUPS: 'bd_startups_v2',
  TASKS: 'bd_tasks_v2',
  SERVICES: 'bd_services_v2',
  TICKETS: 'bd_tickets_v2',
  SESSION: 'bd_current_session',
  ROADMAP_PREFIX: 'bd_roadmap_',
  PARTNERS: 'bd_partners_v2',
  PARTNERSHIP_REQUESTS: 'bd_partnership_requests_v2'
};

export const storageService = {
  registerUser: (profile: UserProfile): { user: UserRecord; startup?: StartupRecord } => {
    const users = storageService.getAllUsers();
    const startups = storageService.getAllStartups();
    
    const uid = `u_${Date.now()}`;
    const newUser: UserRecord = {
      uid,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      role: profile.role || 'STARTUP',
      phone: profile.phone,
      city: profile.city,
      earnedBadges: [],
      skills: profile.skills || [],
      linkedin: profile.linkedin,
      createdAt: new Date().toISOString()
    };

    let newStartup: StartupRecord | undefined;

    if (newUser.role === 'STARTUP') {
      newStartup = {
        projectId: `p_${Date.now()}`,
        ownerId: uid,
        ownerName: `${newUser.firstName} ${newUser.lastName}`,
        name: profile.startupName || 'مشروع جديد',
        description: profile.startupDescription || '',
        industry: profile.industry || 'Technology',
        status: 'PENDING',
        currentTrack: 'Idea',
        metrics: { readiness: 10, tech: 0, market: 0 },
        // Fixed missing revenue and burnRate properties in kpiHistory
        kpiHistory: [
          { date: 'أسبوع 1', growth: 10, techReadiness: 10, marketEngagement: 5, revenue: 0, burnRate: 0 }
        ],
        riskLevel: 'Low',
        aiOpinion: 'بانتظار المخرجات الأولى للتقييم الذكي.',
        partners: [],
        lastActivity: new Date().toISOString()
      };
      
      localStorage.setItem(`${KEYS.ROADMAP_PREFIX}${uid}`, JSON.stringify(INITIAL_ROADMAP));
      
      const initialTasks: TaskRecord[] = INITIAL_ROADMAP.map(level => ({
        id: `t_${level.id}_${uid}`,
        uid,
        projectId: newStartup!.projectId,
        levelId: level.id,
        title: `مخرج المرحلة: ${level.title}`,
        description: level.description,
        status: level.isLocked ? 'LOCKED' : 'ASSIGNED'
      }));
      
      const allTasks = storageService.getAllTasks();
      localStorage.setItem(KEYS.TASKS, JSON.stringify([...allTasks, ...initialTasks]));
      localStorage.setItem(KEYS.STARTUPS, JSON.stringify([...startups, newStartup]));
    }

    localStorage.setItem(KEYS.USERS, JSON.stringify([...users, newUser]));
    storageService.setSession(uid, newStartup?.projectId);
    
    return { user: newUser, startup: newStartup };
  },

  loginUser: (email: string): { user: UserRecord; startup?: StartupRecord } | null => {
    const users = storageService.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const startups = storageService.getAllStartups();
    const startup = startups.find(s => s.ownerId === user.uid);
    storageService.setSession(user.uid, startup?.projectId);
    return { user, startup };
  },

  getAllUsers: (): UserRecord[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  getAllStartups: (): StartupRecord[] => JSON.parse(localStorage.getItem(KEYS.STARTUPS) || '[]'),
  getAllTasks: (): TaskRecord[] => JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]'),
  
  updateUser: (uid: string, data: Partial<UserRecord>) => {
    const users = storageService.getAllUsers();
    const updated = users.map(u => u.uid === uid ? { ...u, ...data } : u);
    localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
  },

  updateStartup: (projectId: string, data: Partial<StartupRecord>) => {
    const startups = storageService.getAllStartups();
    const updated = startups.map(s => s.projectId === projectId ? { ...s, ...data, lastActivity: new Date().toISOString() } : s);
    localStorage.setItem(KEYS.STARTUPS, JSON.stringify(updated));
  },

  addKPIRecord: (projectId: string, record: KPIRecord) => {
    const startups = storageService.getAllStartups();
    const updated = startups.map(s => {
      if (s.projectId === projectId) {
        const history = s.kpiHistory || [];
        return {
          ...s,
          kpiHistory: [...history, record],
          metrics: {
            ...s.metrics,
            readiness: record.growth,
            tech: record.techReadiness,
            market: record.marketEngagement
          },
          lastActivity: new Date().toISOString()
        };
      }
      return s;
    });
    localStorage.setItem(KEYS.STARTUPS, JSON.stringify(updated));
  },

  getUserTasks: (uid: string): TaskRecord[] => {
    return storageService.getAllTasks().filter(t => t.uid === uid);
  },

  createCustomTask: (uid: string, projectId: string, title: string, description: string): TaskRecord => {
    const tasks = storageService.getAllTasks();
    const newTask: TaskRecord = {
      id: `custom_${Date.now()}_${uid}`,
      uid,
      projectId,
      levelId: 0, 
      title,
      description,
      status: 'ASSIGNED'
    };
    const updatedTasks = [...tasks, newTask];
    localStorage.setItem(KEYS.TASKS, JSON.stringify(updatedTasks));
    return newTask;
  },

  submitTask: (uid: string, taskId: string, submission: { fileData: string; fileName: string }, aiReview?: any) => {
    const tasks = storageService.getAllTasks();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'SUBMITTED' as const,
          submission: { ...submission, submittedAt: new Date().toISOString() },
          aiReview
        };
      }
      return t;
    });
    localStorage.setItem(KEYS.TASKS, JSON.stringify(updated));
  },

  getCurrentRoadmap: (uid: string): LevelData[] => {
    const rawData = localStorage.getItem(`${KEYS.ROADMAP_PREFIX}${uid}`);
    let roadmap: LevelData[] = rawData ? JSON.parse(rawData) : INITIAL_ROADMAP;
    
    // Ensure 4, 5, 6 are unlocked if we are syncing with the latest program requirements
    let roadmapNeedsUpdate = false;
    roadmap = roadmap.map(lvl => {
      if ([4, 5, 6].includes(lvl.id) && lvl.isLocked) {
        roadmapNeedsUpdate = true;
        return { ...lvl, isLocked: false };
      }
      return lvl;
    });

    if (roadmapNeedsUpdate) {
      localStorage.setItem(`${KEYS.ROADMAP_PREFIX}${uid}`, JSON.stringify(roadmap));
    }

    const allTasks = storageService.getAllTasks();
    const userTasks = allTasks.filter(t => t.uid === uid);
    const startups = storageService.getAllStartups();
    const userStartup = startups.find(s => s.ownerId === uid);
    
    let tasksAdded = false;
    const newTasks: TaskRecord[] = [];

    roadmap.forEach(level => {
      const existingTask = userTasks.find(t => t.levelId === level.id);
      if (!existingTask && userStartup) {
        tasksAdded = true;
        newTasks.push({
          id: `t_${level.id}_${uid}`,
          uid,
          projectId: userStartup.projectId,
          levelId: level.id,
          title: `مخرج المرحلة: ${level.title}`,
          description: level.description,
          status: level.isLocked ? 'LOCKED' : 'ASSIGNED' 
        });
      } else if (existingTask && !level.isLocked && existingTask.status === 'LOCKED') {
        tasksAdded = true;
        existingTask.status = 'ASSIGNED';
      }
    });

    if (tasksAdded) {
      const otherUserTasks = allTasks.filter(t => t.uid !== uid);
      const currentUserUpdatedTasks = [...userTasks, ...newTasks];
      localStorage.setItem(KEYS.TASKS, JSON.stringify([...otherUserTasks, ...currentUserUpdatedTasks]));
    }

    return roadmap;
  },

  completeLevel: (uid: string, levelId: number) => {
    const currentRoadmap = storageService.getCurrentRoadmap(uid);
    const updatedRoadmap = currentRoadmap.map(lvl => {
      if (lvl.id === levelId) return { ...lvl, isCompleted: true };
      if (lvl.id === levelId + 1) return { ...lvl, isLocked: false };
      return lvl;
    });
    localStorage.setItem(`${KEYS.ROADMAP_PREFIX}${uid}`, JSON.stringify(updatedRoadmap));

    const allTasks = storageService.getAllTasks();
    const updatedTasks = allTasks.map(t => {
      if (t.uid === uid) {
        if (t.levelId === levelId) return { ...t, status: 'APPROVED' as const };
        if (t.levelId === levelId + 1 && t.status === 'LOCKED') return { ...t, status: 'ASSIGNED' as const };
      }
      return t;
    });
    localStorage.setItem(KEYS.TASKS, JSON.stringify(updatedTasks));

    const session = storageService.getCurrentSession();
    if (session?.projectId) {
      const startups = storageService.getAllStartups();
      const updatedStartups = startups.map(s => {
        if (s.projectId === session.projectId) {
          const newReadiness = Math.min(100, s.metrics.readiness + 15);
          return {
            ...s,
            metrics: { ...s.metrics, readiness: newReadiness },
            lastActivity: new Date().toISOString()
          };
        }
        return s;
      });
      localStorage.setItem(KEYS.STARTUPS, JSON.stringify(updatedStartups));
    }
  },

  createSupportTicket: (uid: string, projectId: string, type: TicketType, subject: string, message: string): SupportTicket => {
    const tickets = storageService.getAllTickets();
    const newTicket: SupportTicket = {
      id: `tk_${Date.now()}`,
      uid,
      projectId,
      type,
      subject,
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(KEYS.TICKETS, JSON.stringify([...tickets, newTicket]));
    return newTicket;
  },

  getAllTickets: (): SupportTicket[] => JSON.parse(localStorage.getItem(KEYS.TICKETS) || '[]'),
  getUserTickets: (uid: string): SupportTicket[] => storageService.getAllTickets().filter(t => t.uid === uid),
  getUserServiceRequests: (uid: string): ServiceRequest[] => JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]').filter((r: any) => r.uid === uid),
  setSession: (uid: string, projectId?: string) => localStorage.setItem(KEYS.SESSION, JSON.stringify({ uid, projectId })),
  getCurrentSession: () => {
    const session = localStorage.getItem(KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },
  logout: () => localStorage.removeItem(KEYS.SESSION),
  requestService: (uid: string, serviceId: string, packageId: string, details: string) => {
    const requests = JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
    const newRequest: ServiceRequest = {
      id: `sr_${Date.now()}`,
      uid,
      projectId: storageService.getCurrentSession()?.projectId || '',
      serviceId,
      packageId,
      details,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(KEYS.SERVICES, JSON.stringify([...requests, newRequest]));
  },
  seedDemoAccounts: () => {
    const users = storageService.getAllUsers();
    if (users.length > 0) return;

    storageService.registerUser({
      firstName: 'فيصل', lastName: 'القحطاني', email: 'startup@demo.com', phone: '0500000000', role: 'STARTUP', startupName: 'تيك-لوجيك', industry: 'Technology'
    });
    storageService.registerUser({
      firstName: 'سارة', lastName: 'المهدي', email: 'partner@demo.com', phone: '0501111111', role: 'PARTNER'
    });
    storageService.registerUser({
      firstName: 'خالد', lastName: 'العمري', email: 'mentor@demo.com', phone: '0502222222', role: 'MENTOR'
    });
    storageService.registerUser({
      firstName: 'المدير', lastName: 'العام', email: 'admin@demo.com', phone: '0503333333', role: 'ADMIN'
    });
  },
  getAllPartners: (): PartnerProfile[] => JSON.parse(localStorage.getItem(KEYS.PARTNERS) || '[]'),
  registerAsPartner: (profile: PartnerProfile) => {
    const partners = storageService.getAllPartners();
    const index = partners.findIndex(p => p.uid === profile.uid);
    if (index >= 0) partners[index] = profile;
    else partners.push(profile);
    localStorage.setItem(KEYS.PARTNERS, JSON.stringify(partners));
  },
  sendPartnershipRequest: (startupId: string, startupName: string, partnerUid: string, message: string) => {
    const requests: PartnershipRequest[] = JSON.parse(localStorage.getItem(KEYS.PARTNERSHIP_REQUESTS) || '[]');
    const newRequest: PartnershipRequest = {
      id: `prq_${Date.now()}`,
      startupId,
      startupName,
      partnerUid,
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(KEYS.PARTNERSHIP_REQUESTS, JSON.stringify([...requests, newRequest]));
  },
  getPartnerRequests: (partnerUid: string): PartnershipRequest[] => {
    const requests: PartnershipRequest[] = JSON.parse(localStorage.getItem(KEYS.PARTNERSHIP_REQUESTS) || '[]');
    return requests.filter(r => r.partnerUid === partnerUid);
  },
  updatePartnershipStatus: (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const requests: PartnershipRequest[] = JSON.parse(localStorage.getItem(KEYS.PARTNERSHIP_REQUESTS) || '[]');
    const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
    localStorage.setItem(KEYS.PARTNERSHIP_REQUESTS, JSON.stringify(updated));
  }
};
