import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { seedUsers } from '../data/seedData';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      // Check localStorage first
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      // Sync users from Supabase if available
      if (supabase) {
        try {
          const { data, error } = await supabase.from('users').select('*');
          if (data && data.length > 0) {
            setUsers(data as unknown as User[]);
          }
          if (error) console.error('Supabase users fetch error:', error);
        } catch (e) {
          console.error('Supabase connection failed, using seed data:', e);
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real production app with Supabase, we would use supabase.auth.signInWithPassword
    // For this transition phase, we authenticate against our fetched users list
    const user = users.find(u => u.email === email);
    
    // Demo passwords logic (maintained for backward compatibility with seed data)
    const validPassword = password === 'password' || (user?.role === 'admin' && password === 'admin123');
    
    if (user && validPassword) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, userData: Partial<User>): Promise<boolean> => {
    if (users.find(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: userData.name || '',
      role: userData.role || 'student',
      gradYear: userData.gradYear,
      department: userData.department,
      batch: userData.batch,
      skills: userData.skills || [],
      location: userData.location,
      bio: userData.bio,
      imageUrl: userData.imageUrl,
      willingToMentor: userData.willingToMentor || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (supabase) {
      const { error } = await supabase.from('users').insert([newUser]);
      if (error) console.error('Error saving user to Supabase:', error);
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        ...userData,
        updatedAt: new Date(),
      };

      if (supabase) {
        const { error } = await supabase.from('users').update(updatedUser).eq('id', currentUser.id);
        if (error) console.error('Error updating profile in Supabase:', error);
      }

      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}