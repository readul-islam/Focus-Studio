---
name: code-quality
description: Code quality review for Next.js/React/TypeScript projects. Use when reviewing code for best practices, TypeScript types, component structure, performance patterns, or maintainability. Triggers on keywords like code review, refactor, TypeScript, types, clean code, best practices, DRY.
allowed-tools: Read, Grep, Glob, Bash(npm run:*), Bash(git:*)
---

# Code Quality Review

## Overview
Ensure code is maintainable, type-safe, performant, and follows Next.js/React/TypeScript best practices.

## Code Quality Checklist

### TypeScript
- [ ] Strict mode enabled in tsconfig.json
- [ ] No `any` types (use proper typing)
- [ ] Props interfaces defined for all components
- [ ] Return types on functions where helpful
- [ ] Discriminated unions for variants
- [ ] Utility types used appropriately (Partial, Pick, Omit)

### React/Next.js Best Practices
- [ ] Components are focused (single responsibility)
- [ ] Proper use of Server vs Client Components
- [ ] "use client" only where necessary
- [ ] Hooks follow rules (no conditional calls)
- [ ] Keys used properly in lists
- [ ] Event handlers memoized where needed

### File Organization
- [ ] Components in /components with logical grouping
- [ ] Pages in /app following Next.js conventions
- [ ] Utilities in /lib or /utils
- [ ] Types in /types or colocated with components
- [ ] Constants extracted and centralized

### Naming Conventions
- [ ] Components: PascalCase (Button.tsx)
- [ ] Hooks: camelCase with "use" prefix (useAuth.ts)
- [ ] Utilities: camelCase (formatDate.ts)
- [ ] Constants: SCREAMING_SNAKE_CASE
- [ ] CSS classes: kebab-case or Tailwind

### Code Style
- [ ] Consistent formatting (Prettier)
- [ ] ESLint rules followed
- [ ] Imports organized (React, Next, third-party, local)
- [ ] No unused imports/variables
- [ ] Comments explain "why" not "what"

## Performance Patterns

### React Optimization
- [ ] useMemo for expensive calculations
- [ ] useCallback for stable function references
- [ ] React.memo for pure components that re-render often
- [ ] Proper dependency arrays in hooks
- [ ] Avoid inline object/array creation in JSX

### Next.js Optimization
- [ ] next/image for all images
- [ ] next/link for all internal links
- [ ] Dynamic imports for heavy components
- [ ] Proper use of loading.tsx and error.tsx
- [ ] Metadata API for SEO

### Data Fetching
- [ ] Server Components for initial data
- [ ] Proper caching strategies
- [ ] Loading states handled
- [ ] Error boundaries in place
- [ ] Optimistic updates where appropriate

## Common Anti-Patterns to Avoid

### Component Issues
```tsx
// Bad: Inline function in JSX
<button onClick={() => handleClick(id)}>

// Good: Memoized or extracted
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<button onClick={handleButtonClick}>
```

### Type Issues
```tsx
// Bad: Using any
const data: any = fetchData();

// Good: Proper typing
interface UserData { name: string; email: string; }
const data: UserData = fetchData();
```

### State Issues
```tsx
// Bad: Derived state in useState
const [fullName, setFullName] = useState(`${firstName} ${lastName}`);

// Good: Derive during render
const fullName = `${firstName} ${lastName}`;
```

## Project-Specific Standards

### This Codebase Uses
- Next.js 14 App Router
- TypeScript with strict mode
- Tailwind CSS for styling
- Lucide React for icons
- Radix UI for accessible components

### Key Directories
- `/app` - Pages and layouts (App Router)
- `/components` - Reusable components
- `/lib` - Utilities and helpers
- `/public` - Static assets

### Component Structure
```tsx
// Standard component structure
import { dependencies } from 'package'
import { LocalComponent } from '@/components/...'
import { cn } from '@/lib/utils'

interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks first
  // Derived values
  // Event handlers
  // Return JSX
}
```

## Instructions

1. **Initial Review**
   - Check TypeScript configuration
   - Review folder structure
   - Identify patterns used
   - Note any inconsistencies

2. **Component Review**
   - Check prop typing
   - Verify hook usage
   - Look for performance issues
   - Check for code duplication

3. **Refactoring Priorities**
   - Fix type errors first
   - Address performance issues
   - Reduce duplication
   - Improve organization

4. **Documentation**
   - Document complex logic
   - Add JSDoc for public APIs
   - Update README if needed

## Testing Standards
- [ ] Unit tests for utilities
- [ ] Component tests for interactive elements
- [ ] Integration tests for critical flows
- [ ] Snapshot tests used sparingly
- [ ] Tests are maintainable and readable
