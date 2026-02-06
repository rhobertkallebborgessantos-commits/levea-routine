

## Correção dos Links do WhatsApp

### Problema Identificado
Os links do WhatsApp estão com caracteres especiais (acentos) não codificados na URL, o que pode causar erros em certos navegadores e dispositivos. O texto "Olá!" precisa ser codificado como `Ol%C3%A1!`.

### Solução
Corrigir os links em duas páginas usando `encodeURIComponent()` para garantir que os caracteres especiais sejam codificados corretamente:

### Arquivos a Modificar

**1. src/pages/Settings.tsx**
- Alterar o link do WhatsApp (linha 382-395)
- Substituir o `<a href>` por um `<a>` com `onClick` usando `window.open()` com URL codificada

**2. src/pages/FAQ.tsx**
- Corrigir o `window.open()` (linha 297) para usar URL codificada

### Código da Correção

Criar uma URL codificada corretamente:
```javascript
const whatsappUrl = `https://wa.me/5511953315047?text=${encodeURIComponent('Olá! Preciso de ajuda com o app LEVEA.')}`;
window.open(whatsappUrl, '_blank');
```

Isso transforma:
- `Olá!` → `Ol%C3%A1!`
- Espaços → `%20`

### Detalhes Técnicos
- O `encodeURIComponent()` garante que todos os caracteres especiais sejam convertidos para formato URL-safe
- Usar `window.open()` em vez de `href` direto dá mais controle e funciona melhor em dispositivos móveis
- Manter consistência entre FAQ.tsx e Settings.tsx

