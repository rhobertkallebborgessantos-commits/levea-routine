# Segunda Revisao do LEVEA -- O que ainda falta

## Status dos itens da revisao anterior


| Item                                   | Status               |
| -------------------------------------- | -------------------- |
| Auth redirect em useEffect             | Corrigido            |
| Event listener leak no Settings        | Corrigido            |
| FAQ link com `<Link>` no Settings      | Corrigido            |
| XP unificado (single update)           | Corrigido            |
| Coluna `daily_xp_earned` dedicada      | Corrigido            |
| UUID hardcoded removido (Subscription) | Corrigido            |
| Streak milestones com `>=`             | Corrigido            |
| Esqueci minha senha                    | Corrigido            |
| Footer com links                       | Corrigido            |
| `will-change: transform` no marquee    | Corrigido            |
| Tabela `daily_tips` populada           | Corrigido (30 dicas) |


---

## O que ainda falta

### 1. Bug ativo: `AchievementCard` sem `forwardRef`

O console ainda mostra o warning "Function components cannot be given refs" no componente `AchievementCard`. O `AnimatePresence` com `mode="popLayout"` na pagina Achievements tenta passar ref para `AchievementCard`, que nao aceita.

**Correcao:** Envolver `AchievementCard` com `React.forwardRef`.

### 3. XP nao e concedido ao registrar refeicoes, chas, peso ou fotos

O XP so e concedido ao completar habitos (rotinas) e login diario. Registrar refeicoes, consumir chas, registrar peso e enviar fotos de progresso nao concedem XP, apesar de serem acoes core do app.

**Correcao:**

- Adicionar rewards em `xp-config.ts`: `MEAL_LOGGED: 10`, `TEA_LOGGED: 10`, `WEIGHT_LOGGED: 15`, `PHOTO_UPLOADED: 20`, `CHECKIN_COMPLETED: 25`
- Chamar `xpReward.mutate()` nos hooks `useMeals`, `useTodayMeals`, `useProgress` e `useWeeklyCheckin` apos acoes relevantes

### 4. Conquistas nao acessiveis pelo BottomNav

A pagina de Conquistas so e acessivel pelo widget do Dashboard. Nao ha link na navegacao inferior.

**Correcao:** Adicionar item "Conquistas" (icone Trophy) ao `BottomNav`, substituindo ou adicionando ao lado de outro item. Com 6 itens ficaria apertado -- a melhor opcao e substituir "Ajustes" por "Conquistas" e mover Ajustes para um icone no header do Dashboard, ou manter 5 itens trocando a posicao.

### 5. Termos de Servico e Politica de Privacidade nao existem

Na pagina de Auth, o texto "Ao continuar, voce concorda com nossos Termos de Servico e Politica de Privacidade" nao tem links clicaveis. Para producao, isso precisa ser corrigido com paginas reais ou pelo menos modais com conteudo basico.

### 6. `useMeals` -- hook `useAddMealLog` nao concede XP

O hook que adiciona refeicoes ao banco nao chama o sistema de XP. O usuario registra refeicoes mas nao ganha pontos.

---

## Plano de implementacao

### Prioridade Alta

1. **Corrigir `forwardRef` no `AchievementCard**` -- adicionar `React.forwardRef` para eliminar o warning do console
2. **Conectar XP a refeicoes, chas, peso, fotos e check-ins** -- adicionar novos tipos de reward e integrar nos hooks correspondentes

### Prioridade Media

3. **Adicionar Conquistas ao BottomNav** -- trocar "Ajustes" por "Conquistas" e mover ajustes para o header
4. **Substituir imagens placeholder do Showcase** -- criar cards visuais com gradientes e icones em vez de fotos genericas

### Prioridade Baixa

5. **Criar paginas de Termos e Privacidade** -- mesmo que com conteudo placeholder, ter os links funcionais