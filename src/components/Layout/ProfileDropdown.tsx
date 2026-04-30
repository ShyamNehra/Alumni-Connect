import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../Common/ProfileAvatar';
import { User, Settings, LogOut, Eye, Edit } from 'lucide-react';

export function ProfileDropdown() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewProfile = () => {
    setIsOpen(false);
    // TODO: Navigate to profile view
  };

  const handleEditProfile = () => {
    setIsOpen(false);
    // Trigger profile edit (Ctrl/Cmd + P)
    const event = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
      metaKey: true,
    });
    window.dispatchEvent(event);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ProfileAvatar 
          name={currentUser.name} 
          imageUrl={currentUser.imageUrl} 
          size="sm"
          className="w-8 h-8"
        />
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {currentUser.name.split(' ')[0]}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ProfileAvatar 
                name={currentUser.name} 
                imageUrl={currentUser.imageUrl} 
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {currentUser.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    currentUser.role === 'admin' 
                      ? 'bg-red-100 text-red-800'
                      : currentUser.role === 'alumni'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'alumni' ? 'Alumni' : 'Student'}
                  </span>
                  {currentUser.department && (
                    <span className="text-xs text-gray-500">
                      {currentUser.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="space-y-2 text-sm">
              {currentUser.gradYear && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Graduation Year:</span>
                  <span className="text-gray-900">{currentUser.gradYear}</span>
                </div>
              )}
              {currentUser.batch && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Batch:</span>
                  <span className="text-gray-900">{currentUser.batch}</span>
                </div>
              )}
              {currentUser.location && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">{currentUser.location}</span>
                </div>
              )}
              {currentUser.employer && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Employer:</span>
                  <span className="text-gray-900">{currentUser.employer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Menu Options */}
          <div className="py-1">
            {/* hidden view profile option */}
            {/* <button
              onClick={handleViewProfile}
              className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View Profile</span>
            </button> */}
            
            <button
              onClick={handleEditProfile}
              className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
              <span className="ml-auto text-xs text-gray-400">Ctrl+P</span>
            </button>

            <div className="border-t border-gray-200 my-1"></div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}