import React, { useState } from 'react';
import { User } from '../../types';
import { ProfileAvatar } from '../Common/ProfileAvatar';
import { MapPin, Building, Calendar, Star, MessageSquare, X, Send, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface MentorCardProps {
  mentor: User;
  commonSkills?: string[];
  onRequestMentorship: (mentorId: string, message: string) => void;
  isRecommended?: boolean;
  hasRequested?: boolean;
}

export function MentorCard({ mentor, commonSkills = [], onRequestMentorship, isRecommended = false, hasRequested = false }: MentorCardProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const { mentorAvailability, isSlotBooked } = useApp();

  // mentorAvailability is an array in context; find the entry for this mentor
  const availability = Array.isArray(mentorAvailability)
    ? mentorAvailability.find(a => a.userId === mentor.id)
    : (mentorAvailability as any)[mentor.id];

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const generateTimeSlots = (fromTime: string, toTime: string) => {
    const slots = [];
    const start = parseInt(fromTime.split(':')[0]);
    const end = parseInt(toTime.split(':')[0]);
    
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getAvailableSlots = () => {
    if (!availability || !availability.isAvailable) return [];
    
    const slots = [];
    for (const day of days) {
      const daySchedule = availability.schedule[day.key];
      if (daySchedule?.enabled) {
        const timeSlots = generateTimeSlots(daySchedule.fromTime, daySchedule.toTime);
        for (const time of timeSlots) {
          const booked = typeof isSlotBooked === 'function' ? isSlotBooked(mentor.id, day.key, time) : false;
          slots.push({ day: day.key, dayLabel: day.label, time, booked });
        }
      }
    }
    return slots;
  };

  const availableSlots = getAvailableSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSlot) {
      // Include slot information in the message
      const slotInfo = `${selectedSlot.day} at ${selectedSlot.time}`;
      const fullMessage = `${message}\n\nRequested slot: ${slotInfo}`;
      onRequestMentorship(mentor.id, fullMessage);
    } else {
      onRequestMentorship(mentor.id, message);
    }
    
    setShowRequestForm(false);
    setMessage('');
    setSelectedSlot(null);
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
        isRecommended ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
      } h-full flex flex-col`}>
        {isRecommended && (
          <div className="flex items-center space-x-2 mb-4">
            <Star className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Recommended Match</span>
          </div>
        )}

        <div className="flex items-start space-x-3 mb-4 min-w-0">
          <ProfileAvatar 
            name={mentor.name} 
            imageUrl={mentor.imageUrl} 
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{mentor.name}</h3>
            {mentor.jobTitle && mentor.employer && (
              <p className="text-sm text-gray-600 flex items-start mb-2">
                <Building className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span className="truncate">{mentor.jobTitle} at {mentor.employer}</span>
              </p>
            )}
            
            {mentor.department && mentor.gradYear && (
              <p className="text-sm text-gray-600 flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{mentor.department} • Class of {mentor.gradYear}</span>
              </p>
            )}
            
            {mentor.location && (
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{mentor.location}</span>
              </p>
            )}
          </div>
        </div>

        {mentor.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{mentor.bio}</p>
        )}

        {/* Skills */}
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1">
            {mentor.skills?.slice(0, 4).map((skill, index) => {
              const isCommon = commonSkills.includes(skill);
              return (
                <span
                  key={index}
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-md truncate max-w-24 ${
                    isCommon 
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  title={skill}
                >
                  {skill}
                  {isCommon && ' ✓'}
                </span>
              );
            })}
            {mentor.skills && mentor.skills.length > 4 && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md whitespace-nowrap">
                +{mentor.skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 mt-auto">
          
          <div className="space-y-2">
            <button
              onClick={() => setShowRequestForm(true)}
              disabled={hasRequested}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                hasRequested
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{hasRequested ? 'Request Sent' : 'Request Mentorship'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Request Mentorship from {mentor.name}
              </h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Available Slots Section */}
              {availableSlots.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Available Time Slots (Optional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableSlots.map((slot, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSlot?.day === slot.day && selectedSlot?.time === slot.time
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={selectedSlot?.day === slot.day && selectedSlot?.time === slot.time}
                          onChange={() => setSelectedSlot({ day: slot.day, time: slot.time })}
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{slot.dayLabel}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {slot.time}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">  </p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Introduce yourself and explain why you'd like {mentor.name} as your mentor
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  // placeholder={`Hi ${mentor.name}! I'm a student interested in pursuing a career in [field]. I'd love to learn from your experience at ${mentor.employer || '[company]'}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{selectedSlot ? 'Request Session' : 'Send Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}