# Internacionalização e Tema (i18n + Theme Toggle)

## Decisões de Design

### 1. **Internacionalização (i18n) - Sem dependências externas**

#### Por que não using react-i18next?
- **Simplicidade**: Para um MVP, react-i18next adiciona complexidade desnecessária
- **Bundle size**: ~30KB minimizado, nosso i18n é ~2KB
- **Manutenção**: Código explícito é mais fácil de entender para novos devs

#### Estrutura implementada:
```
src/i18n/
├── en.ts       # English dictionary
├── pt.ts       # Portuguese dictionary
└── index.ts    # Export and type definitions
```

#### Uso nos componentes:
```tsx
import { useLanguage } from '../hooks/useLanguage';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return <h1>{t('appTitle')}</h1>;
}
```

#### Como funciona:
1. **Dicionário simples**: Pares chave-valor TypeScript
2. **LanguageContext**: Armazena idioma atual
3. **useLanguage hook**: Acesso fácil do contexto
4. **localStorage**: Persiste escolha do usuário

#### Extensibilidade:
Para adicionar um novo idioma:
1. Criar `src/i18n/es.ts` com as mesmas chaves
2. Importar em `src/i18n/index.ts`
3. Adicionar a `SUPPORTED_LANGUAGES`

---

### 2. **Theme Toggle - Neutral vs Cross**

#### Por que CSS variables ao invés de Tailwind classes?
- **Flexibilidade**: Themes são aplicados dinamicamente
- **Sem re-render desnecessário**: CSS variables atualizam sem JavaScript
- **Compatibilidade**: Funciona com qualquer sistema de styles

#### Estrutura:
```css
:root[data-theme="neutral"] {
  --color-accent: #2563eb;  /* Professional blue */
}

:root[data-theme="cross"] {
  --color-accent: #22c55e;  /* Bold green */
}
```

#### Temas definidos:

**Neutral** (Padrão):
- Cores sóbrias, profissionais
- Tons de cinza e azul suave
- Apropriado para contexto B2B

**Cross**:
- Cores ousadas e com contraste alto
- Background escuro com acentos vibrantes
- Mais visualmente dinâmico

#### Uso:
```tsx
const { theme, setTheme, toggleTheme } = useTheme();
```

---

### 3. **UX & Acessibilidade**

#### Toggles visíveis:
- **Botões de idioma**: EN / PT (fix no topo direito)
- **Toggle de tema**: Ícone de sol/estrela (discreto)
- **Persistência**: Ambas as escolhas guardadas em localStorage

#### Sem animações exageradas:
- Transição simples de cores
- Sem delays ou efeitos visuais pesados
- Focus states acessíveis para teclado

---

### 4. **Decisões Técnicas**

#### Por que não usar localStorage diretamente no componente?
- **Single Responsibility**: Context cuida de persistência
- **Síncrono com DOM**: ThemeContext aplica atributo no root
- **Evita "flash" de estilo**: Tema carregado antes do render

#### Por que `data-theme` ao invés de classes no body?
- Mais semântico
- Mais fácil de debugar (inspect o root)
- Funciona com CSS modules e CSS-in-JS

---

## Exemplos de Uso

### Componente com tradução:
```tsx
import { useLanguage } from '../hooks/useLanguage';

export function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('appTitle')}</h1>
      <p>{t('analyzeButton')}</p>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
    </div>
  );
}
```

### Componente com tema:
```tsx
import { useTheme } from '../hooks/useTheme';

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {theme === 'neutral' ? 'cross' : 'neutral'}
      </button>
    </div>
  );
}
```

---

## Próximos passos

### Fáceis de implementar:
1. Adicionar mais idiomas (es, it, de)
2. Adicionar mais temas (dark, high-contrast)
3. Traduzir todos os textos da UI

### Mais avançado:
1. Sincronizar preferências com backend
2. Detectar idioma do browser (`navigator.language`)
3. Themes baseados em media queries (`prefers-color-scheme`)

---

## Performance

**Bundle Impact**:
- `en.ts` + `pt.ts`: ~1.5KB
- `LanguageContext` + `useLanguage`: ~1KB
- `ThemeContext` + `useTheme`: ~1KB
- Total i18n + Theme: ~3.5KB

**Runtime**:
- Sem overhead de computação
- Context updates são otimizadas por React
- CSS variables não causam reflow

---

## Manutenção

### Rules:
1. Sempre adicionar chaves em ambos os dicionários (en.ts e pt.ts)
2. Manter nomes de chaves em camelCase
3. Não traduzir nomes de temas, apenas na UI

### Debugging:
```tsx
// No console do browser:
localStorage.getItem('language');  // 'en' ou 'pt'
localStorage.getItem('theme');     // 'neutral' ou 'cross'
document.documentElement.getAttribute('data-theme');  // current theme
```
