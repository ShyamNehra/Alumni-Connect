import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { User } from '../../types';
import { Search, Filter, MapPin, Building, Calendar, HandHeart } from 'lucide-react';
import { AlumniCard } from './AlumniCard';

export function Directory() {
  const { users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gradYear: '',
    department: '',
    location: '',
    willingToMentor: false,
    role: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  const alumni = users.filter(user => user.role !== 'admin');

  const departments = [...new Set(users.map(u => u.department).filter(Boolean))];
  const locations = [...new Set(users.map(u => u.location).filter(Boolean))];
  const gradYears = [...new Set(users.map(u => u.gradYear).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));

  const filteredAlumni = useMemo(() => {
    return alumni.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGradYear = !filters.gradYear || user.gradYear?.toString() === filters.gradYear;
      const matchesDepartment = !filters.department || user.department === filters.department;
      const matchesLocation = !filters.location || user.location === filters.location;
      const matchesMentor = !filters.willingToMentor || user.willingToMentor === true;
      const matchesRole = filters.role === 'all' || user.role === filters.role;

      return matchesSearch && matchesGradYear && matchesDepartment && 
             matchesLocation && matchesMentor && matchesRole;
    });
  }, [alumni, searchTerm, filters]);

  const clearFilters = () => {
    setFilters({
      gradYear: '',
      department: '',
      location: '',
      willingToMentor: false,
      role: 'all',
    });
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
        <p className="text-gray-600">
          Connect with {filteredAlumni.length} alumni and current students from our community.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, skills, or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="all">All</option>
                <option value="alumni">Alumni</option>
                <option value="student">Students</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filters.gradYear}
                onChange={(e) => setFilters(prev => ({ ...prev, gradYear: e.target.value }))}
              >
                <option value="">All Years</option>
                {gradYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
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

            <div className="flex items-end">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={filters.willingToMentor}
                  onChange={(e) => setFilters(prev => ({ ...prev, willingToMentor: e.target.checked }))}
                />
                <span>Available for mentoring</span>
              </label>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(filters.gradYear || filters.department || filters.location || filters.willingToMentor || filters.role !== 'all' || searchTerm) && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Showing {filteredAlumni.length} results</span>
              {searchTerm && <span className="text-blue-600">for "{searchTerm}"</span>}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredAlumni.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAlumni.map((user) => (
            <AlumniCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}