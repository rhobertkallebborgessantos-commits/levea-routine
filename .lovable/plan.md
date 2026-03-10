

# Showcase: Imagens completas sem moldura de celular

## Problema
As imagens estao dentro de um container fixo de `w-[220px] h-[380px]` (formato celular) com `object-cover`, cortando o conteudo dos screenshots. No mobile, `aspect-[2/3]` causa o mesmo efeito.

## Solucao
Remover a moldura de celular e fazer a imagem preencher todo o card do accordion. A imagem fica como background do painel ativo, com overlay escuro para legibilidade do texto.

### Desktop (accordion)
- Remover o container `w-[220px] h-[380px]` intermediario
- Colocar a `OptimizedImage` como fundo absoluto do card (`absolute inset-0`)
- Adicionar overlay gradiente escuro na parte inferior para o texto
- Texto posicionado no bottom do card

### Mobile (grid)
- Remover o container `max-w-[160px] aspect-[2/3]`
- Imagem como background absoluto do card
- Overlay + texto posicionado sobre a imagem
- Altura fixa (`h-48` ou similar) para uniformidade

### Resultado visual
Cada card mostra a screenshot completa, sem recorte de formato celular, com texto sobreposto na parte inferior com gradiente escuro para contraste.

