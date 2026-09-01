import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Home, Factory, Users2, User } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    {
      name: 'Início',
      subname: '首页',
      path: '/home',
      icon: Home
    },
    {
      name: 'Fábricas',
      subname: '找工厂',
      path: '/produtos',
      icon: Factory
    },
    {
      name: 'Parceiros',
      subname: '合作',
      path: '/convite',
      icon: Users2
    },
    {
      name: 'Minha Conta',
      subname: '我的',
      path: '/perfil',
      icon: User
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 h-[58px] flex items-center justify-around px-2 pb-safe shadow-[0_-3px_12px_rgba(0,0,0,0.04)] select-none">
      <div className="w-full max-w-[480px] flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex flex-col items-center justify-center transition-all w-full h-full py-1',
                  isActive ? 'text-[#FF5000]' : 'text-[#555555] hover:text-[#222222]'
                )
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <div className="flex flex-col items-center gap-0.5 relative">
                  {isActive && (
                    <div className="absolute -top-1 w-6 h-0.5 bg-[#FF5000] rounded-full" />
                  )}
                  <div className="h-[24px] flex items-center justify-center relative">
                    <Icon 
                      className={cn(
                        "w-[22px] h-[22px] transition-transform duration-200",
                        isActive ? "scale-110 stroke-[2.2] text-[#FF5000]" : "stroke-[1.7]"
                      )} 
                    />
                  </div>
                  <span className={cn(
                    'text-[11px] transition-all tracking-tight leading-none',
                    isActive ? 'text-[#FF5000] font-bold' : 'text-[#666666] font-normal'
                  )}>
                    {item.name}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
