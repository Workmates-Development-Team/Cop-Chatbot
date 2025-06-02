
import React from 'react';
import { Button } from '@/components/ui/button';

const CommissionerMessage = () => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Message from</h2>
            <h3 className="text-4xl font-bold text-blue-800 mb-4">Manoj Kumar Verma, IPS</h3>
            <h4 className="text-xl text-slate-700 mb-6">Commissioner of Police, Kolkata</h4>
            
            <p className="text-gray-700 leading-relaxed mb-8">
              It is a great pleasure to welcome you to the Official Website of Kolkata Police. 
              Kolkata Police, the oldest Commissionerate in the country with an illustrious history of 
              excellence in all aspects of policing, is committed to its responsibilities towards 
              maintenance of law and order in the city, managing traffic, prevention and detection of 
              crime and spearheading various citizen friendly initiatives for the people of Kolkata.
            </p>
            
            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
              Read More
            </Button>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-200 to-amber-100 p-8 rounded-lg">
              <div className="flex items-center justify-center bg-white rounded-lg p-8 shadow-lg">
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 font-bold text-lg">IPS</span>
                    </div>
                  </div>
                  <div className="w-40 h-32 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-600">Commissioner Photo</span>
                  </div>
                </div>
                <div className="ml-8">
                  <img 
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEwMCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRkY2NjMzIi8+CjxyZWN0IHg9IjMzIiB5PSI1MyIgd2lkdGg9IjMzIiBoZWlnaHQ9IjUzIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjMzIiB5PSIxMDYiIHdpZHRoPSIzMyIgaGVpZ2h0PSI1NCIgZmlsbD0iIzEzOEY0NiIvPgo8L3N2Zz4K" 
                    alt="Indian Flag" 
                    className="w-16 h-24"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommissionerMessage;
