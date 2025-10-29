import { motion } from 'framer-motion';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Headphones, User, Calendar, Play, DollarSign, Settings, Zap } from 'lucide-react';

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Headphones, label: 'DJs', href: '/dj-management' },
  { icon: User, label: 'Produtores', href: '/producer-management' },
  { icon: Zap, label: 'Eventos', href: '/event-calendar' },
  { icon: Play, label: 'Início', href: '/' },
  { icon: Calendar, label: 'Agenda', href: '/agenda-manager' },
  { icon: DollarSign, label: 'Financeiro', href: '/financial-tracking' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

const ModernNav: FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-6 sm:top-0 sm:bottom-auto">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card flex items-center gap-6 rounded-full px-8 py-4 backdrop-blur-xl bg-black/20"
      >
        {navItems.map((item, index) => {
          const isSelected = selected === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                // mostra destaque/título temporário e remove após 800ms
                setSelected(item.href);
                window.setTimeout(() => setSelected(null), 800);
              }}
            >
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 shadow-glow' 
                      : 'glass-button hover:bg-white/10'
                    }
                  `}
                  layout
                >
                  {/* Renderiza o ícone SVG (lucide) para garantir consistência */}
                  <item.icon size={22} className="text-white" />
                  {isSelected && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
                
                {/* Label tooltip (aparece ao hover; fica visível temporariamente se clicado) */}
                <motion.div
                  className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-sm
                    ${isSelected 
                      ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 opacity-100' 
                      : 'glass-button opacity-0 group-hover:opacity-100'
                    }
                    transition-all duration-300
                  `}
                >
                  {item.label}
                </motion.div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default ModernNav;
