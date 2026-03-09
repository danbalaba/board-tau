# Tailwind CSS 4 Upgrade - Safe and Tested

## Project Context
This plan upgrades BoardTAU project from Tailwind CSS 3 to Tailwind CSS 4. The goal is to ensure a safe, tested upgrade that preserves all existing functionality while preparing for the ShadCN dashboard template integration.

## Current State Analysis

**Current Configuration:**
- Tailwind CSS: v3.4.1
- PostCSS: v8.5.6
- Autoprefixer: v10.4.24
- darkMode: class
- Custom colors, shadows, animations, and other utilities defined in tailwind.config.js
- CSS @layer components and custom styles in app/globals.css

**ShadCN Template Configuration:**
- Tailwind CSS: v4.0.0
- PostCSS: v8.4.49
- Uses @tailwindcss/postcss plugin instead of autoprefixer
- CSS custom properties (cssVariables: true in components.json)
- New York style ShadCN UI components
- Multiple theme support (Claude, Neobrutualism, Supabase, Vercel, Mono, Notebook)

## Upgrade Plan

### Phase 1: Pre-Upgrade Preparation

1. **Create backup branch**
2. **Commit existing changes** - Ensure working tree is clean
3. **Verify current state** - Run npm run build to ensure no errors
4. **Create test checklist** - List all pages and features to verify

### Phase 2: Dependency Upgrade

**Update package.json:**
```json
{
  "dependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  },
  "devDependencies": {
    "postcss": "^8.4.49"
  }
}
```

**Remove old dependencies:**
- Remove autoprefixer (Tailwind CSS 4 includes autoprefixer)
- Remove old Tailwind CSS 3 dependencies

### Phase 3: Configuration Update

**1. Update postcss.config.js:**
```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
```

**2. Create components.json:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**3. Update app/globals.css:**
- Change from @tailwind base; @tailwind components; @tailwind utilities; to @import 'tailwindcss';
- Add @custom-variant dark (&:is(.dark *));
- Ensure all custom styles are compatible with Tailwind CSS 4 syntax
- Verify CSS variable usage

**4. Update tailwind.config.js:**
- Maintain existing custom colors, shadows, animations, etc.
- Ensure compatibility with Tailwind CSS 4 configuration syntax

### Phase 4: Verification & Testing

1. **Basic functionality test** - Start dev server and check for errors
2. **Page-by-page verification** - Test all existing features
3. **Responsive design test** - Check on different device sizes
4. **Dark/light mode test** - Verify theme switching
5. **Performance test** - Check build times and bundle size
6. **Regression test** - Compare before and after styling

### Phase 5: Fixing Issues

1. **Identify and fix breaking changes** - Address any styling inconsistencies
2. **Update utility classes** - Replace deprecated Tailwind 3 classes with Tailwind 4 equivalents
3. **Test and verify fixes** - Ensure all changes work correctly
4. **Documentation** - Document all changes made

## Expected Results

- Project builds successfully with no errors
- All existing features remain functional
- No significant styling regressions
- Project ready for ShadCN dashboard integration

## Deliverables

- Updated package.json with Tailwind 4 dependencies
- New postcss.config.js and components.json
- Updated app/globals.css
- Verified functionality across all pages
- Documentation of changes and fixes

## Post-Upgrade Next Steps

1. **Template integration** - Proceed with ShadCN dashboard integration (separate prompt)
2. **Continuous monitoring** - Keep track of any new issues
3. **Documentation updates** - Update project documentation
