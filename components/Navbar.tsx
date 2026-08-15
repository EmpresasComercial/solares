import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

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
          <svg className="w-[24px] h-[24px] text-[#202020]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
        )
    },
    {
      name: 'Categoria',
      path: '/produtos',
      renderIcon: (isActive: boolean) => (
        <svg 
          className={cn("w-[24px] h-[24px] transition-colors", isActive ? "text-[#FF2442]" : "text-[#202020]")} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="3" y1="7" x2="8" y2="7" />
          <line x1="3" y1="12" x2="8" y2="12" />
          <line x1="3" y1="17" x2="8" y2="17" />
          <circle cx="15" cy="11" r="5" />
          <line x1="18.5" y1="14.5" x2="22" y2="18" />
        </svg>
      )
    },
    {
      name: 'Carrinho',
      path: '/minhas-compras',
      renderIcon: (isActive: boolean) => (
        <svg 
          className={cn("w-[24px] h-[24px] transition-colors", isActive ? "text-[#FF2442]" : "text-[#202020]")} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
        </svg>
      )
    },
    {
      name: 'Minha Conta',
      path: '/perfil',
      renderIcon: (isActive: boolean) => (
        <svg 
          className={cn("w-[24px] h-[24px] transition-colors", isActive ? "text-[#FF2442]" : "text-[#202020]")} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </svg>
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
