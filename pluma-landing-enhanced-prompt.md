# Pluma Landing Page - Design Brief for Replit AI

## Design System Reference

**IMPORTANT**: Follow the design guidelines in `design-system.json` for all visual decisions. Key principles:

### Visual Style
- **Aesthetic**: Luxury minimalism with sophisticated elegance
- **Design Approach**: Premium financial service with architectural precision
- **Mood**: Trustworthy, refined, aspirational yet approachable

### Color Palette
- **Primary Background**: `#FFFFFF` (pure white)
- **Secondary Background**: `#1C3F3A` (deep forest green)
- **Accent/CTA**: `#C8A882` (muted gold/brass)
- **Warm Background**: `#EBE8D8` (warm beige)
- **Text Dark**: `#2B2B2B`
- **Text Light**: `#FFFFFF`

### Typography System
- **Headlines (h1, h2, h3)**: Elegant serif font (like Playfair Display or Cormorant)
  - Font Weight: 300-400 (Light to Regular)
  - Text Transform: UPPERCASE for major headers
  - Letter Spacing: Tight (-0.02em for h1, -0.01em for h2)
- **Body & UI**: Clean sans-serif (like Inter or Montserrat)
  - Font Weight: 300-400
  - Line Height: 1.6-1.8 for readability
  
### Spacing & Layout
- **Base Unit**: 8px scale (16, 24, 32, 48, 64, 96, 120, 160)
- **Section Padding**: 96-160px vertical
- **Container Max Width**: 1280-1440px
- **Grid System**: 12-column with 24-32px gaps

### Component Styles

#### Buttons
- **Primary CTA**: Gold background (#C8A882), white text, minimal border-radius (2-4px)
- **Typography**: Uppercase, 500 weight, 0.1em letter-spacing
- **Padding**: 16px 32px
- **Hover**: Subtle opacity (0.9) with 300ms transition

#### Cards
- **Background**: Pure white (#FFFFFF)
- **Padding**: 32-48px
- **Shadow**: Very subtle (0 4px 24px rgba(0,0,0,0.06))
- **Border Radius**: 0-4px (sharp or minimal rounding)
- **Hover**: Gentle lift with shadow increase

#### Icons
- **Library**: Lucide Icons
- **Size**: 24-32px for feature cards
- **Color**: Gold accent (#C8A882) or context color
- **Stroke Width**: 1.5-2

---

## Section 1: Hero

**Layout**: 2 columns (50/50 split)
**Background**: `#FFFFFF`

### Column 1 (Left - Content)
- **Title h1**: "O primeiro assistente financeiro com IA que realmente entende seu dinheiro"
  - Serif font, 48-64px, font-weight 300-400
  - Color: #2B2B2B
  - Uppercase styling
  - Line height: 1.2
  - Letter spacing: -0.02em
  
- **Subtitle**: "O Pluma é o único app que combina Open Finance com IA conversacional para dar respostas instantâneas sobre suas finanças - sem você precisar interpretar gráficos complicados ou fazer cálculos manuais."
  - Sans-serif, 16-18px, font-weight 300-400
  - Color: #6B6B6B
  - Line height: 1.7
  - Max width: 540px
  - Margin top: 24px
  
- **CTA Button**: "Teste grátis por 14 dias"
  - Background: #C8A882 (gold)
  - Text: #FFFFFF
  - Uppercase, 14-16px, font-weight 500
  - Padding: 16px 32px
  - Border-radius: 2-4px
  - Margin top: 32px
  - Add arrow icon → from Lucide
  - Hover: opacity 0.9, transition 300ms

### Column 2 (Right - Visual)
- **Image**: [Generate a sophisticated lifestyle image showing a person confidently using a mobile banking app in a modern, well-lit environment. The image should convey trust, ease, and financial control. Style: professional photography, muted color grading, natural lighting, aspirational yet relatable]
- **Image Treatment**: Full height, object-fit cover, subtle vignette

**Section Padding**: 96-120px vertical, 80px horizontal

---

## Section 2: Why Pluma

**Layout**: 1 column header + 3-column card grid
**Background**: `#FFFFFF`
**Section Padding**: 96-120px vertical

### Header (Centered)
- **Title h2**: "Porque Pluma?"
  - Serif font, 36-48px, font-weight 300-400
  - Color: #2B2B2B
  - Uppercase
  - Text align: center
  - Margin bottom: 64px

### 3-Column Card Grid
**Grid Gap**: 32px between cards

#### Card 1
- **Icon**: Bank (Lucide Icons)
  - Size: 32px
  - Color: #C8A882
  - Margin bottom: 24px
- **Title h3**: "Conecta automaticamente"
  - Sans-serif, 20-24px, font-weight 500
  - Color: #2B2B2B
  - Margin bottom: 16px
- **Description**: "Conecta automaticamente todas suas contas (Open Finance do Banco Central)"
  - Sans-serif, 16px, font-weight 300-400
  - Color: #6B6B6B
  - Line height: 1.6

**Card Style**:
- Background: #FFFFFF
- Padding: 40px
- Border-radius: 4px
- Box-shadow: 0 4px 24px rgba(0,0,0,0.06)
- Hover: lift with shadow 0 8px 32px rgba(0,0,0,0.08), transition 300ms

#### Card 2
- **Icon**: Banknote (Lucide Icons - for cash/money)
- **Title h3**: "Experiência personalizada"
- **Description**: "Responde suas dúvidas em linguagem humana, e sugere ações para a sua situação real"
- Same styling as Card 1

#### Card 3
- **Icon**: MessageSquare (Lucide Icons - for chat)
- **Title h3**: "Atualiza sozinho"
- **Description**: "Não precisa fazer input de nenhuma informação - você só conversa e toma decisões"
- Same styling as Card 1

---

## Section 3: Pluma Answers

**Layout**: 1 column (centered)
**Background**: `#1C3F3A` (deep forest green)
**Section Padding**: 120-160px vertical

### Content Card (Centered, Max Width 900px)

- **Title h2**: "Você tem perguntas, a Pluma tem respostas"
  - Serif font, 36-48px, font-weight 300-400
  - Color: #FFFFFF
  - Uppercase
  - Text align: center
  - Margin bottom: 48px

### Chat Interface Mockup
[Generate a modern chat interface UI component that resembles ChatGPT but with Pluma branding]

**Design Specifications**:
- **Container**: White background (#FFFFFF), border-radius 8px, padding 32px
- **Input Field**: 
  - Placeholder: "Pergunte-me qualquer coisa sobre suas finanças"
  - Style: Light gray border, 48px height, 16px font size
  - Icon: Sparkles or Zap icon from Lucide (suggesting AI)
  
- **Prompt Suggestions** (5 chips below input):
  1. "Quanto posso gastar neste fim de semana?"
  2. "Por que minha conta está sempre no vermelho?"
  3. "Consigo trocar de carro este ano?"
  4. "Onde estou gastando demais?"
  5. "Quanto preciso guardar para a reserva de emergência?"

**Chip Style**:
- Background: #F5F5F5
- Padding: 12px 20px
- Border-radius: 24px (pill shape)
- Font: 14px, weight 400
- Color: #2B2B2B
- Border: 1px solid rgba(0,0,0,0.1)
- Hover: 
  - Background: #C8A882 (gold)
  - Color: #FFFFFF
  - Transform: translateY(-2px)
  - Transition: all 300ms ease
  - Add subtle shadow

**Layout**: Flex wrap with 12px gaps between chips

---

## Section 4: Safety

**Layout**: 2 columns (50/50)
**Background**: [Generate a subtle textured gradient using #EBE8D8 as base - add paper-like texture or gentle diagonal gradient to #F5F5F5]
**Section Padding**: 96-120px vertical

### Column 1 (Left)
- **Title h2**: "Seus dados estão seguros conosco"
  - Serif font, 36-48px, font-weight 300-400
  - Color: #2B2B2B
  - Uppercase
  - Line height: 1.3
  - Max width: 400px

### Column 2 (Right - Security Cards)
**Stack 4 cards vertically with 16px gaps**

#### Security Card Design (Repeated 4x)
- **Background**: #FFFFFF
- **Padding**: 20px 24px
- **Border-radius**: 4px
- **Box-shadow**: 0 2px 12px rgba(0,0,0,0.04)
- **Display**: Flex row with 16px gap

**Icon**:
- Check or Shield icon from Lucide
- Size: 20px
- Color: #C8A882 (gold)

**Text**:
- Font: Sans-serif, 16px, weight 400
- Color: #2B2B2B
- Line height: 1.5

#### Cards Content:
1. ✓ "Open Finance Certificado pelo banco central"
2. ✓ "Mesma segurança que seu internet banking"
3. ✓ "Seus dados nunca saem do Brasil"
4. ✓ "Criptografia de ponta a ponta"

---

## Section 5: Call To Action

**Layout**: 1 column (centered)
**Background**: `#1C3F3A` (deep forest green)
**Section Padding**: 120-160px vertical
**Max Width**: 720px centered

### Content (Centered alignment)

- **Title h2**: "Retome o controle da sua vida financeira"
  - Serif font, 36-48px, font-weight 300-400
  - Color: #FFFFFF
  - Uppercase
  - Text align: center
  - Margin bottom: 32px

- **Benefits List**:
  - Font: Sans-serif, 18px, weight 300-400
  - Color: #FFFFFF
  - Line height: 2
  - Text align: center or left-aligned in centered container
  - Items:
    * ✓ 14 dias grátis - cancele quando quiser
    * ✓ Conecte suas contas em 2 minutos via Open Finance
    * ✓ Sem pegadinhas - preço fixo após o trial
  - Checkmark icon: 18px, color #C8A882
  - Margin bottom: 40px

- **CTA Button**: "Teste grátis agora →"
  - Background: #C8A882 (gold)
  - Text: #FFFFFF
  - Uppercase, 14-16px, font-weight 500
  - Padding: 18px 40px (larger than other CTAs)
  - Border-radius: 2-4px
  - Add arrow icon →
  - Hover: scale 1.02, transition 300ms
  - Display: inline-block, centered

---

## Section 6: Footer

**Layout**: Multi-column grid
**Background**: `#2B2B2B` (dark gray)
**Section Padding**: 64px vertical, 80px horizontal

### Layout Structure (4 columns on desktop, stack on mobile)

#### Column 1: Logo & Tagline
- **Logo**: Pluma logo in white or gold
- **Tagline**: "Inteligência financeira ao seu alcance"
  - Font: 14px, weight 300
  - Color: #6B6B6B
  - Margin top: 16px

#### Column 2: Website Sections
- **Title**: "Navegação"
  - Font: 14px, weight 500, uppercase
  - Color: #FFFFFF
  - Letter spacing: 0.1em
  - Margin bottom: 16px
- **Links**: Sobre, Recursos, Preços, Blog
  - Font: 14px, weight 400
  - Color: #6B6B6B
  - Line height: 2
  - Hover: color #C8A882, transition 300ms

#### Column 3: Legal
- **Title**: "Legal"
  - Same as Column 2 title
- **Links**: 
  - Política de Privacidade
  - Termos e Condições
  - Same link styling as Column 2

#### Column 4: Contact/Social (optional)
- Social media icons if applicable
- Contact email

### Bottom Bar
- **Copyright**: "© 2024 Pluma. Todos os direitos reservados."
  - Font: 12px, weight 400
  - Color: #6B6B6B
  - Text align: center
  - Margin top: 48px
  - Border top: 1px solid rgba(255,255,255,0.1)
  - Padding top: 24px

---

## General Animation & Interaction Guidelines

### Scroll Animations
- **Fade-in + Slide-up**: Elements fade in and slide up 20-30px as they enter viewport
- **Duration**: 600ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Stagger**: 100-150ms delay between elements in groups

### Hover States
- **Cards**: Lift 4-8px with shadow increase
- **Buttons**: Opacity 0.9 or subtle scale 1.02
- **Links**: Color change to gold (#C8A882)
- **All transitions**: 300ms ease

### Focus States
- **Outline**: 2px solid #C8A882
- **Offset**: 2px
- **Border-radius**: Matches element

---

## Responsive Behavior

### Breakpoints
- **Desktop**: 1280px+
- **Tablet**: 768-1279px
- **Mobile**: <768px

### Mobile Adaptations
- 2-column layouts become 1-column stacked
- Section padding reduces to 64px vertical
- Font sizes scale down proportionally (h1: 36-42px)
- Cards maintain full width with 16px horizontal padding
- 3-column card grids become 1-column
- Hero image moves below content on mobile

---

## Image Generation Guidelines

When generating images, ensure:
- **Style**: Professional lifestyle photography
- **Color Grading**: Muted, sophisticated tones
- **Lighting**: Natural, soft lighting
- **Composition**: Clean, uncluttered
- **Mood**: Confident, aspirational, trustworthy
- **Context**: Modern financial/tech environment
- **People**: Diverse, professionally dressed, engaged with technology

---

## Final Notes for AI

- Maintain consistent spacing rhythm throughout using the 8px base unit
- Ensure all text has sufficient contrast (WCAG AA minimum)
- Keep animations subtle and elegant - never jarring
- Use the gold accent (#C8A882) sparingly for maximum impact
- Every section should feel spacious and breathable
- Typography hierarchy must be clear and intentional
- The overall aesthetic should communicate "premium yet accessible financial intelligence"
