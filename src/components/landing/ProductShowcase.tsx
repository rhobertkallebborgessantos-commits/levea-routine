import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const showcaseItems = [
  {
    title: 'Rotina diária',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
  },
  {
    title: 'Lembretes inteligentes',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80',
  },
  {
    title: 'Controle de hábitos',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&q=80',
  },
  {
    title: 'Acompanhamento de progresso',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&q=80',
  },
  {
    title: 'Resultados e progresso',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=600&fit=crop&q=80',
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
          className="hidden md:flex h-[420px] gap-2"
        >
          {showcaseItems.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-in-out',
                  isActive ? 'flex-[5]' : 'flex-[0.6]'
                )}
                style={{ minWidth: isActive ? undefined : '60px' }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  loading="lazy"
                />

                {/* Dark overlay */}
                <div
                  className={cn(
                    'absolute inset-0 transition-all duration-700',
                    isActive
                      ? 'bg-gradient-to-t from-black/60 via-black/10 to-transparent'
                      : 'bg-black/50'
                  )}
                />

                {/* Active title — bottom center */}
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 p-6 transition-all duration-500',
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                  )}
                >
                  <span className="text-lg font-display font-bold text-white">
                    {item.title}
                  </span>
                  <div className="mt-2 h-0.5 w-10 rounded-full bg-primary" />
                </div>

                {/* Inactive title — rotated vertically */}
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-all duration-500',
                    isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  )}
                >
                  <span
                    className="text-sm font-display font-semibold text-white whitespace-nowrap"
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
                'relative rounded-2xl overflow-hidden aspect-[4/3]',
                index === showcaseItems.length - 1 && 'col-span-2'
              )}
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="text-sm font-display font-semibold text-white">
                  {item.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
