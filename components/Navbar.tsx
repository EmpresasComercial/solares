import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Check, ShoppingCart, Users, User } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    {
      name: 'Início',
      path: '/home',
      renderIcon: (isActive: boolean) =>
        isActive ? (
          <div className="w-[26px] h-[24px] bg-[#FF2442] rounded-t-[10px] rounded-b-[6px] flex items-center justify-center shadow-xs">
            <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
          </div>
        ) : (
          <svg className="w-[22px] h-[22px] text-[#202020]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
        )
    },
    {
      name: 'Carrinha',
      path: '/produtos',
      renderIcon: (isActive: boolean) => (
        <ShoppingCart 
          className={cn("w-[22px] h-[22px] transition-colors stroke-[1.8]", isActive ? "text-[#FF2442]" : "text-[#202020]")} 
        />
      )
    },
    {
      name: 'Equipe',
      path: '/convite',
      renderIcon: (isActive: boolean) => (
        <Users 
          className={cn("w-[22px] h-[22px] transition-colors stroke-[1.8]", isActive ? "text-[#FF2442]" : "text-[#202020]")} 
        />
      )
    },
    {
      name: 'Minha Conta',
      path: '/perfil',
      renderIcon: (isActive: boolean) => (
        <User 
          className={cn("w-[22px] h-[22px] transition-colors stroke-[1.8]", isActive ? "text-[#FF2442]" : "text-[#202020]")} 
        />
      )
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/60 h-[56px] flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)] select-none">
      <div className="w-full max-w-[480px] flex items-center justify-around h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex flex-col items-center justify-center transition-all w-full h-full py-1',
                isActive ? 'text-[#FF2442]' : 'text-[#202020]'
              )
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-[26px] flex items-center justify-center">
                  {item.renderIcon(isActive)}
                </div>
                <span className={cn(
                  'text-[11px] transition-all tracking-tight leading-none mt-0.5',
                  isActive ? 'text-[#FF2442] font-semibold' : 'text-[#202020] font-normal'
                )}>
                  {item.name}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
