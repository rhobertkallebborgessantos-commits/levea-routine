

## Plano: Dados mock temporários no gráfico de peso

Vou adicionar dados fictícios temporários no componente `WeightTracker` para que o gráfico apareça preenchido. Assim você tira o print e depois eu removo.

### Mudança

**`src/components/progress/WeightTracker.tsx`**: Se `chartData` estiver vazio, usar dados mock de exemplo com uma curva de perda de peso realista (ex: 78kg → 74.5kg ao longo de 30 dias). O gráfico será renderizado com esses dados fictícios. Também vou mostrar valores mock nos cards de "Atual" e "Variação".

Após você tirar o print, reverteremos a mudança.

