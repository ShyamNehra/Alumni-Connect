import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Event } from '../../types';
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { EventForm } from './EventForm';
import { EventCard } from './EventCard';

export function Events() {
  const { events, rsvpEvent } = useApp();
  const { currentUser } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const now = new Date();
  
  const filteredEvents = events
    .filter(event => {
      if (filter === 'upcoming') return isAfter(event.date, now);
      if (filter === 'past') return isBefore(event.date, now);
      return true;
    })
    .sort((a, b) => {
      if (filter === 'past') {
        return b.date.getTime() - a.date.getTime();
      }
      return a.date.getTime() - b.date.getTime();
    });

  const handleRSVP = (eventId: string) => {
    if (currentUser) {
      rsvpEvent(eventId, currentUser.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Events</h1>
      <p className="text-gray-600">
        Discover and participate in alumni and student events.
      </p>
    </div>
    {currentUser?.role === 'admin' && (
      <button
        onClick={() => setShowCreateForm(true)}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Create Event</span>
      </button>
    )}
  </div>


      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'upcoming', label: 'Upcoming', count: events.filter(e => isAfter(e.date, now)).length },
              { key: 'past', label: 'Past', count: events.filter(e => isBefore(e.date, now)).length },
              { key: 'all', label: 'All', count: events.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {filter === 'all' ? '' : filter} events
          </h3>
          <p className="text-gray-500">
            {filter === 'upcoming' 
              ? 'Check back later for new events or browse past events.'
              : filter === 'past'
              ? 'No past events to show.'
              : 'No events have been created yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUser={currentUser}
              onRSVP={handleRSVP}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateForm && (
        <EventForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}