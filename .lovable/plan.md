

## Plan: Replace Auth Page with New Login Design

Replace the current `src/pages/Auth.tsx` login page with the modern split-screen design from `src/components/ui/login-1.tsx`, integrating it with the real authentication system.

### Changes

**1. Rewrite `src/pages/Auth.tsx`**
- Use the split-screen layout, mouse-tracking glow, animated inputs, and social buttons from `login-1.tsx`
- Wire up the form to the existing `useAuth()` hook (`signIn`, `signUp`) with real authentication
- Keep validation (zod), error handling, toast notifications, and redirect logic from current Auth.tsx
- Add sign-up tab/mode with name field
- Keep the "Entrar" / "Criar Conta" tabs functionality

**2. No routing changes needed**
- `/auth` route already exists and points to Auth.tsx

**3. Demo page stays as-is**
- `/demo` continues to show the standalone visual demo

