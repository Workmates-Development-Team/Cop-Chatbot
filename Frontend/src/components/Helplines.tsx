
import React from 'react';

const Helplines = () => {
  return (
    <footer className="bg-red-600 text-white py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white text-red-600 px-3 py-1 rounded font-bold">📞 Helplines</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <span>Helpline: <strong>8585063104</strong></span>
            <span>Cyber PS: <strong>033-2214 3000 / 98365 13000</strong></span>
            <span>Control Room: <strong>100 / 1090</strong></span>
            <span>Traffic: <strong>1073 (Toll Free)</strong></span>
            <span>Women in Need Call: <strong>1091 (Toll Free)</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Helplines;
