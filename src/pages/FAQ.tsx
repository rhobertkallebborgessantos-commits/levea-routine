import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo, LogoIcon } from '@/components/Logo';
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
      },
      {
        question: "Para quem o LEVEA é indicado?",
        answer: "O LEVEA é indicado para pessoas que desejam emagrecer de forma saudável, manter o peso ou construir hábitos alimentares melhores. É especialmente útil para quem já tentou dietas restritivas e não conseguiu manter os resultados."
      },
      {
        question: "Preciso de acompanhamento profissional?",
        answer: "O LEVEA é uma ferramenta de apoio e organização, não substitui acompanhamento médico ou nutricional. Se você tem condições de saúde específicas, recomendamos consultar um profissional de saúde."
      }
    ]
  },
  {
    category: "Registro de Refeições",
    questions: [
      {
        question: "Como funciona o registro de refeições?",
        answer: "Você pode registrar suas refeições de forma simples, buscando alimentos no nosso banco de dados ou adicionando alimentos personalizados. O app calcula automaticamente as calorias e macros consumidos."
      },
      {
        question: "Posso adicionar alimentos personalizados?",
        answer: "Sim! Você pode cadastrar alimentos personalizados com nome, calorias e macronutrientes. Esses alimentos ficam salvos no seu perfil para uso futuro."
      },
      {
        question: "O que são as sugestões de refeições?",
        answer: "São combinações pré-definidas de alimentos brasileiros, econômicos e nutritivos. Com um toque você adiciona uma refeição completa ao seu registro, facilitando o acompanhamento para quem prefere opções guiadas."
      },
      {
        question: "Como funciona a meta de calorias?",
        answer: "Sua meta diária de calorias é calculada automaticamente com base no seu peso atual, peso meta, altura, idade, nível de atividade e objetivo. Ela é ajustada semanalmente conforme seu progresso."
      },
      {
        question: "O que significa a barra de proteína?",
        answer: "A barra de proteína mostra quanto da sua meta diária de proteína você já consumiu. Manter uma boa ingestão de proteína ajuda a preservar massa muscular durante o emagrecimento."
      },
      {
        question: "Posso registrar refeições de dias anteriores?",
        answer: "Atualmente, o registro é focado no dia atual para incentivar a consistência diária. Recomendamos registrar suas refeições ao longo do dia para maior precisão."
      }
    ]
  },
  {
    category: "Sistema de Chás",
    questions: [
      {
        question: "Para que servem os chás recomendados?",
        answer: "O Sistema de Chás do LEVEA sugere chás específicos para diferentes momentos do dia, cada um com benefícios próprios como acelerar o metabolismo, reduzir a ansiedade ou melhorar a digestão."
      },
      {
        question: "Como os chás são recomendados para mim?",
        answer: "Os chás são recomendados com base nos seus 'struggles' (dificuldades) informados no onboarding, como ansiedade, inchaço, metabolismo lento, etc. Cada dificuldade é mapeada para chás específicos."
      },
      {
        question: "O que significam as categorias dos chás?",
        answer: "Os chás são categorizados por propósito: Metabolismo (acelerar queima), Digestão (melhorar absorção), Ansiedade (acalmar), Inchaço (reduzir retenção), Sono (melhorar descanso) e Equilíbrio Hormonal."
      },
      {
        question: "O que é a intensidade do chá?",
        answer: "A intensidade indica a força do efeito: Suave (uso diário), Moderado (uso regular com atenção) e Ocasional (usar com moderação). Sempre leia as notas de segurança antes de consumir."
      },
      {
        question: "Como preparo os chás corretamente?",
        answer: "Cada chá tem uma ficha de preparação com ingredientes, passo a passo, tempo de infusão, melhor horário e notas de segurança. Toque no chá para ver todos os detalhes."
      },
      {
        question: "Posso registrar quando tomo um chá?",
        answer: "Sim! Ao tocar em 'Registrar consumo' você salva que tomou o chá naquele dia. Isso ajuda no acompanhamento semanal e nas conquistas relacionadas a chás."
      }
    ]
  },
  {
    category: "Rotinas e Lembretes",
    questions: [
      {
        question: "O que são as rotinas diárias?",
        answer: "As rotinas diárias são ações personalizadas divididas em blocos de tempo (manhã, almoço, tarde e noite) que te ajudam a manter a consistência no seu processo de emagrecimento."
      },
      {
        question: "Como funcionam os lembretes?",
        answer: "Você pode criar lembretes personalizados para cada bloco do dia. Os lembretes podem ser de diferentes categorias como hidratação, refeição, chá, exercício, etc."
      },
      {
        question: "Recebo notificações dos lembretes?",
        answer: "Sim, se você permitir notificações no app, receberá lembretes no horário configurado. As notificações ajudam a manter a consistência nas suas rotinas."
      },
      {
        question: "Posso personalizar os lembretes?",
        answer: "Sim! Você pode criar, editar e excluir lembretes. Cada lembrete pode ter título, mensagem, horário e categoria personalizados."
      }
    ]
  },
  {
    category: "Progresso e Acompanhamento",
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
        question: "O que são as medidas corporais?",
        answer: "Além do peso, você pode registrar medidas como cintura, quadril, peito, braço e coxa. Isso é importante porque às vezes o peso não muda, mas as medidas sim!"
      },
      {
        question: "Como funciona a galeria de fotos?",
        answer: "Você pode tirar fotos de progresso e salvá-las de forma privada. As fotos são armazenadas com segurança e só você tem acesso. É ótimo para comparar o antes e depois."
      },
      {
        question: "Com que frequência devo registrar meu peso?",
        answer: "Recomendamos registrar o peso semanalmente, sempre no mesmo dia e horário (preferencialmente pela manhã, em jejum). Variações diárias são normais e não representam gordura real."
      }
    ]
  },
  {
    category: "Análise Semanal",
    questions: [
      {
        question: "Como funciona a análise semanal?",
        answer: "Toda semana, o LEVEA analisa seu progresso considerando refeições registradas, chás consumidos, peso e medidas. Com base nisso, ajusta suas metas e oferece recomendações personalizadas."
      },
      {
        question: "O que é o check-in semanal?",
        answer: "É um momento de reflexão onde você revisa sua semana, registra seu peso atual e recebe uma pontuação de adesão. O sistema então sugere ajustes para a próxima semana."
      },
      {
        question: "O que é a pontuação de adesão?",
        answer: "É uma porcentagem que mostra o quanto você seguiu o método na semana. Considera refeições registradas, chás consumidos e rotinas completadas. Não é uma nota, é um feedback!"
      },
      {
        question: "O app ajusta minhas metas automaticamente?",
        answer: "Sim! Com base na análise semanal, o LEVEA pode ajustar sua meta de calorias e dar novas recomendações. Isso garante que o método se adapte ao seu progresso real."
      }
    ]
  },
  {
    category: "Conquistas e Gamificação",
    questions: [
      {
        question: "O que são as conquistas?",
        answer: "As conquistas são badges que você desbloqueia ao atingir marcos importantes, como manter uma sequência de dias ativos, registrar refeições ou completar check-ins semanais. Elas te motivam a continuar!"
      },
      {
        question: "Como funciona o sistema de níveis?",
        answer: "Você ganha pontos ao completar ações no app (registrar refeições, tomar chás, fazer check-ins). Conforme acumula pontos, sobe de nível e desbloqueia novas conquistas."
      },
      {
        question: "O que é a sequência de dias?",
        answer: "A sequência (streak) conta quantos dias seguidos você usou o app. Manter uma sequência alta demonstra consistência e te ajuda a formar hábitos duradouros."
      },
      {
        question: "Posso ver minhas conquistas em algum lugar?",
        answer: "Sim! Na aba Conquistas você vê todas as badges disponíveis, quais já desbloqueou, seu nível atual e sua posição no ranking geral dos usuários."
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
      },
      {
        question: "Posso pausar minha assinatura?",
        answer: "Sim, dependendo do seu plano, você pode pausar a assinatura por um período. Durante a pausa, seu acesso fica limitado, mas seus dados são preservados."
      },
      {
        question: "O que acontece se eu cancelar?",
        answer: "Ao cancelar, você continua com acesso até o fim do período pago. Após isso, seu acesso será limitado, mas seus dados históricos são mantidos caso queira voltar."
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
      },
      {
        question: "O app funciona offline?",
        answer: "O LEVEA requer conexão com a internet para sincronizar seus dados. Algumas funcionalidades básicas podem funcionar offline, mas recomendamos estar conectado para a melhor experiência."
      },
      {
        question: "Qual o horário de atendimento do suporte?",
        answer: "Nosso suporte funciona de segunda a sexta, das 9h às 18h. Mensagens enviadas fora desse horário serão respondidas no próximo dia útil."
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
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <LogoIcon size="lg" />
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
