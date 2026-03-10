import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarCheck, Bell, ListChecks, TrendingUp, Trophy } from 'lucide-react';

const showcaseItems = [
  {
    title: 'Rotina diária',
    description: 'Tarefas organizadas por período do dia para manter consistência',
    icon: CalendarCheck,
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-teal-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Lembretes inteligentes',
    description: 'Notificações personalizadas no momento certo',
    icon: Bell,
    gradient: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20',
    iconColor: 'text-amber-500',
  },
  {
    title: 'Controle de hábitos',
    description: 'Registro de refeições e chás com tracking de macros',
    icon: ListChecks,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-violet-500/20',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Acompanhamento de progresso',
    description: 'Gráficos de peso, medidas e fotos comparativas',
    icon: TrendingUp,
    gradient: 'from-rose-500/20 via-pink-500/10 to-fuchsia-500/20',
    iconColor: 'text-rose-500',
  },
  {
    title: 'Conquistas e gamificação',
    description: 'Ganhe XP, suba de nível e desbloqueie conquistas',
    icon: Trophy,
    gradient: 'from-purple-500/20 via-violet-500/10 to-indigo-500/20',
    iconColor: 'text-purple-500',
  },
];

export function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Veja o LEVEA em <span className="text-primary">ação</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma rotina simples, organizada e focada em consistência.
          </p>
        </motion.div>

        {/* Desktop accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:flex h-[420px] gap-2 overflow-hidden"
        >
          {showcaseItems.map((item, index) => {
            const isActive = activeIndex === index;
            const Icon = item.icon;

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-in-out border border-border/50',
                  isActive ? 'flex-[5]' : 'flex-[0.6]'
                )}
                style={{ minWidth: isActive ? undefined : '60px' }}
              >
                {/* Gradient background */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br',
                  item.gradient
                )} />
                <div className="absolute inset-0 bg-background/60" />

                {/* Active content */}
                <div
                  className={cn(
                    'absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500',
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  )}
                >
                  <div className={cn(
                    'w-20 h-20 rounded-2xl flex items-center justify-center mb-6',
                    'bg-background/80 border border-border/50 shadow-lg'
                  )}>
                    <Icon className={cn('h-10 w-10', item.iconColor)} />
                  </div>
                  <span className="text-xl font-display font-bold text-foreground text-center">
                    {item.title}
                  </span>
                  <p className="text-sm text-muted-foreground text-center mt-2 max-w-[280px]">
                    {item.description}
                  </p>
                  <div className="mt-4 h-0.5 w-10 rounded-full bg-primary" />
                </div>

                {/* Inactive title — rotated vertically */}
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-all duration-500',
                    isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  )}
                >
                  <span
                    className="text-sm font-display font-semibold text-muted-foreground whitespace-nowrap"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Mobile stacked */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {showcaseItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative rounded-2xl overflow-hidden p-5 border border-border/50',
                  index === showcaseItems.length - 1 && 'col-span-2'
                )}
              >
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br',
                  item.gradient
                )} />
                <div className="absolute inset-0 bg-background/70" />
                <div className="relative flex flex-col items-center text-center gap-2">
                  <Icon className={cn('h-8 w-8', item.iconColor)} />
                  <span className="text-sm font-display font-semibold text-foreground">
                    {item.title}
                  </span>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
