import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { X, Calendar, Clock, Send, CheckCircle } from 'lucide-react';

interface SchedulingModalProps {
  mentor: User;
  onClose: () => void;
  onScheduled: (mentorName: string, day: string, time: string) => void;
}

export function SchedulingModal({ mentor, onClose, onScheduled }: SchedulingModalProps) {
  const { mentorAvailability, addScheduledSession, isSlotBooked } = useApp();
  const { currentUser } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // mentorAvailability in context is an array; find the mentor's availability
  const availability = Array.isArray(mentorAvailability)
    ? mentorAvailability.find(a => a.userId === mentor.id)
    : undefined;

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
          const booked = isSlotBooked(mentor.id, day.key, time);
          slots.push({ day: day.key, dayLabel: day.label, time, booked });
        }
      }
    }
    return slots;
  };

  const availableSlots = getAvailableSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !currentUser) return;

    setLoading(true);
    
    try {
      // Add scheduled session
      addScheduledSession({
        mentorId: mentor.id,
        menteeId: currentUser.id,
        day: selectedSlot.day,
        time: selectedSlot.time,
        status: 'scheduled',
      });

      // Call the callback to show toast
      const dayLabel = days.find(d => d.key === selectedSlot.day)?.label || selectedSlot.day;
      onScheduled(mentor.name, dayLabel, selectedSlot.time);
      
      onClose();
    } catch (error) {
      console.error('Failed to schedule session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Schedule Mentorship with {mentor.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h3>
              <p className="text-gray-500">
                {mentor.name} doesn't have any available time slots at the moment.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Available Time Slots
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {availableSlots.map((slot: any, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg transition-colors ${
                        slot.booked
                          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedSlot?.day === slot.day && selectedSlot?.time === slot.time
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeSlot"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={selectedSlot?.day === slot.day && selectedSlot?.time === slot.time}
                        onChange={() => !slot.booked && setSelectedSlot({ day: slot.day, time: slot.time })}
                        disabled={slot.booked}
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
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Introduction Message
                </label>
                <textarea
                  id="message"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Briefly introduce yourself and what you'd like to discuss..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSlot || loading}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Scheduling...' : 'Schedule Session'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}