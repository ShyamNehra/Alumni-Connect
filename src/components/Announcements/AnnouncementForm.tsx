import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, FileText, Users, Pin } from 'lucide-react';

interface AnnouncementFormProps {
  onClose: () => void;
}

export function AnnouncementForm({ onClose }: AnnouncementFormProps) {
  const { addAnnouncement } = useApp();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    targetCohort: '',
    pinned: false,
  });

  const cohortOptions = [
    'All',
    'Alumni',
    'Current Students',
    'Class of 2024',
    'Class of 2023',
    'Class of 2022',
    'Class of 2021',
    'Class of 2020',
    'Computer Science',
    'Electronics',
    'Management',
    'Finance',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    
    try {
      addAnnouncement({
        title: formData.title,
        body: formData.body,
        targetCohort: formData.targetCohort || undefined,
        createdBy: currentUser.id,
        pinned: formData.pinned,
      });

      onClose();
    } catch (error) {
      console.error('Failed to create announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Announcement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="body"
              rows={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your announcement here..."
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="targetCohort" className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="inline h-4 w-4 mr-1" />
              Target Audience (Optional)
            </label>
            <select
              id="targetCohort"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.targetCohort}
              onChange={(e) => setFormData(prev => ({ ...prev, targetCohort: e.target.value }))}
            >
              <option value="">All users</option>
              {cohortOptions.map(cohort => (
                <option key={cohort} value={cohort}>{cohort}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="pinned"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.pinned}
              onChange={(e) => setFormData(prev => ({ ...prev, pinned: e.target.checked }))}
            />
            <label htmlFor="pinned" className="ml-2 flex items-center text-sm text-gray-900">
              <Pin className="h-4 w-4 mr-1" />
              Pin this announcement
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}