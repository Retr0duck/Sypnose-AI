import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1e1f22] text-gray-400 text-sm py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Synapse AI. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
