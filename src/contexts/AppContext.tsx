import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Event, Announcement, MentorshipRequest, Donation, User, MentorAvailability, ScheduledSession } from '../types';
import { seedEvents, seedAnnouncements, seedDonations, seedUsers } from '../data/seedData';
import { supabase } from '../lib/supabase';

interface AppContextType {
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  rsvpEvent: (eventId: string, userId: string) => void;
  
  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  
  // Users
  users: User[];
  addUser: (user: User) => void;
  
  // Mentorship
  mentorshipRequests: MentorshipRequest[];
  requestMentorship: (request: Omit<MentorshipRequest, 'id' | 'createdAt'>) => void;
  updateMentorshipRequest: (requestId: string, status: MentorshipRequest['status']) => void;
  
  // Donations
  donations: Donation[];
  addDonation: (donation: Omit<Donation, 'id' | 'createdAt'>) => void;
  
  // Mentorship Scheduling
  mentorAvailability: MentorAvailability[];
  updateMentorAvailability: (userId: string, availability: Omit<MentorAvailability, 'userId'>) => void;
  scheduledSessions: ScheduledSession[];
  addScheduledSession: (session: Omit<ScheduledSession, 'id' | 'createdAt'>) => void;
  isSlotBooked: (mentorId: string, day: string, time: string) => boolean;
  
  // Status
  loading: boolean;
  isOffline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AuthProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!supabase);
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(seedAnnouncements);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>(seedDonations);
  const [mentorAvailability, setMentorAvailability] = useState<MentorAvailability[]>([
    {
      userId: 'alumni1',
      isAvailable: true,
      schedule: {
        monday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        tuesday: { enabled: true, fromTime: '10:00', toTime: '12:00' },
        wednesday: { enabled: true, fromTime: '14:00', toTime: '16:00' },
        thursday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        friday: { enabled: true, fromTime: '09:00', toTime: '10:00' },
        saturday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        sunday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      },
    },
    {
      userId: 'alumni2',
      isAvailable: true,
      schedule: {
        monday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        tuesday: { enabled: true, fromTime: '13:00', toTime: '17:00' },
        wednesday: { enabled: true, fromTime: '09:00', toTime: '12:00' },
        thursday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        friday: { enabled: true, fromTime: '15:00', toTime: '19:00' },
        saturday: { enabled: true, fromTime: '10:00', toTime: '14:00' },
        sunday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      },
    },
    {
      userId: 'alumni3',
      isAvailable: true,
      schedule: {
        monday: { enabled: true, fromTime: '08:00', toTime: '12:00' },
        tuesday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        wednesday: { enabled: true, fromTime: '14:00', toTime: '18:00' },
        thursday: { enabled: true, fromTime: '09:00', toTime: '13:00' },
        friday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        saturday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        sunday: { enabled: true, fromTime: '16:00', toTime: '20:00' },
      },
    },
    {
      userId: 'alumni6',
      isAvailable: true,
      schedule: {
        monday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        tuesday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        wednesday: { enabled: true, fromTime: '09:00', toTime: '12:00' },
        thursday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        friday: { enabled: true, fromTime: '15:00', toTime: '19:00' },
        saturday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        sunday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      },
    },
    {
      userId: 'alumni8',
      isAvailable: true,
      schedule: {
        monday: { enabled: true, fromTime: '08:00', toTime: '12:00' },
        tuesday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        wednesday: { enabled: true, fromTime: '14:00', toTime: '18:00' },
        thursday: { enabled: true, fromTime: '09:00', toTime: '13:00' },
        friday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        saturday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
        sunday: { enabled: true, fromTime: '16:00', toTime: '20:00' },
      },
    },
  ]);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const [
          { data: dbEvents },
          { data: dbAnnouncements },
          { data: dbUsers },
          { data: dbMentorshipRequests },
          { data: dbDonations }
        ] = await Promise.all([
          supabase.from('events').select('*'),
          supabase.from('announcements').select('*').order('createdAt', { ascending: false }),
          supabase.from('users').select('*'),
          supabase.from('mentorship_requests').select('*'),
          supabase.from('donations').select('*')
        ]);

        if (dbEvents) setEvents(dbEvents as unknown as Event[]);
        if (dbAnnouncements) setAnnouncements(dbAnnouncements as unknown as Announcement[]);
        if (dbUsers) setUsers(dbUsers as unknown as User[]);
        if (dbMentorshipRequests) setMentorshipRequests(dbMentorshipRequests as unknown as MentorshipRequest[]);
        if (dbDonations) setDonations(dbDonations as unknown as Donation[]);
        
        setIsOffline(false);
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}`,
      createdAt: new Date(),
    } as unknown as Event;

    if (supabase && !isOffline) {
      const { error } = await supabase.from('events').insert([newEvent]);
      if (error) console.error('Error adding event to Supabase:', error);
    }
    
    setEvents(prev => [...prev, newEvent]);
  };

  const rsvpEvent = async (eventId: string, userId: string) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const attendees = event.attendees.includes(userId)
          ? event.attendees.filter(id => id !== userId)
          : [...event.attendees, userId];
        
        const updatedEvent = { ...event, attendees };
        
        if (supabase && !isOffline) {
          supabase.from('events').update({ attendees }).eq('id', eventId)
            .then(({ error }) => {
              if (error) console.error('Error updating RSVP in Supabase:', error);
            });
        }
        
        return updatedEvent;
      }
      return event;
    });
    
    setEvents(updatedEvents);
  };

  const addAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `ann_${Date.now()}`,
      createdAt: new Date(),
    } as unknown as Announcement;

    if (supabase && !isOffline) {
      const { error } = await supabase.from('announcements').insert([newAnnouncement]);
      if (error) console.error('Error adding announcement to Supabase:', error);
    }

    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const addUser = async (user: User) => {
    if (supabase && !isOffline) {
      const { error } = await supabase.from('users').insert([user]);
      if (error) console.error('Error adding user to Supabase:', error);
    }
    setUsers(prev => [...prev, user]);
  };

  const requestMentorship = async (requestData: Omit<MentorshipRequest, 'id' | 'createdAt'>) => {
    // If message contains "Requested slot: <day> at <HH:MM>", parse it into scheduledSlot
    let scheduledSlot = (requestData as any).scheduledSlot;
    if (!scheduledSlot && requestData.message) {
      const slotMatch = requestData.message.match(/Requested slot:\s*(\w+) at (\d{2}:\d{2})/);
      if (slotMatch) {
        scheduledSlot = { day: slotMatch[1], time: slotMatch[2] };
      }
    }

    const newRequest: MentorshipRequest = {
      ...requestData,
      scheduledSlot,
      id: `req_${Date.now()}`,
      createdAt: new Date(),
    } as unknown as MentorshipRequest;

    if (supabase && !isOffline) {
      const { error } = await supabase.from('mentorship_requests').insert([newRequest]);
      if (error) console.error('Error adding mentorship request to Supabase:', error);
    }

    setMentorshipRequests(prev => [...prev, newRequest]);
  };

  const updateMentorshipRequest = async (requestId: string, status: MentorshipRequest['status']) => {
    if (supabase && !isOffline) {
      const { error } = await supabase.from('mentorship_requests').update({ status }).eq('id', requestId);
      if (error) console.error('Error updating mentorship request in Supabase:', error);
    }
    setMentorshipRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status } : req
    ));
  };

  const addDonation = async (donationData: Omit<Donation, 'id' | 'createdAt'>) => {
    const newDonation: Donation = {
      ...donationData,
      id: `don_${Date.now()}`,
      createdAt: new Date(),
    } as unknown as Donation;

    if (supabase && !isOffline) {
      const { error } = await supabase.from('donations').insert([newDonation]);
      if (error) console.error('Error adding donation to Supabase:', error);
    }

    setDonations(prev => [...prev, newDonation]);
  };

  const updateMentorAvailability = async (userId: string, availability: Omit<MentorAvailability, 'userId'>) => {
    if (supabase && !isOffline) {
      const { error } = await supabase.from('mentor_availability').upsert({ ...availability, userId });
      if (error) console.error('Error updating mentor availability in Supabase:', error);
    }

    setMentorAvailability(prev => {
      const existing = prev.find(a => a.userId === userId);
      if (existing) {
        return prev.map(a => a.userId === userId ? { ...availability, userId } : a);
      } else {
        return [...prev, { ...availability, userId }];
      }
    });
  };

  const addScheduledSession = async (sessionData: Omit<ScheduledSession, 'id' | 'createdAt'>) => {
    const newSession: ScheduledSession = {
      ...sessionData,
      id: `session_${Date.now()}`,
      createdAt: new Date(),
    } as unknown as ScheduledSession;

    if (supabase && !isOffline) {
      const { error } = await supabase.from('scheduled_sessions').insert([newSession]);
      if (error) console.error('Error adding scheduled session to Supabase:', error);
    }

    setScheduledSessions(prev => [...prev, newSession]);
  };

  const isSlotBooked = (mentorId: string, day: string, time: string) => {
    return scheduledSessions.some(session => 
      session.mentorId === mentorId && 
      session.day === day && 
      session.time === time &&
      session.status === 'scheduled'
    );
  };

  const value: AppContextType = {
    events,
    addEvent,
    rsvpEvent,
    announcements,
    addAnnouncement,
    users,
    addUser,
    mentorshipRequests,
    requestMentorship,
    updateMentorshipRequest,
    donations,
    addDonation,
    mentorAvailability,
    updateMentorAvailability,
    scheduledSessions,
    addScheduledSession,
    isSlotBooked,
    loading,
    isOffline,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}