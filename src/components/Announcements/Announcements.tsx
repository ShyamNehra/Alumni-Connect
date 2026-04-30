import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { Megaphone, Plus, Pin, Clock } from 'lucide-react';
import { AnnouncementForm } from './AnnouncementForm';

export function Announcements() {
  const { announcements } = useApp();
  const { currentUser } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const sortedAnnouncements = announcements.sort((a, b) => {
    // Pinned announcements first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h1>
      <p className="text-gray-600">
        Stay updated with the latest news and important information.
      </p>
    </div>
    {currentUser?.role === 'admin' && (
      <button
        onClick={() => setShowCreateForm(true)}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        <span>New Announcement</span>
      </button>
    )}
  </div>


      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
          <p className="text-gray-500">Check back later for important updates and news.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow-sm border transition-shadow hover:shadow-md ${
                announcement.pinned
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {announcement.pinned && (
                        <Pin className="h-4 w-4 text-yellow-600" />
                      )}
                      <h2 className="text-xl font-semibold text-gray-900">
                        {announcement.title}
                      </h2>
                      {announcement.pinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pinned
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{format(announcement.createdAt, 'MMMM dd, yyyy • h:mm a')}</span>
                      {announcement.targetCohort && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Target: {announcement.targetCohort}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {announcement.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateForm && (
        <AnnouncementForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}