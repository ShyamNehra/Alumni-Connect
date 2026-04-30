import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { User } from '../../types';
import { Save, X, Phone, Globe, User as UserIcon, Building, MapPin, Calendar, Clock } from 'lucide-react';

interface ProfileFormProps {
  onClose: () => void;
}

export function ProfileForm({ onClose }: ProfileFormProps) {
  const { currentUser, updateProfile } = useAuth();
  const { mentorAvailability, updateMentorAvailability } = useApp();
  
  const userAvailability = mentorAvailability.find(a => a.userId === currentUser?.id);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    rollNo: currentUser?.rollNo || '',
    certificateNo: currentUser?.certificateNo || '',
    countryCode: currentUser?.countryCode || '+91',
    mobileNo: currentUser?.mobileNo || '',
    employer: currentUser?.employer || '',
    jobTitle: currentUser?.jobTitle || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
    linkedinUrl: currentUser?.linkedinUrl || '',
    imageUrl: currentUser?.imageUrl || '',
    willingToMentor: currentUser?.willingToMentor || false,
    skills: currentUser?.skills?.join(', ') || '',
  });

  const [availabilityData, setAvailabilityData] = useState({
    isAvailable: userAvailability?.isAvailable || false,
    schedule: userAvailability?.schedule || {
      monday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      tuesday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      wednesday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      thursday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      friday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      saturday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
      sunday: { enabled: false, fromTime: '09:00', toTime: '17:00' },
    },
  });

  const countryCodes = ['+91', '+1', '+44', '+61', '+65', '+971', '+49', '+33', '+81', '+86'];
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const [loading, setLoading] = useState(false);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      updateProfile({
        name: formData.name,
        rollNo: formData.rollNo,
        certificateNo: formData.certificateNo,
        countryCode: formData.countryCode,
        mobileNo: formData.mobileNo,
        employer: formData.employer,
        jobTitle: formData.jobTitle,
        location: formData.location,
        bio: formData.bio,
        linkedinUrl: formData.linkedinUrl,
        imageUrl: formData.imageUrl,
        willingToMentor: formData.willingToMentor,
        skills: skillsArray,
      });

      // Update mentorship availability if user is alumni
      if (currentUser.role === 'alumni') {
        updateMentorAvailability(currentUser.id, availabilityData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = (enabled: boolean) => {
    setAvailabilityData(prev => ({ ...prev, isAvailable: enabled }));
  };

  const handleScheduleChange = (day: string, field: string, value: string | boolean) => {
    setAvailabilityData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form id="profile-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-1">
                {currentUser?.role === 'alumni' ? 'Certificate/Roll Number' : 'Roll Number'}
              </label>
              <input
                id="rollNo"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={currentUser?.role === 'alumni' ? formData.certificateNo : formData.rollNo}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [currentUser?.role === 'alumni' ? 'certificateNo' : 'rollNo']: e.target.value 
                }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 mr-1" />
                Mobile Number
              </label>
              <div className="flex space-x-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.countryCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                >
                  {countryCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNo: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedinUrl" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Globe className="h-4 w-4 mr-1" />
                LinkedIn URL
              </label>
              <input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Globe className="h-4 w-4 mr-1" />
                Profile Picture URL
              </label>
              <input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a link to your profile picture. Leave empty to use default avatar.
              </p>
            </div>

            {currentUser?.role === 'alumni' && (
              <>
            <div>
                <label htmlFor="employer" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Building className="h-4 w-4 mr-1" />
                Current Employer
              </label>
              <input
                id="employer"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.employer}
                onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                id="jobTitle"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>
              </>
            )}

            <div>
              <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                Location
              </label>
              <input
                id="location"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              type="text"
              placeholder="React, Node.js, Python, Machine Learning"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself, your experience, and interests..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>

          {currentUser?.role === 'alumni' && (
            <div className="flex items-center">
              <input
                id="willingToMentor"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.willingToMentor}
                onChange={(e) => setFormData(prev => ({ ...prev, willingToMentor: e.target.checked }))}
              />
              <label htmlFor="willingToMentor" className="ml-2 block text-sm text-gray-900">
                I'm available to mentor students
              </label>
            </div>
          )}

          {currentUser?.role === 'alumni' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Mentorship Availability
                </h3>
                
                <div className="flex items-center mb-4">
                  <input
                    id="mentorshipAvailable"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={availabilityData.isAvailable}
                    onChange={(e) => handleAvailabilityToggle(e.target.checked)}
                  />
                  <label htmlFor="mentorshipAvailable" className="ml-2 block text-sm text-gray-900">
                    I'm available for mentorship sessions
                  </label>
                </div>

                {availabilityData.isAvailable && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Select your available days and time slots:
                    </p>
                    {days.map((day) => (
                      <div key={day.key} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center min-w-0 flex-1">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={availabilityData.schedule[day.key]?.enabled || false}
                            onChange={(e) => handleScheduleChange(day.key, 'enabled', e.target.checked)}
                          />
                          <label className="ml-2 text-sm font-medium text-gray-700 min-w-0">
                            {day.label}
                          </label>
                        </div>
                        
                        {availabilityData.schedule[day.key]?.enabled && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <select
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              value={availabilityData.schedule[day.key]?.fromTime || '09:00'}
                              onChange={(e) => handleScheduleChange(day.key, 'fromTime', e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            <span className="text-sm text-gray-500">to</span>
                            <select
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              value={availabilityData.schedule[day.key]?.toTime || '17:00'}
                              onChange={(e) => handleScheduleChange(day.key, 'toTime', e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          </form>
        </div>
        
        {/* Fixed footer with action buttons */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}