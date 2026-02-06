import React from 'react';
import { ChefHat } from 'lucide-react';

interface NavbarProps {
  onSignInClick: () => void;
  onLogoClick?: () => void;
  onAboutClick: () => void;
  customRightContent?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ onSignInClick, onLogoClick, onAboutClick, customRightContent }) => {
  return (
    <nav className="w-full max-w-7xl mx-auto px-6 py-4 md:px-12 fixed top-0 left-0 right-0 z-50">
      <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between relative">
        {/* Logo Section - Absolute/Fixed Left or Justify Start */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={onLogoClick}
        >
          <div className="bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
            <ChefHat size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1A1A1A] hidden sm:block">WokFlow</span>
        </div>

        {/* Center Navigation */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={onAboutClick}
            className="text-sm font-bold text-gray-600 hover:text-[#FF8C66] transition-colors py-2 px-4 rounded-full hover:bg-orange-50"
          >
            About
          </button>
        </div>

        {/* Right Action - Sign In or Custom Content */}
        <div>
          {customRightContent ? (
            customRightContent
          ) : (
            <button
              onClick={onSignInClick}
              className="bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;