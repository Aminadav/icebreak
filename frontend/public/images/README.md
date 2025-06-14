# Images Directory Structure

## Organization
- **icons/** - UI icons, menu icons, and small graphics
- **avatars/** - User profile pictures and character avatars
- **backgrounds/** - Background images for pages and components
- **logos/** - App logos and branding materials
- **game-assets/** - Game-specific images like cards, tokens, etc.

## Usage
To use images in components, reference them from the public directory:

```tsx
// Example: Using an icon
<img src="/images/icons/game-icon.png" alt="Game Icon" />

// Example: Using as background
<div style={{ backgroundImage: 'url(/images/backgrounds/menu-bg.jpg)' }}>
```

## File Naming Convention
- Use kebab-case: `menu-background.jpg`
- Include size if multiple versions: `logo-small.png`, `logo-large.png`
- Use descriptive names: `user-avatar-placeholder.png`
