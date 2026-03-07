import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Login1() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in:', { email, password });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="login-theme relative min-h-screen flex overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Floating gradient blob following mouse */}
      <div
        className="pointer-events-none absolute z-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, rgba(var(--color-text-primary-rgb), 0.4) 0%, transparent 70%)`,
          left: mousePos.x - 250,
          top: mousePos.y - 250,
        }}
      />

      {/* LEFT — Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-border)' }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--color-heading)' }}>
              LEVEA
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-heading)' }}>
              Entrar no Sistema
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Entre com sua conta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-heading)' }}>
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  required
                  className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-muted-surface)',
                    color: 'var(--color-heading)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--color-text-primary-rgb), 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-muted-surface)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-heading)' }}>
                Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border py-3 pl-11 pr-11 text-sm outline-none transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-muted-surface)',
                    color: 'var(--color-heading)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--color-text-primary-rgb), 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-muted-surface)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-shadow duration-300 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite',
              }}
            >
              Sign In
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-muted-surface)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>ou continue com</span>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-muted-surface)' }} />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{
                borderColor: 'var(--color-muted-surface)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-heading)',
              }}
            >
              <InstagramIcon className="h-5 w-5" />
              Instagram
            </a>
            <a
              href="https://wa.me/5599999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{
                borderColor: 'var(--color-muted-surface)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-heading)',
              }}
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Image (hidden on mobile) */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10 z-10" />
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1920&q=80"
          alt="Technology workspace"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 z-20 opacity-30"
          style={{ background: 'linear-gradient(135deg, #16a34a 0%, transparent 60%)' }}
        />
      </div>

      {/* Gradient animation keyframes */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
