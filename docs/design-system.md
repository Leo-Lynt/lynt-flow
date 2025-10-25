# LyntFlow Design System

## 🎨 Paleta de Cores

### Cores Principais da Brand
```css
--brand-pink: #BF1F6A      /* Pink/Magenta */
--brand-purple: #58328C    /* Purple (Cor primária) */
--brand-green: #8CBF3F     /* Green/Lime */
--brand-orange: #F27830    /* Orange */
--brand-red: #D93030       /* Red */
```

### Aplicação no Tailwind
- **Primary:** `brand-purple` (#58328C)
- **Accent:** `brand-green` (#8CBF3F)
- **Success:** `brand-green` (#8CBF3F)
- **Warning:** `brand-orange` (#F27830)
- **Error:** `brand-red` (#D93030)

### Uso de Cores
- **Botões principais:** `bg-brand-purple`
- **Links:** `text-brand-purple`
- **Focus states:** `focus:border-brand-purple`
- **Hover (botões):** `hover:brightness-110` (não mudar de cor)
- **Hover (links):** Variar opacidade (ex: `hover:text-brand-purple/80`)

---

## 📝 Tipografia

### Fonte Principal
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

### Hierarquia de Texto

#### Títulos de Boas-vindas
```html
<h2 class="text-2xl font-semibold text-gray-800 mb-1">
  Bem-vindo de volta!
</h2>
<p class="text-sm text-gray-600">
  Entre com suas credenciais para continuar
</p>
```

#### Labels de Formulário
```html
<label class="block text-xs font-medium text-gray-600 mb-2.5 uppercase tracking-wide">
  E-mail
</label>
```

#### Texto Corpo
- **Normal:** `text-sm text-gray-600`
- **Secundário:** `text-xs text-gray-500`

---

## 🎯 Componentes

### Inputs (Email, Senha, etc.)

```html
<input
  class="w-full px-4 py-2.5 pr-10 bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:bg-white/70 transition-all text-sm tracking-wide"
  placeholder="seu@email.com"
/>
```

**Características:**
- Background: `bg-white/50` (semi-transparente)
- Backdrop blur: `backdrop-blur-sm`
- Border: `border-gray-300` (visível mas sutil)
- Border radius: `rounded` (cantos levemente arredondados)
- Padding: `px-4 py-2.5`
- Focus: Border muda para `brand-purple` e background para `bg-white/70`
- Texto: `text-sm tracking-wide`

### Botões Primários

```html
<button
  class="w-full mt-8 px-6 py-3.5 bg-brand-purple hover:brightness-110 rounded text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
>
  <Icon icon="lucide:log-in" class="w-4 h-4 mr-2" />
  Entrar
</button>
```

**Características:**
- Background: `bg-brand-purple`
- Hover: `hover:brightness-110` (ilumina 10%)
- Border radius: `rounded` (sutil)
- Padding: `px-6 py-3.5`
- Texto: `text-sm font-medium tracking-wide text-white`
- Efeitos: Scale no hover `hover:scale-[1.02]`, shadow `hover:shadow-xl`
- Ícones: `w-4 h-4` (pequenos e delicados)

### Links

#### Links de Ação (ex: "Esqueceu?", "Criar conta")
```html
<RouterLink
  to="/forgot-password"
  class="text-xs font-medium text-brand-purple/80 hover:text-brand-purple transition-colors"
>
  Esqueceu?
</RouterLink>
```

#### Links com Underline
```html
<RouterLink
  to="/register"
  class="font-medium text-brand-purple hover:text-brand-purple/80 transition-colors ml-1 underline decoration-brand-purple/30 hover:decoration-brand-purple/60 underline-offset-2"
>
  Criar conta
</RouterLink>
```

**Características:**
- Cor: `text-brand-purple` (ou variações com opacidade)
- Hover: Variar opacidade, não mudar de cor drasticamente
- Transição suave: `transition-colors`

### Cards Glass

```html
<div class="glass-card backdrop-blur-xl bg-white/30 px-10 py-12 rounded-lg shadow-lg border border-white/20">
  <!-- Conteúdo -->
</div>
```

**CSS Custom:**
```css
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
```

**Características:**
- Background: `bg-white/30` (muito transparente)
- Backdrop blur: `backdrop-blur-xl`
- Border: `border-white/20` (quase invisível)
- Border radius: `rounded-lg` (levemente arredondado)
- Shadow: Suave e delicada
- Padding: `px-10 py-12` (generoso vertical)

### Mensagens de Erro/Alerta

```html
<div class="mb-8 px-5 py-4 rounded flex items-start backdrop-blur-sm border-l-4 bg-red-50/60 border-red-400 text-red-900">
  <Icon icon="lucide:alert-circle" class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
  <div class="flex-1">
    <p class="font-medium text-sm">Mensagem de erro</p>
    <p class="text-xs mt-1.5 opacity-90">Detalhes adicionais</p>
  </div>
</div>
```

**Variações:**
- **Erro:** `bg-red-50/60 border-red-400 text-red-900`
- **Aviso:** `bg-yellow-50/60 border-yellow-400 text-yellow-900`
- **Sucesso:** `bg-green-50/60 border-green-400 text-green-900`

**Características:**
- Border esquerda: `border-l-4` (destaque colorido)
- Background: Semi-transparente `/*color*/-50/60`
- Border radius: `rounded` (sutil)
- Ícone: `w-5 h-5`

### Dividers

```html
<div class="relative my-10">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-gray-300/30"></div>
  </div>
  <div class="relative flex justify-center text-xs">
    <span class="px-4 bg-white/40 text-gray-500 uppercase tracking-widest font-light">
      ou
    </span>
  </div>
</div>
```

---

## 🎭 Animações e Transições

### Background Animado (Telas de Login/Auth)

```css
.bg-gradient-animated {
  background: linear-gradient(
    -45deg,
    #f8e8f3,  /* Rosa claro */
    #ede8f5,  /* Roxo claro */
    #f0f4e8,  /* Verde claro */
    #fef3ed,  /* Laranja claro */
    #fef0f0   /* Vermelho claro */
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Blobs Flutuantes

```html
<div class="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-float-slow"></div>
<div class="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl animate-float-slow animation-delay-2000"></div>
<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow animation-delay-4000"></div>
```

```css
@keyframes float-slow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-float-slow {
  animation: float-slow 20s ease-in-out infinite;
}

.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
```

### Transições de Hover

- **Botões:** `hover:brightness-110 hover:scale-[1.02]`
- **Links:** `hover:opacity-80` ou variar opacidade
- **Ícones:** `hover:opacity-70`
- **Duração:** `transition-all duration-300`

---

## 📐 Espaçamento e Layout

### Containers Principais
- **Max width:** `max-w-md` (448px) para formulários
- **Padding:** `p-4` para mobile, `px-10 py-12` para cards

### Espaçamento entre Elementos
- **Entre seções:** `my-8` ou `my-10`
- **Entre campos de formulário:** `space-y-6`
- **Labels e inputs:** `mb-2.5`

### Border Radius
- **Sutil/Retangular:** `rounded` (4px)
- **Médio:** `rounded-lg` (8px)
- **Nunca usar:** `rounded-xl`, `rounded-2xl`, `rounded-3xl` (muito arredondado)

---

## 🎨 Ícones

### Tamanhos
- **Pequenos (inputs, links):** `w-4 h-4`
- **Médios (alertas):** `w-5 h-5`
- **Grandes (destaque):** `w-6 h-6`

### Biblioteca
- **Lucide Icons** via `@iconify/vue`

### Exemplos
```html
<Icon icon="lucide:mail" class="w-4 h-4 text-gray-400 opacity-60" />
<Icon icon="lucide:eye" class="w-4 h-4 text-gray-500" />
<Icon icon="lucide:log-in" class="w-4 h-4 mr-2" />
<Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
```

---

## ✅ Checklist de Aplicação

Ao criar ou revisar uma tela:

- [ ] Usar fonte **Inter**
- [ ] Labels em **UPPERCASE** com `tracking-wide`
- [ ] Inputs com `rounded` (sutil)
- [ ] Botões com `rounded` (sutil)
- [ ] Cards com `rounded-lg` no máximo
- [ ] Hover dos botões: `brightness-110` (não mudar cor)
- [ ] Hover dos links: variar opacidade (não mudar cor drasticamente)
- [ ] Background glass: `bg-white/30` + `backdrop-blur-xl`
- [ ] Bordas semi-transparentes: `border-white/20`
- [ ] Usar cores da brand: `brand-purple`, `brand-pink`, `brand-green`, etc.
- [ ] Ícones pequenos e delicados: `w-4 h-4`
- [ ] Transições suaves: `transition-all duration-300`
- [ ] Espaçamento generoso mas equilibrado

---

## 🎯 Exemplos de Uso

### Tela de Login
✅ Implementado em: `packages/cms/src/views/LoginView.vue`

### Próximas Telas
- [ ] RegisterView
- [ ] ForgotPasswordView
- [ ] DashboardView
- [ ] SettingsView
- [ ] Outras...

---

## 📝 Notas

- **Filosofia:** Refinado, delicado, minimalista
- **Transparências:** Usar sempre que possível para efeito glass
- **Animações:** Sutis e lentas (15-20s)
- **Consistência:** Todos os elementos devem seguir o mesmo padrão
- **Acessibilidade:** Manter contraste adequado nos textos

---

**Última atualização:** 2025-10-24
**Versão:** 1.0
