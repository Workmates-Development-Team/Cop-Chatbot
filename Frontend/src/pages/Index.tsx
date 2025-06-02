import React from 'react';
import Header from '@/components/Header';
import CommissionerMessage from '@/components/CommissionerMessage';
import Helplines from '@/components/Helplines';
import Chatbot from '@/components/Chatbot';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CommissionerMessage />
      
      {/* Additional Content Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-4">🚨 Emergency Services</h3>
              <p className="text-gray-700 mb-4">
                Quick access to emergency services and immediate assistance.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Police: 100 / 1090</li>
                <li>• Fire: 101</li>
                <li>• Ambulance: 108</li>
                <li>• Women Helpline: 1091</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 mb-4">📋 Online Services</h3>
              <p className="text-gray-700 mb-4">
                Access various online services and file complaints.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• File FIR Online</li>
                <li>• Passport Verification</li>
                <li>• Character Certificate</li>
                <li>• Lost Property</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold text-orange-800 mb-4">🛡️ Safety Tips</h3>
              <p className="text-gray-700 mb-4">
                Important safety guidelines and crime prevention tips.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Personal Safety</li>
                <li>• Cyber Security</li>
                <li>• Vehicle Safety</li>
                <li>• Women Safety</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* News and Updates */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Latest News & Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-slate-800 mb-2">Traffic Advisory</h4>
              <p className="text-gray-600 text-sm mb-3">Special traffic arrangements for upcoming festival...</p>
              <span className="text-xs text-blue-600">2 hours ago</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-slate-800 mb-2">Cyber Crime Alert</h4>
              <p className="text-gray-600 text-sm mb-3">Beware of fake lottery messages and phishing attempts...</p>
              <span className="text-xs text-blue-600">5 hours ago</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-slate-800 mb-2">Community Policing</h4>
              <p className="text-gray-600 text-sm mb-3">New initiatives for better police-citizen cooperation...</p>
              <span className="text-xs text-blue-600">1 day ago</span>
            </div>
          </div>
        </div>
      </section>

      <Helplines />
      <Chatbot />
    </div>
  );
};

export default Index;