import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Leaf, 
  ArrowRight, 
  Bell, 
  Calendar, 
  Heart,
  Sparkles
} from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Guided Daily Routine',
      description: 'Simple morning-to-evening structure that organizes your day effortlessly.',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Gentle, personalized nudges for meals, hydration, and mindful breaks.',
    },
    {
      icon: Heart,
      title: 'No Guilt, Just Progress',
      description: 'Focus on consistency, not perfection. Every small step counts.',
    },
    {
      icon: Sparkles,
      title: 'Personalized Experience',
      description: 'Tailored to your goals, struggles, and available time slots.',
    },
  ];

  return (
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
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Smart routine for effortless weight loss
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Consistency made
              <span className="text-primary"> simple</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              LEVEA helps you build healthy habits through gentle reminders, 
              organized routines, and personalized guidance — no strict diets, 
              no guilt, just progress.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="gap-2 text-base px-8" asChild>
                <Link to="/auth">
                  Start Your Journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Free to start • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Everything you need to stay consistent
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple tools that work together to make healthy habits feel effortless.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How LEVEA works
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '1', title: 'Tell us about yourself', description: 'Quick questions about your goals and schedule.' },
              { step: '2', title: 'Get your personalized routine', description: 'We create a daily structure with gentle reminders.' },
              { step: '3', title: 'Stay consistent, see results', description: 'Track your streak and celebrate wins.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/10 via-accent to-levea-mint rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              It's free to start and takes just 2 minutes to set up.
            </p>
            <Button size="lg" className="gap-2 text-base px-8" asChild>
              <Link to="/auth">
                Get Started Free
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
          <p className="text-sm text-muted-foreground">© 2024 LEVEA. Made with 💚 for healthier habits.</p>
        </div>
      </footer>
    </div>
  );
}