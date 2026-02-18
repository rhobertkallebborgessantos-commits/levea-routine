

## Remover o sininho do Dashboard

O sininho (icone de notificacao) no canto superior direito do Dashboard nao tem funcionalidade conectada. Vou remove-lo para evitar confusao.

### Alteracao

**Arquivo:** `src/pages/Dashboard.tsx`

- Remover o botao com o icone `Bell` do header
- Remover a importacao do `Bell` do lucide-react (se nao for usado em outro lugar do arquivo)

Isso e uma mudanca simples de UI -- apenas remover o botao que nao faz nada.

