import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';

export default function Terms() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Termos de Serviço</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert">
          <h1>Termos de Serviço do LEVEA</h1>
          <p><strong>Última atualização:</strong> 10 de março de 2026</p>

          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar e usar o LEVEA, você concorda com estes Termos de Serviço. Se você não concordar, não utilize o serviço.</p>

          <h2>2. Descrição do Serviço</h2>
          <p>O LEVEA é uma plataforma digital de acompanhamento de rotina alimentar e hábitos saudáveis. O serviço não substitui orientação médica ou nutricional profissional.</p>

          <h2>3. Conta do Usuário</h2>
          <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso. Todas as atividades realizadas em sua conta são de sua responsabilidade.</p>

          <h2>4. Uso Aceitável</h2>
          <p>Você concorda em não utilizar o serviço para atividades ilegais, não tentar acessar dados de outros usuários e não interferir no funcionamento da plataforma.</p>

          <h2>5. Assinaturas e Pagamentos</h2>
          <p>Alguns recursos do LEVEA requerem assinatura paga. As condições de pagamento, renovação e cancelamento são apresentadas no momento da contratação.</p>

          <h2>6. Propriedade Intelectual</h2>
          <p>Todo o conteúdo, design e funcionalidades do LEVEA são protegidos por direitos autorais. Você não pode copiar, modificar ou distribuir qualquer parte do serviço.</p>

          <h2>7. Limitação de Responsabilidade</h2>
          <p>O LEVEA é fornecido "como está". Não nos responsabilizamos por decisões de saúde baseadas exclusivamente nas informações do aplicativo. Consulte sempre um profissional de saúde.</p>

          <h2>8. Alterações nos Termos</h2>
          <p>Podemos atualizar estes termos periodicamente. Continuando a usar o serviço após alterações, você aceita os novos termos.</p>

          <h2>9. Contato</h2>
          <p>Para dúvidas sobre estes termos, entre em contato pelo e-mail: contato@levea.app</p>
        </main>
      </div>
    </PageTransition>
  );
}
