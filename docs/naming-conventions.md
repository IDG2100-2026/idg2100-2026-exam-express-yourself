# Naming Conventions

**Some of us use Linux for development, and Linux is completely case-sensitive when it comes to file and folder names. That means if a folder is named `Avatar` but an import in the code looks for `avatar`, the server crashes and will not run. Windows and Mac hide this problem but Linux does not. Follow these conventions to support Linux users.**

---

## Naming Styles Used in This Guide

**PascalCase** - every word starts with a capital letter, no separators
`UserProfile`, `Avatar`, `MatchQueue`

**camelCase** - first word lowercase, every word after starts with a capital, no separators
`useAuth`, `handleSubmit`, `isLoading`

**kebab-case** - all lowercase, words separated by hyphens
`about-game`, `matches-service`, `main.scss`

**UPPER_SNAKE_CASE** - all uppercase, words separated by underscores
`MAX_PLAYERS`, `VITE_BACKEND_PORT`

**BEM** - stands for Block, Element, Modifier. All lowercase. Double underscore separates block from element, double hyphen separates element from modifier
`.game`, `.game__player`, `.game__player--active`

---

## The Conventions

### 1. Folders - kebab-case

All folders in the project use kebab-case, no exceptions.

`components/avatar/`, `pages/about-game/`, `hooks/`, `services/`

**Why:** Folder names show up in file paths, terminal commands, and import statements. kebab-case is the only style guaranteed to work the same way on Windows, Mac, and Linux. It also matches how URLs look.

---

### 2. React component files - PascalCase .jsx

Every file that contains a React component is named in PascalCase with a `.jsx` extension. The filename must exactly match the component name inside the file.

`Avatar.jsx`, `AppearanceMenu.jsx`, `MainLayout.jsx`

**Why:** React has a hard rule that component names must start with a capital letter so React can tell them apart from plain HTML tags like `<div>` or `<span>`. The filename matching the component name means you can always find the file immediately.

---

### 3. SCSS files for components - kebab-case .scss

The stylesheet that belongs to a component uses kebab-case, even though the component file next to it is PascalCase.

```
avatar/
  Avatar.jsx
  avatar.scss
```

**Why:** A stylesheet is not a component. It has no exports and is not a class in the programming sense. CSS has always been a lowercase language. Only the `.jsx` file earns PascalCase because it is the actual component.

---

### 4. Global and shared SCSS files - kebab-case, partials with underscore prefix

`main.scss`, `global.scss`, `_variables.scss`, `_mixins.scss`

**Why:** Same reason as above, CSS convention is always lowercase. The underscore prefix on a file like `_variables.scss` means "do not compile this file on its own, only use it when another file imports it." Every SCSS tool understands this.

---

### 5. Custom hook files - camelCase .js, always starts with "use"

`useAuth.js`, `useMatch.js`, `useComments.js`

**Why:** React has a hard rule that hooks must start with the word `use`. The linter uses this to detect when you are breaking the rules of hooks. The filename matches the exported function name exactly.

---

### 6. Service, utility, and context files - kebab-case .js

`matches-service.js`, `auth-context.js`, `token-manager.js`, `date-utils.js`

**Why:** These files export regular functions, not classes or components. PascalCase is reserved to signal "this is a class or a component." kebab-case here makes it immediately clear what kind of file it is before you open it.

---

### 7. JavaScript class files - PascalCase .js

`MatchQueue.js`, `EventEmitter.js`, `RateLimiter.js`

**Why:** JavaScript classes are always written in PascalCase, that is the language convention. The filename should always match what is inside it. A PascalCase `.js` file signals to the team that this file exports a class.

---

### 8. Mongoose model files - PascalCase singular .js

`User.js`, `Match.js`, `Tournament.js`, `Comment.js`

**Why PascalCase:** Mongoose models are classes under the hood. When you call `mongoose.model('User', userSchema)` you get back a class, so the file follows the same rule as point 7.

**Why singular:** The model represents one single thing, one User, one Match. Mongoose automatically makes the database collection plural (`User` model creates a `users` collection in MongoDB), so you never need to signal plural in the filename.

---

### 9. CSS class names - BEM, all lowercase

```css
.lobby {}
.lobby__card {}
.lobby__card--active {}
```

**Why:** CSS has always been lowercase. BEM gives every class a predictable structure so anyone reading the HTML or CSS immediately knows what block it belongs to, what element it is, and what state it is in.

**Multiple words within a name:** When a block, element, or modifier name has more than one word, separate them with a single hyphen. Never use camelCase in CSS.

```css
/* multi-word element */
.lobby__card-title {}
.lobby__card-player-name {}

/* multi-word modifier */
.lobby__card--is-active {}
.lobby__card--dark-theme {}
```

The separators in BEM each have a specific job and must not be mixed up:

| Separator | Meaning | Example |
|---|---|---|
| single hyphen `-` | separates words within a name | `card-title`, `player-name` |
| double underscore `__` | marks an element inside a block | `lobby__card-title` |
| double hyphen `--` | marks a modifier (a variation or state) | `lobby__card--is-active` |

---

### 10. JavaScript variables and functions - camelCase

`const isLoading`, `function handleSubmit()`, `const fetchUser`

**Why:** This is the JavaScript language standard. Every JS library, every framework, every tutorial uses camelCase for variables and functions.

---

### 11. JavaScript constants - UPPER_SNAKE_CASE

`const MAX_PLAYERS = 5`, `const DEFAULT_ELO = 1000`

**Why:** ALL_CAPS makes constants stand out from regular variables. When you see an ALL_CAPS name you immediately know this value never changes.

---

### 12. Environment variables inside .env - UPPER_SNAKE_CASE

`VITE_BACKEND_PORT=3000`, `DB_HOSTNAME=localhost`, `APP_SALT=secret`

**Why:** Unix and every shell environment has always used ALL_CAPS for environment variables. Every CI system, every deployment platform, every tool that reads `.env` files expects this. Vite also requires the `VITE_` prefix on any variable you want available in frontend code.

---

### 13. Config and dotfiles - exactly what the tool requires

`.env`, `.gitignore`, `vite.config.js`, `package.json`

**Why:** You do not get to name these. Git looks for exactly `.gitignore`. Vite looks for exactly `vite.config.js`. Node looks for exactly `package.json`. If you rename them they will not be found. The all-lowercase style comes from Unix where system and config files have always been lowercase.

---

## Quick Reference

| What | Style | Example |
|---|---|---|
| Folder | kebab-case | `about-game/` |
| React component file | PascalCase | `Avatar.jsx` |
| Component SCSS file | kebab-case | `avatar.scss` |
| Global SCSS file | kebab-case | `main.scss` |
| SCSS partial | underscore + kebab-case | `_variables.scss` |
| Custom hook file | camelCase | `useAuth.js` |
| Service / util / context file | kebab-case | `matches-service.js` |
| JavaScript class file | PascalCase | `MatchQueue.js` |
| Mongoose model file | PascalCase singular | `User.js` |
| CSS class name | BEM lowercase | `.lobby__card--active` |
| Multi-word CSS name | single hyphen within name | `.lobby__card-title` |
| JS variable / function | camelCase | `handleSubmit` |
| JS constant | UPPER_SNAKE_CASE | `MAX_PLAYERS` |
| Env variable | UPPER_SNAKE_CASE | `VITE_BACKEND_PORT` |
| Config / dotfile | tool decides | `.env`, `.gitignore` |
