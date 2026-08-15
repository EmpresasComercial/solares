import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Users, 
  UserCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const navItems = [
    { name: 'página inicial', path: '/home',     icon: Home },
    { name: 'produtos',       path: '/produtos', icon: ShoppingCart },
    { name: 'equipe',         path: '/convite',  icon: Users },
    { name: 'meu',            path: '/perfil',   icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 h-[64px] flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              'flex flex-col items-center justify-center transition-all w-full h-full py-1',
              isActive ? 'text-[#C62828]' : 'text-gray-500 hover:text-gray-700'
            )
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <div className="flex flex-col items-center gap-0.5">
              <item.icon 
                className={cn(
                  'w-[22px] h-[22px] transition-all',
                  isActive ? 'stroke-[2.2px] text-[#C62828]' : 'stroke-[1.6px] text-gray-500'
                )} 
              />
              <span className={cn(
                'text-[11px] font-normal transition-all tracking-tight leading-tight',
                isActive ? 'text-[#C62828] font-medium' : 'text-gray-500'
              )}>
                {item.name}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

