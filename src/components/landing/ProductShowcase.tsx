import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const showcaseItems = [
  {
    title: 'Rotina diária',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
  },
  {
    title: 'Lembretes inteligentes',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80',
  },
  {
    title: 'Controle de hábitos',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop&q=80',
  },
  {
    title: 'Acompanhamento de progresso',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&q=80',
  },
  {
    title: 'Dashboard de resultados',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=400&fit=crop&q=80',
  },
];

export function ProductShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.8fr] gap-12 items-center">
          {/* Left side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Veja o LEVEA em{' '}
              <span className="text-primary">ação</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Uma rotina simples, organizada e focada em consistência.
            </p>
          </motion.div>

          {/* Right side — Desktop horizontal gallery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex gap-3 h-[340px]"
          >
            {showcaseItems.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const someHovered = hoveredIndex !== null;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={cn(
                    'relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out border border-border/30',
                    isHovered ? 'flex-[3]' : someHovered ? 'flex-[0.6]' : 'flex-1'
                  )}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent transition-opacity duration-500',
                      isHovered ? 'opacity-100' : 'opacity-60'
                    )}
                  />
                  {/* Title */}
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 p-4 transition-all duration-500',
                      isHovered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-70'
                    )}
                  >
                    <span
                      className={cn(
                        'font-display font-semibold text-primary-foreground transition-all duration-500 whitespace-nowrap',
                        isHovered ? 'text-base' : 'text-sm'
                      )}
                    >
                      {item.title}
                    </span>
                    {isHovered && (
                      <div className="mt-1.5 h-0.5 w-8 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Mobile stacked gallery */}
          <div className="lg:hidden grid grid-cols-2 gap-3">
            {showcaseItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative rounded-2xl overflow-hidden aspect-[4/3] border border-border/30',
                  index === showcaseItems.length - 1 && 'col-span-2'
                )}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-sm font-display font-semibold text-primary-foreground">
                    {item.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
