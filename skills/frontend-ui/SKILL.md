---
name: frontend-ui
description: Design principles and guidelines for building responsive, accessible React frontends using Vite, TypeScript, TanStack Query, React Hook Form, and Recharts.
---

# Frontend UI Skill

## Purpose
This skill establishes guidelines for React applications, emphasizing component organization, state management, form validation, accessible charts and tables, and responsive mobile-first styling.

## Trigger Conditions
Use this skill when:
- Creating or editing React components, pages, or routes.
- Designing API client connectors or hook queries.
- Designing forms, validation layers (Zod), and user feedback states (loading, empty, error).
- Implementing visual dashboards, tables, or data charts.

## Required Workflow
1. **Component Design**: Organize code into pages, layout components, and reusable UI components.
2. **Server State**: Use TanStack Query (`@tanstack/react-query`) for all network requests. Do not fetch data inside `useEffect` hooks directly.
3. **Form Handling**: Use React Hook Form with Zod schemas (`@hookform/validators/zod`) for user input, displaying errors immediately.
4. **Visual Layouts**:
   - Apply responsive CSS (Flexbox, Grid, Media Queries) to make pages look premium on desktop, tablet, and mobile.
   - Use CSS variables/tokens for colors, padding, and spacing.
5. **Charts (Recharts/Chart.js)**: Map aggregated backend reports into chart formats. Provide clear legends, tooltips, and an accessible screen-reader-friendly data table fallback.
6. **Accessibility (a11y)**: Ensure components have correct semantic HTML (`<main>`, `<section>`, `<nav>`), input fields have associated `<label>` tags, and focus states are visible.

## Non-Negotiable Rules
- **No Null Zeroes**: Do not display a score of `null` as `0`. If a score is missing, represent it explicitly as empty or `N/A`.
- **Keyboard Navigation**: Forms must support keyboard submission (e.g. hitting Enter triggers submit).
- **Interactive Feedback**: Loading indicators must display when queries are pending, and errors must be shown visually.
- **Double-Submit Prevention**: Disable the submit button when an API request is already in progress.

## Expected Outputs
- Reusable pages (`Search`, `Dashboard/Charts`, `Rankings`).
- API hooks for fetching data.
- Accessible form layouts and responsive grids.
- Score distribution charts with accessible fallback tables.

## Acceptance Checklist
- [ ] UI components are fully typed with TypeScript.
- [ ] Forms utilize React Hook Form and Zod validation.
- [ ] TanStack Query handles caching, refetching, and state management.
- [ ] Score values show "N/A" or empty spaces instead of "0" when null.
- [ ] Page renders correctly on mobile, tablet, and desktop dimensions.

## Relevant Examples

### Form Handling Example
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  registrationNumber: z.string()
    .min(1, 'Registration number is required')
    .regex(/^\d+$/, 'Registration number must contain only numbers'),
});

type FormValues = z.infer<typeof schema>;

export const SearchForm = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <label htmlFor="regNumInput">Registration Number</label>
        <input id="regNumInput" {...register('registrationNumber')} />
        {errors.registrationNumber && <span>{errors.registrationNumber.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>Search</button>
    </form>
  );
};
```
