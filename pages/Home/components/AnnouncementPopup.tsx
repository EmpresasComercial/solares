import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { APP_CONFIG } from '../../../constants/config';
import { cn } from '../../../lib/utils';

interface AnnouncementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  communityLink?: string;
}

export const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ isOpen, onClose, communityLink }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-[360px] rounded-[32px] shadow-2xl relative overflow-hidden"
          >
            <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
              {/* Header Title - Brand Gradient & Light */}
              <h2 className="text-[24px] font-light bg-gradient-to-r from-[#C62828] to-[#1A237E] bg-clip-text text-transparent mb-4 tracking-tight">
                {t('home.announcement.tips')}
              </h2>
              
              {/* Content Body - Ultra Light */}
              <div className="max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar mb-6">
                 <p className="text-[13px] text-gray-400 font-light leading-relaxed text-center">
                   {t('home.announcement.reward_notice')}
                   <br /><br />
                   {t('home.announcement.invite_notice')}
                   <br /><br />
                   {t('home.announcement.promo_notice')}
                 </p>
              </div>

              {/* Action Buttons - Light Weight */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => window.open(communityLink || APP_CONFIG.WHATSAPP_COMMUNITY_LINK, '_blank')}
                  className="w-full h-[42px] bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white font-light text-[14px] rounded-[21px] transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 stroke-[1.5px]" />
                  {t('home.community_btn')}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full h-[42px] bg-[#F5F5F5] text-gray-500 font-light text-[14px] rounded-[21px] hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>

            {/* Subtle Brand Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-50">
               <motion.div 
                  key={`progress-${isOpen}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: APP_CONFIG.POPUP_AUTO_CLOSE_TIME / 1000, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-[#C62828] to-[#1A237E]"
                />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
