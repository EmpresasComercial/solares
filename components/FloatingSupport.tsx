import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Headset, HelpCircle, MessageSquare, X } from 'lucide-react';

export default function FloatingSupport() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuOptions = [
    { 
      label: 'Suporte CanadianSolar', 
      icon: <Headset size={16} strokeWidth={1.5} />, 
      path: '/suporte',
      color: 'bg-white text-[#333333] border border-[#E5E5E5]'
    },
    { 
      label: 'FAQ / Ajuda', 
      icon: <HelpCircle size={16} strokeWidth={1.5} />, 
      path: '/help-faq',
      color: 'bg-white text-[#333333] border border-[#E5E5E5]'
    },
    { 
      label: 'Comentários', 
      icon: <MessageSquare size={16} strokeWidth={1.5} />, 
      path: '/suporte/feedback',
      color: 'bg-white text-[#333333] border border-[#E5E5E5]'
    }
  ];

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end space-y-3">
      {/* Sub-menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col items-end space-y-3 mb-2"
          >
            {menuOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(option.path);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 group outline-none"
              >
                <span className="bg-white px-4 py-2 rounded-[15px] shadow-sm text-[13px] font-normal text-[#333333] opacity-0 group-hover:opacity-100 transition-opacity border border-[#E5E5E5]">
                  {option.label}
                </span>
                <div className={`w-8 h-8 ${option.color} rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform`}>
                  {option.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Draggable Toggle Button */}
      <motion.div
        drag
        dragMomentum={false}
        initial={{ x: 0, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        className="cursor-grab touch-none"
      >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative group focus:outline-none"
        >
          {/* Support Agent Avatar Container */}
          <div className="w-10 h-10 rounded-full border border-[#E5E5E5] shadow-md bg-white overflow-hidden flex items-center justify-center transition-colors">
            {isOpen ? (
              <X size={18} className="text-[#333333]" strokeWidth={1.5} />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&h=200&auto=format&fit=crop" 
                alt="Suporte CanadianSolar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* Online Indicator (only if closed) */}
          {!isOpen && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 border-[1.5px] border-white rounded-full shadow-sm animate-pulse" />
          )}
        </button>
      </motion.div>
    </div>
  );
}
