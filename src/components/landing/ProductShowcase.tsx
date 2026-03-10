import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

import showcaseRoutine from '@/assets/showcase-routine.jpg';
import showcaseReminders from '@/assets/showcase-reminders.jpg';
import showcaseMeals from '@/assets/showcase-meals.jpg';
import showcaseProgress from '@/assets/showcase-progress.jpg';
import showcaseAchievements from '@/assets/showcase-achievements.jpg';

const showcaseItems = [
  {
    title: 'Rotina diária',
    description: 'Tarefas organizadas por período do dia para manter consistência',
    image: showcaseRoutine,
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-teal-500/20',
  },
  {
    title: 'Lembretes inteligentes',
    description: 'Notificações personalizadas no momento certo',
    image: showcaseReminders,
    gradient: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20',
  },
  {
    title: 'Controle de refeições',
    description: 'Registro de refeições com tracking de macros e calorias',
    image: showcaseMeals,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-violet-500/20',
  },
  {
    title: 'Acompanhamento de progresso',
    description: 'Gráficos de peso, medidas e fotos comparativas',
    image: showcaseProgress,
    gradient: 'from-rose-500/20 via-pink-500/10 to-fuchsia-500/20',
  },
  {
    title: 'Conquistas e gamificação',
    description: 'Ganhe XP, suba de nível e desbloqueie conquistas',
    image: showcaseAchievements,
    gradient: 'from-purple-500/20 via-violet-500/10 to-indigo-500/20',
  },
];

export function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
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
          className="hidden md:flex h-[520px] gap-2 overflow-hidden"
        >
          {showcaseItems.map((item, index) => {
            const isActive = activeIndex === index;

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
                {/* Background gradient */}
                <div className={cn('absolute inset-0 bg-gradient-to-br', item.gradient)} />
                <div className="absolute inset-0 bg-background/40" />

                {/* Active: full background image */}
                <div
                  className={cn(
                    'absolute inset-0 transition-all duration-500',
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  )}
                >
                  <OptimizedImage
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full opacity-70"
                    objectFit="contain"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-lg font-display font-bold text-foreground">
                      {item.title}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Inactive: vertical title */}
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
          {showcaseItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative rounded-2xl overflow-hidden border border-border/50 h-48',
                index === showcaseItems.length - 1 && 'col-span-2'
              )}
            >
              <OptimizedImage
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full opacity-70"
                objectFit="contain"
              />
              <div className={cn('absolute inset-0 bg-gradient-to-br', item.gradient)} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="relative flex flex-col justify-end h-full p-4">
                <span className="text-sm font-display font-semibold text-foreground">
                  {item.title}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
