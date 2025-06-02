
import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="w-full">
      {/* Top bar with date and utilities */}
      <div className="bg-slate-700 text-white px-4 py-2 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>📅 Fri May 30 2025</span>
            <span>🕐 14:23:37</span>
          </div>
          <div className="flex items-center gap-4">
            <span>বাংলা</span>
            <span>Screen Reader Access</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 bg-slate-600 rounded text-xs">A+</button>
              <button className="px-2 py-1 bg-slate-600 rounded text-xs">A</button>
              <button className="px-2 py-1 bg-slate-600 rounded text-xs">A-</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white shadow-md px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/e0f5b6c9-bdd6-4461-b518-8ca973fa5b5f.png" 
              alt="Kolkata Police Logo" 
              className="w-16 h-16"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Kolkata Police</h1>
              <p className="text-sm text-slate-600">The Official Website of Kolkata Police</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-orange-500 text-orange-600">
              Know Your Police Station
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              👤 Employee Portal
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              E-Shradhanjali
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Kolkata Traffic Police
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-blue-500 text-white">
        <div className="max-w-7xl mx-auto">
          <ul className="flex">
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600 bg-blue-600">Home</a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Organisation </a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">History </a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Crime Prevention </a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Bulletin Board</a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Museum</a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Tenders</a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Gallery</a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Downloads</a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Feedback</a></li>
            <li><a href="#" className="block px-6 py-3 hover:bg-blue-600">Contact Us</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
