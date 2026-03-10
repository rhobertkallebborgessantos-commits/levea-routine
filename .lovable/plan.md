

## Fix: Aumentar a largura do degradê nas bordas do marquee de depoimentos

**Problema:** As faixas de degradê laterais (`w-24` = 96px) são pequenas demais para cobrir os cards conforme passam pelas bordas, quebrando o efeito de fade.

**Solução:** Aumentar de `w-24` para `w-48` (192px) em ambos os lados, garantindo que o degradê cubra uma porção maior dos cards ao entrar/sair da viewport.

**Arquivo:** `src/components/ui/testimonials-with-marquee.tsx` (linhas 80-81)

Alterar:
- `w-24` → `w-48` nas duas divs de gradiente

