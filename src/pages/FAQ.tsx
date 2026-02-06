import { ArrowLeft, HelpCircle, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    category: "Sobre o LEVEA",
    questions: [
      {
        question: "O que é o LEVEA?",
        answer: "O LEVEA é um sistema de emagrecimento saudável e sustentável, focado em organização de rotina e lembretes inteligentes. Não é uma dieta restritiva, mas sim um método que prioriza consistência e adesão para resultados duradouros."
      },
      {
        question: "Como o LEVEA funciona?",
        answer: "O LEVEA funciona através de 11 módulos funcionais que incluem: Onboarding Inteligente, Lógica Nutricional, Sistema de Chás, Rastreamento & Feedback, Acompanhamento de Progresso, Análise Semanal e Educação. Tudo é personalizado para suas metas e rotina."
      },
      {
        question: "O LEVEA é uma dieta?",
        answer: "Não! O LEVEA não é uma dieta restritiva. É um sistema inteligente que te ajuda a criar hábitos saudáveis de forma gradual e sustentável, respeitando seu estilo de vida e preferências alimentares."
      }
    ]
  },
  {
    category: "Funcionalidades",
    questions: [
      {
        question: "Como funciona o registro de refeições?",
        answer: "Você pode registrar suas refeições de forma simples, buscando alimentos no nosso banco de dados ou adicionando alimentos personalizados. O app calcula automaticamente as calorias e macros consumidos."
      },
      {
        question: "Para que servem os chás recomendados?",
        answer: "O Sistema de Chás do LEVEA sugere chás específicos para diferentes momentos do dia, cada um com benefícios próprios como acelerar o metabolismo, reduzir a ansiedade ou melhorar a digestão."
      },
      {
        question: "O que são as rotinas diárias?",
        answer: "As rotinas diárias são ações personalizadas divididas em blocos de tempo (manhã, almoço, tarde e noite) que te ajudam a manter a consistência no seu processo de emagrecimento."
      },
      {
        question: "Como funciona a análise semanal?",
        answer: "Toda semana, o LEVEA analisa seu progresso considerando refeições registradas, chás consumidos, peso e medidas. Com base nisso, ajusta suas metas e oferece recomendações personalizadas."
      }
    ]
  },
  {
    category: "Progresso e Resultados",
    questions: [
      {
        question: "Como acompanho meu progresso?",
        answer: "Na aba Progresso você pode registrar seu peso, medidas corporais e fotos. O app gera gráficos e comparativos para você visualizar sua evolução ao longo do tempo."
      },
      {
        question: "Em quanto tempo verei resultados?",
        answer: "Os resultados variam de pessoa para pessoa. O LEVEA foca em mudanças sustentáveis, então os primeiros resultados costumam aparecer nas primeiras semanas, mas o mais importante é a consistência a longo prazo."
      },
      {
        question: "O que são as conquistas?",
        answer: "As conquistas são badges que você desbloqueia ao atingir marcos importantes, como manter uma sequência de dias ativos, registrar refeições ou completar check-ins semanais. Elas te motivam a continuar!"
      }
    ]
  },
  {
    category: "Conta e Assinatura",
    questions: [
      {
        question: "Como cancelo minha assinatura?",
        answer: "Você pode gerenciar sua assinatura em Configurações > Assinatura. Lá você encontra opções para cancelar, pausar ou alterar seu plano."
      },
      {
        question: "Meus dados estão seguros?",
        answer: "Sim! Levamos sua privacidade a sério. Seus dados são criptografados e armazenados de forma segura. Nunca compartilhamos suas informações pessoais com terceiros."
      },
      {
        question: "Como excluo minha conta?",
        answer: "Para excluir sua conta, entre em contato com nosso suporte através do WhatsApp ou e-mail. Processaremos sua solicitação em até 48 horas."
      }
    ]
  },
  {
    category: "Suporte",
    questions: [
      {
        question: "Como entro em contato com o suporte?",
        answer: "Você pode nos contatar pelo WhatsApp (+55 11 95331-5047) para atendimento rápido ou pelo e-mail rk.suportee@gmail.com. Estamos sempre prontos para ajudar!"
      },
      {
        question: "Encontrei um bug, o que faço?",
        answer: "Por favor, entre em contato conosco pelo WhatsApp ou e-mail descrevendo o problema. Quanto mais detalhes você fornecer (prints, passos para reproduzir), mais rápido conseguiremos resolver."
      }
    ]
  }
];

export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-lg">Perguntas Frequentes</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2 pb-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Como podemos ajudar?</h2>
          <p className="text-sm text-muted-foreground">
            Encontre respostas para as dúvidas mais comuns sobre o LEVEA
          </p>
        </div>

        {/* FAQ Sections */}
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
              {section.category}
            </h3>
            <Accordion type="single" collapsible className="space-y-2">
              {section.questions.map((item, itemIndex) => (
                <AccordionItem
                  key={itemIndex}
                  value={`${sectionIndex}-${itemIndex}`}
                  className="border border-border rounded-xl px-4 data-[state=open]:bg-accent/50"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 text-center space-y-3">
          <p className="font-medium text-foreground">Não encontrou sua resposta?</p>
          <p className="text-sm text-muted-foreground">
            Nossa equipe está pronta para te ajudar
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open('https://wa.me/5511953315047?text=Olá! Tenho uma dúvida sobre o LEVEA.', '_blank')}
            >
              Falar no WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = 'mailto:rk.suportee@gmail.com'}
            >
              Enviar e-mail
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
