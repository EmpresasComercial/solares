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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-[56px] flex items-center justify-around px-2 pb-safe select-none">
      <div className="w-full max-w-[480px] flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex flex-col items-center justify-center transition-colors w-full h-full py-1',
                  isActive ? 'text-[#FF5000]' : 'text-[#666666] hover:text-[#111111]'
                )
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <div className="flex flex-col items-center gap-0.5 relative">
                  {isActive && (
                    <div className="absolute -top-1 w-6 h-[2px] bg-[#FF5000]" />
                  )}
                  <div className="h-[22px] flex items-center justify-center relative">
                    <Icon 
                      className={cn(
                        "w-[20px] h-[20px] transition-transform",
                        isActive ? "stroke-[2.2] text-[#FF5000]" : "stroke-[1.6]"
                      )} 
                    />
                  </div>
                  <span className={cn(
                    'text-[11px] leading-none mt-0.5',
                    isActive ? 'text-[#FF5000] font-bold' : 'text-[#666666]'
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
