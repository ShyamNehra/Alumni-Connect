import React from 'react';
import { Event, User } from '../../types';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

interface EventCardProps {
  event: Event;
  currentUser: User | null;
  onRSVP: (eventId: string) => void;
}

export function EventCard({ event, currentUser, onRSVP }: EventCardProps) {
  const now = new Date();
  const isUpcoming = isAfter(event.date, now);
  const isPast = isBefore(event.date, now);
  const isUserAttending = currentUser && event.attendees.includes(currentUser.id);
  const spotsRemaining = event.capacity - event.attendees.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isUpcoming 
                ? 'bg-green-100 text-green-800'
                : isPast
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Today'}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(event.date, 'EEEE, MMMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(event.date, 'h:mm a')}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {event.attendees.length} attending
              {event.capacity > 0 && (
                <span className="text-gray-500">
                  {' • '}
                  {spotsRemaining > 0 ? `${spotsRemaining} spots left` : 'Full'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* RSVP Section */}
        {currentUser && isUpcoming && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center">
              {isUserAttending ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">You're attending</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Not attending</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => onRSVP(event.id)}
              disabled={!isUserAttending && spotsRemaining === 0}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isUserAttending
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : spotsRemaining > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isUserAttending ? 'Cancel' : spotsRemaining > 0 ? 'Book your spot' : 'Full'}
            </button>
          </div>
        )}

        {isPast && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              This event has ended • {event.attendees.length} attended
            </p>
          </div>
        )}
      </div>
    </div>
  );
}