import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, CreditCard, Heart, CheckCircle, AlertCircle } from 'lucide-react';

interface DonationFormProps {
  onClose: () => void;
}

export function DonationForm({ onClose }: DonationFormProps) {
  const { addDonation } = useApp();
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    amount: '',
    donorName: currentUser?.name || '',
    donorEmail: currentUser?.email || '',
    campaign: 'scholarship',
    isAnonymous: false,
  });

  const presetAmounts = [1000, 5000, 10000, 25000, 50000];
  
  const campaigns = [
    { id: 'scholarship', name: 'Student Scholarship Fund' },
    { id: 'infrastructure', name: 'Campus Infrastructure' },
    { id: 'research', name: 'Research & Innovation' },
    { id: 'general', name: 'General Fund' },
  ];

  const handleAmountClick = (amount: number) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) < 100) {
      alert('Minimum donation amount is ₹100');
      return;
    }

    setStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      addDonation({
        donorId: currentUser?.id,
        donorName: formData.isAnonymous ? 'Anonymous Donor' : formData.donorName,
        donorEmail: formData.donorEmail,
        amount: parseFloat(formData.amount),
        status: 'completed',
      });

      setStep('success');
    }, 2000);
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we process your donation...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-6">
            Your donation of ₹{parseFloat(formData.amount).toLocaleString()} has been processed successfully.
            You will receive a confirmation email shortly.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Heart className="h-5 w-5 text-red-600 mr-2" />
            Make a Donation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>This is a demo donation system. No actual payment will be processed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a Campaign
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.campaign}
              onChange={(e) => setFormData(prev => ({ ...prev, campaign: e.target.value }))}
            >
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount (₹)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetAmounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountClick(amount)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    formData.amount === amount.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ₹{amount.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="100"
              placeholder="Enter custom amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>

          {/* Donor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="donorName"
                type="text"
                required={!formData.isAnonymous}
                disabled={formData.isAnonymous}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                value={formData.donorName}
                onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="donorEmail"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.donorEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, donorEmail: e.target.value }))}
              />
            </div>
          </div>

          {/* Anonymous Donation */}
          <div className="flex items-center">
            <input
              id="isAnonymous"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
            />
            <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
              Make this donation anonymous
            </label>
          </div>

          {/* Submit Button */}
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
              disabled={!formData.amount || parseFloat(formData.amount) < 100}
              className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="h-4 w-4" />
              <span>Donate ₹{formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}