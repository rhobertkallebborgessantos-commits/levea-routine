import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TestimonialsWithMarquee from '@/components/ui/testimonials-with-marquee';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from '@/components/SplashScreen';
import { Leaf, ArrowRight, Bell, Calendar, Heart, Sparkles } from 'lucide-react';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
const SPLASH_SHOWN_KEY = 'levea_splash_shown';
export default function Index() {
  const {
    user
  } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    // Only show splash once per session
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    }
    setIsReady(true);
  }, []);
  const features = [{
    icon: Calendar,
    title: 'Rotina Diária Guiada',
    description: 'Estrutura simples da manhã à noite que organiza seu dia sem esforço.'
  }, {
    icon: Bell,
    title: 'Lembretes Inteligentes',
    description: 'Notificações personalizadas para refeições, hidratação e pausas.'
  }, {
    icon: Heart,
    title: 'Sem Culpa, Só Progresso',
    description: 'Foco em consistência, não em perfeição. Cada pequeno passo conta.'
  }, {
    icon: Sparkles,
    title: 'Experiência Personalizada',
    description: 'Adaptado aos seus objetivos, dificuldades e horários disponíveis.'
  }];
  if (!isReady) {
    return <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
          <Leaf className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>;
  }
  return <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LEVEA</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? <Button asChild>
                <Link to="/dashboard">Ir para o Painel</Link>
              </Button> : <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Começar</Link>
                </Button>
              </>}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Rotina inteligente para emagrecer sem sofrimento
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Consistência de forma
              <span className="text-primary"> simples</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              LEVEA te ajuda a construir hábitos saudáveis através de lembretes, rotinas organizadas e orientação personalizada — sem dietas restritivas, sem culpa, apenas progresso.
            </p>
            
            <div className="flex justify-center pt-4">
              <motion.div
                animate={{
                  boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0)",
                  "0 0 0 8px hsl(var(--primary) / 0.15)",
                  "0 0 0 0 hsl(var(--primary) / 0)"]

                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="rounded-md">

                <Button size="lg" className="gap-2 text-base px-8" asChild>
                  <Link to="/auth">
                    Acessar Levea
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Tudo que você precisa para manter a consistência
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas simples que trabalham juntas para tornar hábitos saudáveis algo natural.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => <motion.div key={feature.title} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }} className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsWithMarquee />

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Como a LEVEA funciona
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[{
              step: '1',
              title: 'Conte sobre você',
              description: 'Perguntas rápidas sobre seus objetivos e horários.'
            }, {
              step: '2',
              title: 'Receba sua rotina personalizada',
              description: 'Criamos uma estrutura diária com lembretes.'
            }, {
              step: '3',
              title: 'Mantenha a consistência, veja resultados',
              description: 'Acompanhe sua sequência e celebre suas conquistas.'
            }].map((item, index) => <motion.div key={item.step} initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.15
            }} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} className="bg-gradient-to-br from-primary/10 via-accent to-levea-mint rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Pronto para transformar sua rotina?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Leva apenas 2 minutos para configurar sua rotina personalizada.
            </p>
            <Button size="lg" className="gap-2 text-base px-8" asChild>
              <Link to="/auth">
                Entrar na Levea
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">LEVEA</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 LEVEA. Feito com 💚 para hábitos mais saudáveis.</p>
        </div>
      </footer>
      </div>
    </>;
}