import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Mariana Costa",
    handle: "@marianasaudavel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    text: "O Levea me ajudou a criar constância. Pela primeira vez consegui seguir uma rotina sem me sentir pressionada.",
  },
  {
    name: "Lucas Almeida",
    handle: "@lucasfitness",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    text: "Os lembretes e a organização da rotina mudaram completamente minha disciplina.",
  },
  {
    name: "Camila Rocha",
    handle: "@camilarocha",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    text: "Eu já tentei várias dietas antes, mas o Levea me mostrou que o segredo é consistência.",
  },
  {
    name: "Rafael Mendes",
    handle: "@rafaelmendes",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    text: "Perdi 8kg em 3 meses sem passar fome. O acompanhamento diário faz toda a diferença.",
  },
  {
    name: "Juliana Santos",
    handle: "@jusantos.fit",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    text: "Finalmente entendi que emagrecer é sobre rotina, não sobre restrição. O Levea mudou minha relação com a comida.",
  },
  {
    name: "Pedro Oliveira",
    handle: "@pedrooliveira",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    text: "As sugestões de chás e refeições são incríveis. Sinto que tenho um nutricionista no bolso.",
  },
];

function TestimonialCard({ name, handle, avatar, text }: (typeof testimonials)[0]) {
  return (
    <div className="flex-shrink-0 w-[340px] rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <p className="text-muted-foreground text-sm leading-relaxed mb-5">"{text}"</p>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{handle}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsWithMarquee() {
  // Double the list for seamless loop
  const items = [...testimonials, ...testimonials];

  return (
    <section className="py-20 px-4 bg-background overflow-hidden">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Resultados reais de quem usa o Levea
        </h2>
        <p className="text-muted-foreground text-lg">
          Pessoas que decidiram criar hábitos mais saudáveis e construir consistência sem dietas restritivas.
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {items.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
