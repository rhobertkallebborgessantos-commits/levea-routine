import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is in admin allowlist
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { _user_id: authData.user.id });

      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Acesso não autorizado. Este email não está na lista de administradores.');
      }

      // Log admin access
      await supabase.from('admin_access_logs').insert({
        admin_id: authData.user.id,
        action: 'login',
        ip_address: 'client',
        user_agent: navigator.userAgent,
        metadata: { timestamp: new Date().toISOString() }
      });

      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao painel administrativo.',
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro de autenticação',
        description: error.message || 'Email ou senha incorretos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
          <CardDescription className="text-slate-400">
            Acesso restrito a administradores autorizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
