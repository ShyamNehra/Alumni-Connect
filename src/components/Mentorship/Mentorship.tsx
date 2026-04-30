import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { HandHeart, Search, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import { MentorCard } from './MentorCard';
import { SchedulingModal } from './SchedulingModal';
import { Toast } from '../Common/Toast';

export function Mentorship() {
  const { users, mentorshipRequests, requestMentorship, updateMentorshipRequest } = useApp();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    skills: '',
  });

  // Get available mentors (alumni willing to mentor, excluding current user)
  const availableMentors = users.filter(user => 
    user.role === 'alumni' && 
    user.willingToMentor && 
    user.id !== currentUser?.id
  );

  // Filter mentors based on search and filters
  const filteredMentors = useMemo(() => {
    return availableMentors.filter(mentor => {
      const matchesSearch = searchTerm === '' || 
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.employer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = !filters.department || mentor.department === filters.department;
      const matchesLocation = !filters.location || mentor.location === filters.location;
      const matchesSkills = !filters.skills || 
        mentor.skills?.some(skill => skill.toLowerCase().includes(filters.skills.toLowerCase()));

      return matchesSearch && matchesDepartment && matchesLocation && matchesSkills;
    });
  }, [availableMentors, searchTerm, filters]);

  // Smart mentor matching algorithm
  const getMatchedMentors = (mentee: User) => {
    if (!mentee.department || !mentee.skills) return [];

    return filteredMentors
      .map(mentor => {
        let score = 0;
        
        // Department match (40 points)
        if (mentor.department === mentee.department) {
          score += 40;
        }
        
        // Skills overlap (30 points)
        const commonSkills = mentor.skills?.filter(skill => 
          mentee.skills?.some(menteeSkill => 
            menteeSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(menteeSkill.toLowerCase())
          )
        ) || [];
        score += Math.min(commonSkills.length * 10, 30);
        
        // Location match (20 points)
        if (mentor.location === mentee.location) {
          score += 20;
        }
        
        // Experience level (10 points for senior roles)
        if (mentor.jobTitle?.toLowerCase().includes('senior') || 
            mentor.jobTitle?.toLowerCase().includes('lead') ||
            mentor.jobTitle?.toLowerCase().includes('manager')) {
          score += 10;
        }

        return { mentor, score, commonSkills };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  };

  const matchedMentors = currentUser ? getMatchedMentors(currentUser) : [];

  // Get user's mentorship requests
  const userRequests = mentorshipRequests.filter(req => 
    req.menteeId === currentUser?.id || req.mentorId === currentUser?.id
  );

  const handleRequestMentorship = (mentorId: string, message: string) => {
    if (!currentUser) return;
    
    // Extract slot information if present
    const slotMatch = message.match(/Requested slot: (\w+) at (\d{2}:\d{2})/);
    let toastMessage = `Request sent to ${users.find(u => u.id === mentorId)?.name}`;
    
    if (slotMatch) {
      const [, day, time] = slotMatch;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
      toastMessage += ` for ${dayLabel} at ${time}`;
    }
    
    requestMentorship({
      menteeId: currentUser.id,
      mentorId,
      status: 'pending',
      message,
    });
    
    setToast(toastMessage);
  };

  const handleScheduleRequest = (mentor: User) => {
    setSelectedMentor(mentor);
    setShowSchedulingModal(true);
  };

  const handleScheduled = (mentorName: string, day: string, time: string) => {
    setToast(`Request sent to ${mentorName} for ${day} at ${time}`);
  };

  const handleUpdateRequest = (requestId: string, status: 'accepted' | 'declined') => {
    updateMentorshipRequest(requestId, status);
  };

  const departments = [...new Set(availableMentors.map(m => m.department).filter(Boolean))];
  const locations = [...new Set(availableMentors.map(m => m.location).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentorship</h1>
        <p className="text-gray-600">
          Connect with experienced alumni for career guidance and professional growth.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('find')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'find'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Find Mentors
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {availableMentors.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Requests
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {userRequests.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'find' ? (
        <>
          {/* Smart Matches Section */}
          {matchedMentors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HandHeart className="h-5 w-5 text-orange-600 mr-2" />
                Recommended for You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {matchedMentors.slice(0, 3).map(({ mentor, commonSkills }) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    commonSkills={commonSkills}
                    onRequestMentorship={handleRequestMentorship}
                    isRecommended={true}
                    onScheduleRequest={handleScheduleRequest}
                    hasRequested={mentorshipRequests.some(req => 
                      req.menteeId === currentUser?.id && req.mentorId === mentor.id
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentors by name, company, skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Filter by skills..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.skills}
                  onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* All Mentors */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              All Mentors ({filteredMentors.length})
            </h2>
            {filteredMentors.length === 0 ? (
              <div className="text-center py-12">
                <HandHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
                <p className="text-gray-500">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onRequestMentorship={handleRequestMentorship}
                    onScheduleRequest={handleScheduleRequest}
                    hasRequested={mentorshipRequests.some(req => 
                      req.menteeId === currentUser?.id && req.mentorId === mentor.id
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Requests Tab */
        <div>
          {userRequests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-500">
                {currentUser?.role === 'student' 
                  ? 'Start by requesting mentorship from alumni in the Find Mentors tab.'
                  : 'Mentorship requests will appear here when students reach out to you.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {userRequests.map((request) => {
                const isIncoming = request.mentorId === currentUser?.id;
                const otherUser = users.find(u => u.id === (isIncoming ? request.menteeId : request.mentorId));
                
                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {isIncoming ? 'Mentorship Request from' : 'Request to'} {otherUser?.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'pending' && <Clock className="inline h-3 w-3 mr-1" />}
                            {request.status === 'accepted' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                            {request.status === 'declined' && <XCircle className="inline h-3 w-3 mr-1" />}
                            {request.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {otherUser?.jobTitle} at {otherUser?.employer}
                        </p>
                        
                        {request.message && (
                          <div className="bg-gray-50 rounded-md p-3 mb-4">
                            <p className="text-sm text-gray-700">"{request.message}"</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Requested on {request.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      
                      {isIncoming && request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateRequest(request.id, 'accepted')}
                            className="px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateRequest(request.id, 'declined')}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Scheduling Modal */}
      {showSchedulingModal && selectedMentor && (
        <SchedulingModal
          mentor={selectedMentor}
          onClose={() => {
            setShowSchedulingModal(false);
            setSelectedMentor(null);
          }}
          onScheduled={handleScheduled}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}