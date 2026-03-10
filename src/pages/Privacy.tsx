import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';

export default function Privacy() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Política de Privacidade</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert">
          <h1>Política de Privacidade do LEVEA</h1>
          <p><strong>Última atualização:</strong> 10 de março de 2026</p>

          <h2>1. Dados Coletados</h2>
          <p>Coletamos dados que você fornece diretamente: nome, e-mail, peso, medidas corporais, registros alimentares, fotos de progresso e preferências de rotina.</p>

          <h2>2. Uso dos Dados</h2>
          <p>Seus dados são utilizados exclusivamente para:</p>
          <ul>
            <li>Personalizar sua experiência no aplicativo</li>
            <li>Gerar relatórios e análises de progresso</li>
            <li>Enviar lembretes e notificações configurados por você</li>
            <li>Melhorar o serviço de forma agregada e anônima</li>
          </ul>

          <h2>3. Armazenamento e Segurança</h2>
          <p>Seus dados são armazenados em servidores seguros com criptografia. Fotos de progresso são mantidas em armazenamento privado acessível apenas por você.</p>

          <h2>4. Compartilhamento</h2>
          <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando necessário para o funcionamento do serviço (processadores de pagamento) ou exigido por lei.</p>

          <h2>5. Seus Direitos (LGPD)</h2>
          <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
          <ul>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar consentimento a qualquer momento</li>
            <li>Solicitar portabilidade dos dados</li>
          </ul>

          <h2>6. Cookies</h2>
          <p>Utilizamos cookies essenciais para manter sua sessão ativa. Não utilizamos cookies de rastreamento publicitário.</p>

          <h2>7. Retenção de Dados</h2>
          <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após exclusão da conta, os dados são removidos em até 30 dias.</p>

          <h2>8. Contato do DPO</h2>
          <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade: privacidade@levea.app</p>
        </main>
      </div>
    </PageTransition>
  );
}
