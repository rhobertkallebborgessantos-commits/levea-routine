

## Plan: Modern SaaS Login Page

**Important note:** This project uses React + Vite, not Next.js. Installing Next.js is not possible in a Lovable project. The plan adapts the request to work within the existing stack (React, Vite, TailwindCSS, shadcn/ui).

### Changes

**1. Add CSS variables to `src/index.css`**
- Add the custom color palette variables (--color-bg, --color-surface, etc.) for both light and dark modes under a `.login-theme` scope to avoid conflicts with existing LEVEA theme.

**2. Create `src/components/ui/login-1.tsx`**
- Split-screen layout: left = login form, right = Unsplash tech image
- Form with "Entrar no Sistema" title, email/password inputs, "Sign In" button
- "Forgot password" link
- Social login buttons: Instagram (icon link) and WhatsApp (links to `https://wa.me/5599999999999`)
- Interactive effects: mouse-following glow, animated gradient on inputs, animated button, floating gradient blur background
- Responsive: hide right image on mobile
- Green/white color palette using the provided CSS variables
- Modern SVG icons for Instagram and WhatsApp

**3. Create `src/pages/Demo.tsx`**
- Simple page importing and rendering the login-1 component

**4. Add route in `src/App.tsx`**
- Add `/demo` route pointing to the Demo page

### Technical Details

- Mouse-tracking glow effect via `onMouseMove` state + radial gradient
- Input focus animations with CSS transitions and green border glow
- Button with gradient animation on hover
- Right panel uses the Unsplash image as background with overlay
- All responsive breakpoints handled with Tailwind (`lg:` for split, hidden on mobile for image)
- No Next.js dependency needed; uses React Router for routing

