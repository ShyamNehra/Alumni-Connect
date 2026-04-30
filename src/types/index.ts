export interface User {
  id: string;
  email: string;
  name: string;
  role: 'alumni' | 'student' | 'admin';
  rollNo?: string;
  certificateNo?: string;
  countryCode?: string;
  mobileNo?: string;
  gradYear?: number;
  department?: string;
  batch?: string;
  employer?: string;
  jobTitle?: string;
  skills?: string[];
  location?: string;
  bio?: string;
  linkedinUrl?: string;
  imageUrl?: string;
  willingToMentor?: boolean;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  attendees: string[];
  createdBy: string;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  targetCohort?: string;
  createdBy: string;
  createdAt: Date;
  pinned: boolean;
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  scheduledSlot?: {
    day: string;
    time: string;
  };
  createdAt: Date;
}

export interface Donation {
  id: string;
  donorId?: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface MentorAvailability {
  userId: string;
  isAvailable: boolean;
  schedule: {
    [key: string]: {
      enabled: boolean;
      fromTime: string;
      toTime: string;
    };
  };
}

export interface ScheduledSession {
  id: string;
  mentorId: string;
  menteeId: string;
  day: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}