import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 glass-panel rounded-2xl mx-6 md:mx-auto p-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-[#FF8C66] transition-colors">Help Center</a>
          <a href="#" className="hover:text-[#FF8C66] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#FF8C66] transition-colors">Privacy Policy</a>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          @2026wokflow
        </div>
      </div>
    </footer>
  );
};

export default Footer;