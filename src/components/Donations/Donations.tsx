import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, CreditCard, Target, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { DonationForm } from './DonationForm';

export function Donations() {
  const { donations } = useApp();
  const { currentUser } = useAuth();
  const [showDonationForm, setShowDonationForm] = useState(false);

  const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalDonors = new Set(donations.map(d => d.donorEmail)).size;
  const recentDonations = donations
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const campaigns = [
    {
      id: 'scholarship',
      title: 'Student Scholarship Fund',
      description: 'Support deserving students with financial assistance for their education.',
      goal: 1000000,
      raised: totalRaised * 0.6,
      color: 'bg-blue-500',
    },
    {
      id: 'infrastructure',
      title: 'Campus Infrastructure',
      description: 'Help us build modern facilities and upgrade existing infrastructure.',
      goal: 500000,
      raised: totalRaised * 0.3,
      color: 'bg-green-500',
    },
    {
      id: 'research',
      title: 'Research & Innovation',
      description: 'Fund cutting-edge research projects and innovation initiatives.',
      goal: 300000,
      raised: totalRaised * 0.1,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        {/* Left side: Heading + Description */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            Support Our Mission
          </h1>
          <p className="text-gray-600 text-center sm:text-left">
            Help us build a better future for students and strengthen our alumni community.
          </p>
        </div>
  
        {/* Right side: Donate button */}
        <button
          onClick={() => setShowDonationForm(true)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto"
        >
          <Heart className="h-5 w-5" />
          <span>Donate Now</span>
        </button>
      </div>
    

  

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Raised</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalRaised.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Donors</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDonors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Students Helped</p>
              <p className="text-2xl font-semibold text-gray-900">25</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Donation Campaigns */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Active Campaigns</h2>
          <div className="space-y-6">
            {campaigns.map((campaign) => {
              const percentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
              return (
                <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                    </div>
                    <button
                      onClick={() => setShowDonationForm(true)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Donate</span>
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>₹{campaign.raised.toLocaleString()} raised</span>
                      <span>₹{campaign.goal.toLocaleString()} goal</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${campaign.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% completed</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Donations */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Donations</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {recentDonations.length === 0 ? (
              <div className="p-6 text-center">
                <Heart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No donations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{donation.donorName}</p>
                      <span className="text-green-600 font-semibold">
                        ₹{donation.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{donation.createdAt.toLocaleDateString()}</span>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Impact Message */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Impact</h3>
            <p className="text-blue-800 text-sm">
              Thanks to generous donations from our alumni community, we've been able to:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                Award 25 scholarships to deserving students
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                Upgrade laboratory equipment
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                Fund 6 research projects
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <DonationForm onClose={() => setShowDonationForm(false)} />
      )}
    </div>
  );
}