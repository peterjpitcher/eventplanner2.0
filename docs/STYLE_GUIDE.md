Absolutely! Below is your full **Event Planner Style Guide** in **Markdown** format – ready to drop into a repository, Notion doc, or hand over directly to your developer.

---

```markdown
# 🎨 Event Planner – Style Guide

**Version**: 1.0  
**Date**: March 2025  
**Owner**: Peter Pitcher  
**Primary Brand Colour**: **Orange (`#F28C38`)**

---

## 🧭 Brand Overview

**Event Planner** is a bold, warm, and user-friendly application for organising events. The style is led by a rich orange colour, supported by complementary warm and cool tones to balance clarity with energy.

---

## 🎨 Colour Palette

| Name             | Hex Code  | Usage                                      |
|------------------|-----------|---------------------------------------------|
| **Primary Orange**   | `#F28C38` | Main buttons, headers, active states        |
| **Burnt Orange**     | `#F26430` | Hover states, icons, accent elements        |
| **Dark Teal**        | `#174F5F` | Text, footer background, strong contrast    |
| **Light Orange**     | `#FDB45C` | Card backgrounds, secondary buttons         |
| **Sun Yellow**       | `#F6C343` | Tags, highlights, visual interest           |

### CSS Custom Properties
```css
:root {
  --colour-primary: #F28C38;
  --colour-secondary: #F26430;
  --colour-dark: #174F5F;
  --colour-accent: #FDB45C;
  --colour-highlight: #F6C343;
}
```

---

## ✍️ Typography

### Fonts (Google Fonts)

- **Primary (Headings, Buttons)**:  
  `Poppins` – [https://fonts.google.com/specimen/Poppins](https://fonts.google.com/specimen/Poppins)  
  Weights: `500`, `700`

- **Secondary (Body Text)**:  
  `Open Sans` – [https://fonts.google.com/specimen/Open+Sans](https://fonts.google.com/specimen/Open+Sans)  
  Weights: `400`, `600`

### CSS Import
```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Poppins:wght@500;700&display=swap');
```

### Base Font Styles
```css
body {
  font-family: 'Open Sans', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: var(--colour-dark);
  background-color: #fff;
}

h1, h2, h3, h4, h5, h6, .button {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: var(--colour-dark);
}
```

### Type Scale

| Token     | Size   | Use Case         |
|-----------|--------|------------------|
| `text-xs` | 12px   | Labels           |
| `text-sm` | 14px   | Input text, UI   |
| `base`    | 16px   | Body             |
| `lg`      | 18px   | Subheadings      |
| `xl`      | 24px   | Section titles   |
| `2xl`     | 32px   | Page headers     |

---

## 🧱 Components

### Buttons
```css
.button-primary {
  background-color: var(--colour-primary);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button-primary:hover {
  background-color: var(--colour-secondary);
}
```

### Inputs
```css
.input {
  border: 1px solid #ccc;
  padding: 0.75rem;
  border-radius: 0.375rem;
  width: 100%;
  font-size: 1rem;
  font-family: 'Open Sans', sans-serif;
}

.input:focus {
  border-color: var(--colour-primary);
  outline: none;
}
```

### Cards
```css
.card {
  background-color: var(--colour-accent);
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}
```

---

## 📐 Layout & Spacing

### Container Widths
```css
--container-sm: 540px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

### Spacing Scale (in px)

```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80
```

---

## ⚙️ Tailwind CSS Configuration

If using Tailwind, apply this config:

### `tailwind.config.js`
```js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F28C38',
        secondary: '#F26430',
        dark: '#174F5F',
        accent: '#FDB45C',
        highlight: '#F6C343',
      },
      fontFamily: {
        sans: ['Open Sans', ...defaultTheme.fontFamily.sans],
        display: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
```

### `globals.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Poppins:wght@500;700&display=swap');

body {
  @apply font-sans text-dark;
}

h1, h2, h3 {
  @apply font-display text-primary;
}
```

---

## 🧪 Utility Classes

| Class              | Description                         |
|--------------------|--------------------------------------|
| `bg-primary`        | Background: `#F28C38`                |
| `bg-secondary`      | Background: `#F26430`                |
| `text-dark`         | Text: `#174F5F`                      |
| `bg-accent`         | Background: `#FDB45C`                |
| `bg-highlight`      | Background: `#F6C343`                |
| `rounded-lg`        | Standard component radius            |
| `shadow-md`         | Medium depth box shadow              |

---

## ✅ Developer Summary

- Use **orange (#F28C38)** as the core brand colour across UI.
- Fonts: **Poppins** for headings and **Open Sans** for body copy via Google Fonts.
- Style all buttons with `.button-primary` or `bg-primary` class.
- Base layout uses simple spacing and neutral backgrounds.
- Tailwind and CSS variable support provided.

---

```

Let me know if you'd like this as a downloadable file (Markdown `.md` or PDF) – happy to generate it for you!