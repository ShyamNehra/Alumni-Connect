import React from 'react';
import { User } from '../../types';
import { ProfileAvatar } from '../Common/ProfileAvatar';
import { MapPin, Building, Calendar, HandHeart, Linkedin, Mail, MessageSquare } from 'lucide-react';

interface AlumniCardProps {
  user: User;
}

export function AlumniCard({ user }: AlumniCardProps) {
  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Header Section */}

      {/* alumni - mentor tags */}

      <div className="flex justify-end items-center space-x-2 flex-shrink-0 w-full">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${user.role === 'alumni'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
            }`}
        >
          {user.role === 'alumni' ? 'Alumni' : 'Student'}
        </span>

        {user.willingToMentor && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
            <HandHeart className="h-3 w-3 mr-1 flex-shrink-0" />
            Mentor
          </span>
        )}
      </div>




      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <ProfileAvatar
              name={user.name}
              imageUrl={user.imageUrl}
              size="md"
              className="w-12 h-12"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {user.name}
            </h3>
            {user.jobTitle && user.employer && (
              <p className="text-sm text-gray-600 flex items-start mb-2">
                <Building className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span className="truncate">
                  {user.jobTitle} at {user.employer}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Role and Mentor Badges */}
        {/* <div className="flex flex-col items-end space-y-2 flex-shrink-0">
          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
            user.role === 'alumni' 
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role === 'alumni' ? 'Alumni' : 'Student'}
          </span>
          {user.willingToMentor && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
              <HandHeart className="h-3 w-3 mr-1 flex-shrink-0" />
              Mentor
            </span>
          )}
        </div> */}
      </div>

      {/* Details Section */}
      <div className="space-y-2 mb-4 flex-1">
        {user.department && user.gradYear && (
          <p className="text-sm text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {user.department} • Grad. Year {user.gradYear}
            </span>
          </p>
        )}
        {user.location && (
          <p className="text-sm text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{user.location}</span>
          </p>
        )}
      </div>

      {/* Bio Section */}
      {user.bio && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {user.bio}
          </p>
        </div>
      )}

      {/* Skills Section */}
      {user.skills && user.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {user.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md truncate max-w-24"
                title={skill}
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 4 && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md whitespace-nowrap">
                +{user.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center space-x-3">
          <a
            href={`mailto:${user.email}`}
            className="text-red-400 hover:text-red-600 transition-colors p-1"
            title="Send email"
          >
            <Mail className="h-5 w-5" />
          </a>
          {user.linkedinUrl && (
            <a
              href={user.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 transition-colors p-1"
              title="View LinkedIn profile"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}

          <div className="relative inline-block p-1 group">
            <MessageSquare className="h-5 w-5 text-green-400 cursor-default" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden w-max rounded bg-gray-800 text-white text-xs px-2 py-1 group-hover:block">
              In-app Messages (Coming Soon)
            </span>
          </div>

        </div>


        {/* alumni - mentor tags */}

        {/* <div className="flex items-center space-x-2 flex-shrink-0">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${user.role === 'alumni'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
              }`}
          >
            {user.role === 'alumni' ? 'Alumni' : 'Student'}
          </span>

          {user.willingToMentor && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
              <HandHeart className="h-3 w-3 mr-1 flex-shrink-0" />
              Mentor
            </span>
          )}
        </div> */}


        {user.batch && (
          <span className="text-xs text-gray-500 font-mono truncate max-w-20" title={user.batch}>
            {user.batch}
          </span>
        )}
      </div>
    </div>
  );
}