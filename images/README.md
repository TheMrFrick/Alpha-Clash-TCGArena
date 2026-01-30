# Images Directory

This directory contains all image assets for Alpha Clash TCG.

## Directory Structure

```
images/
├── cards/           # Card images
├── tokens/          # Token images
├── backgrounds/     # Background images
├── card-back.png    # Default card back
├── contender-back.png  # Contender card back
├── portal-back.png  # Portal card back
├── logo.png         # Game logo
├── favicon.png      # Browser favicon
├── loading.png      # Loading screen image
├── victory.png      # Victory splash
└── defeat.png       # Defeat splash
```

## Card Images

Place card images in the `cards/` subdirectory.

### Naming Convention

Card images should match the `img_link` field in the card database:

- Example: `creature-fire-imp.webp`
- Use lowercase with hyphens
- Include card type prefix for organization

### Recommended Format

- **Format**: WebP (preferred) or PNG
- **Resolution**: 375 x 525 pixels (standard card ratio)
- **File Size**: Keep under 100KB for fast loading

### Batch Processing

If you have many images to convert:

```bash
# Convert PNG to WebP (requires cwebp)
for file in *.png; do
    cwebp -q 85 "$file" -o "${file%.png}.webp"
done
```

## Required Images

### Card Backs (Required)

| File | Description | Recommended Size |
|------|-------------|------------------|
| `card-back.png` | Default card back | 375 x 525 px |
| `contender-back.png` | Contender card back | 375 x 525 px |
| `portal-back.png` | Portal card back | 375 x 525 px |

### Logo (Required)

| File | Description | Recommended Size |
|------|-------------|------------------|
| `logo.png` | Game logo | 400 x 200 px |
| `favicon.png` | Browser favicon | 32 x 32 px |

### Splash Screens (Optional)

| File | Description | Recommended Size |
|------|-------------|------------------|
| `loading.png` | Loading screen | 800 x 600 px |
| `victory.png` | Victory splash | 800 x 600 px |
| `defeat.png` | Defeat splash | 800 x 600 px |

## Token Images

Place in `tokens/` subdirectory:

| File | Description |
|------|-------------|
| `damage.png` | Damage counter |
| `boost.png` | Boost counter |
| `shield.png` | Shield counter |
| `stun.png` | Stun status |
| `freeze.png` | Freeze status |

Recommended size: 64 x 64 px (square with transparent background)

## Background Images

Place in `backgrounds/` subdirectory:

| File | Description |
|------|-------------|
| `arena-bg.jpg` | Main game background |

Recommended: 1920 x 1080 px minimum for full-screen support.

## Placeholder Files

If images are not available, create placeholder files to prevent 404 errors:

```bash
# Create a 1x1 transparent PNG placeholder
convert -size 1x1 xc:transparent placeholder.png
```

Or use a solid color placeholder with text indicating what image is needed.
