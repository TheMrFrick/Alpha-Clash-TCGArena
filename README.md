# Alpha Clash TCG - TCGArena Implementation

A full-featured digital implementation of Alpha Clash Trading Card Game for the TCGArena platform.

## Overview

Alpha Clash is a strategic trading card game where players battle using their Contenders and an army of creatures, spells, artifacts, and traps. This implementation provides a complete online playing experience with support for 2-player matches and spectator mode.

## Features

- **Complete Game Board**: All 9 game zones (Deck, Hand, Contender, Portal, Clashground, Clash Zone, Artifact/Trap Zone, Resources, Discard)
- **Turn Phase System**: Full turn structure with Start, Untap, Draw, Resource, Main, Clash, Main 2, and End phases
- **Resource System**: Any card can be played face-down as a resource
- **Life Tracking**: Contender-based life tracking with animated damage/heal effects
- **Token System**: Draggable damage, boost, shield, and status tokens
- **Mulligan Support**: Partial mulligan system (choose cards to redraw)
- **Card Zoom**: Hover or click to view enlarged card details
- **Context Menus**: Right-click cards for quick actions
- **Drag & Drop**: Intuitive card movement between zones
- **Keyboard Shortcuts**: Quick actions with keyboard
- **Sound Effects**: Immersive audio feedback
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
alpha-clash-tcg/
├── index.html              # Main HTML entry point
├── game.json               # TCGArena configuration
├── cards/
│   └── alpha-clash-cards.json  # Card database
├── images/
│   ├── cards/              # Card images (.webp/.png)
│   ├── tokens/             # Token images
│   ├── backgrounds/        # Background images
│   ├── card-back.png       # Default card back
│   ├── contender-back.png  # Contender card back
│   ├── portal-back.png     # Portal card back
│   └── logo.png            # Game logo
├── css/
│   └── custom-styles.css   # Custom styling
├── js/
│   └── custom-scripts.js   # Custom game logic (vanilla JS fallback)
├── src/                    # TypeScript source
│   ├── types/              # Type definitions
│   ├── managers/           # Game logic managers
│   ├── utils/              # Utility functions
│   └── __tests__/          # Unit tests
├── package.json            # NPM dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### TypeScript Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build TypeScript**
   ```bash
   npm run build
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Development Mode**
   ```bash
   npm run build:watch  # Watch for changes
   npm run dev          # Build and serve
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run build:watch` | Watch mode for TypeScript |
| `npm run dev` | Build and start development server |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check without emitting |
| `npm run clean` | Remove build artifacts |

### Project Architecture

The TypeScript source is organized into:

- **types/**: Type definitions for cards, game state, tokens
- **managers/**: Core game logic (TokenManager, LifeManager, TurnManager)
- **utils/**: Helper functions (throttle, debounce, shuffle, etc.)
- **__tests__/**: Jest unit tests for all modules

## Quick Start

### Prerequisites

- A web server (or GitHub Pages)
- TCGArena platform integration (optional)
- Card images from Deckplanet

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/alpha-clash-tcg.git
   cd alpha-clash-tcg
   ```

2. **Add Card Images**
   - Place card images in `images/cards/`
   - Images should match the `img_link` field in card data
   - Supported formats: `.webp` (preferred), `.png`, `.jpg`

3. **Import Card Data**
   - Export card data from Deckplanet
   - Place in `cards/alpha-clash-cards.json`
   - Ensure format matches the schema (see below)

4. **Deploy**
   ```bash
   # For GitHub Pages, push to main branch
   git push origin main

   # Or use any static file server
   npx serve .
   ```

## Card Data Format

Cards in `alpha-clash-cards.json` should follow this structure:

```json
{
  "card-unique-id": {
    "id": "card-unique-id",
    "name": "Card Name",
    "type": "Creature|Contender|Artifact|Trap|Spell|Quick-Spell|Portal",
    "cost": 3,
    "attack": 4,
    "defense": 3,
    "img_link": "card-filename.webp",
    "text": "Card ability text goes here.",
    "rarity": "Common|Uncommon|Rare|Ultra Rare",
    "set": "Core Set",
    "element": "Fire|Ice|Dark|Nature|Storm|Earth|Air|Neutral",
    "keywords": ["Flying", "Taunt"],
    "isHorizontal": false,
    "face": {
      "front": {
        "name": "Card Name",
        "type": "Type",
        "image": "images/cards/card-filename.webp"
      }
    }
  }
}
```

### Card Types

| Type | Description |
|------|-------------|
| Contender | Your main character (1 required per deck) |
| Creature | Units that battle on the Clashground |
| Spell | One-time effects played during your Main Phase |
| Quick-Spell | Instant-speed spells (can respond to opponent) |
| Artifact | Permanent items with ongoing effects |
| Trap | Hidden cards that trigger on conditions |
| Portal | Special location card (optional, max 1) |

## Game Zones

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                    OPPONENT AREA                        │
│  ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────┐  │
│  │Portal│ │Contender │ │Artifact│ │Resource│ │ Deck │  │
│  └──────┘ └──────────┘ │  Zone  │ │  Zone  │ ├──────┤  │
│                        └────────┘ └────────┘ │Discard│ │
│  ┌─────────────────────────────────────────┐ └──────┘  │
│  │            CLASHGROUND                   │          │
│  └─────────────────────────────────────────┘          │
│                     HAND                               │
├─────────────────────────────────────────────────────────┤
│             ═══════ CLASH ZONE ═══════                 │
├─────────────────────────────────────────────────────────┤
│                    YOUR AREA                           │
│                     HAND                               │
│  ┌─────────────────────────────────────────┐          │
│  │            CLASHGROUND                   │          │
│  └─────────────────────────────────────────┘          │
│  ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────┐  │
│  │Portal│ │Contender │ │Artifact│ │Resource│ │ Deck │  │
│  └──────┘ └──────────┘ │  Zone  │ │  Zone  │ ├──────┤  │
│                        └────────┘ └────────┘ │Discard│ │
│                                              └──────┘  │
└─────────────────────────────────────────────────────────┘
```

### Zone Descriptions

- **Deck**: Draw pile (face-down, shuffled)
- **Hand**: Cards you can play
- **Contender**: Your main character (tracks life)
- **Portal**: Special location card
- **Clashground**: Where creatures battle
- **Clash Zone**: Active combat area
- **Artifact/Trap Zone**: Permanents and set traps
- **Resources**: Face-down cards providing resources
- **Discard**: Graveyard for used/destroyed cards

## Turn Phases

1. **Start Phase**: Beginning of turn effects trigger
2. **Untap Phase**: All your tapped cards untap
3. **Draw Phase**: Draw 1 card (skipped on first turn)
4. **Resource Phase**: Play 1 card face-down as resource
5. **Main Phase**: Play cards and activate abilities
6. **Clash Phase**: Declare attackers and resolve combat
7. **Main Phase 2**: Additional plays and abilities
8. **End Phase**: End of turn effects, pass to opponent

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `T` | Tap/Untap selected card |
| `F` | Flip card face down/up |
| `V` | View card details |
| `Space` | Next phase |
| `E` | End turn |
| `Esc` | Cancel/close overlays |

## Context Menu Actions

Right-click any card to access:
- Tap/Untap
- Flip Face Down/Up
- View Card
- Move to Clashground
- Move to Clash Zone
- Play as Resource
- Send to Discard
- Return to Hand
- Put on Top/Bottom of Deck
- Add/Remove Tokens

## Customization

### Theming

Edit CSS variables in `css/custom-styles.css`:

```css
:root {
    --ac-primary: #FF6B35;      /* Primary orange */
    --ac-secondary: #004E89;    /* Secondary blue */
    --ac-accent: #FFD700;       /* Gold accent */
    --ac-background: #0A0E27;   /* Dark background */
}
```

### Adding New Cards

1. Add card image to `images/cards/`
2. Add card entry to `cards/alpha-clash-cards.json`
3. Ensure `img_link` matches the filename

### Adding Custom Tokens

Edit `game.json`:

```json
"draggableTokens": [
  {
    "id": "custom-token",
    "name": "Custom Token",
    "image": "images/tokens/custom.png",
    "color": "#FF00FF",
    "stackable": true,
    "value": 1
  }
]
```

## TCGArena Integration

This implementation is designed to work with the TCGArena platform. The `game.json` file provides all necessary configuration for:

- Multiplayer matchmaking
- Spectator mode
- Replay system
- Turn timers
- Chat and emotes

### JavaScript API

Access the game API via `window.AlphaClash`:

```javascript
// Set player life
AlphaClash.setLife('self', 15);

// Change life by amount
AlphaClash.changeLife('opponent', -3);

// Set turn/phase
AlphaClash.setTurn(5);
AlphaClash.setPhase('clash');

// Add token to card
AlphaClash.addToken(cardElement, 'damage-counter');

// Play sounds
AlphaClash.playSound('card-play');

// Toggle sound
AlphaClash.toggleSound();

// Enable debug mode
AlphaClash.enableDebug();
```

## Deployment

### GitHub Pages

1. Go to repository Settings > Pages
2. Select source branch (usually `main`)
3. Site will be available at `https://username.github.io/alpha-clash-tcg/`

### Custom Domain

1. Add `CNAME` file with your domain
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

### Self-Hosted

Any static file server will work:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## Win Conditions

1. **Contender Defeat**: Reduce opponent's Contender life to 0
2. **Deck Out**: Opponent cannot draw from empty deck
3. **Concession**: Opponent concedes the game

## Deck Building Rules

- **Deck Size**: 40-60 cards
- **Contender**: Exactly 1 required
- **Portal**: Optional, maximum 1
- **Card Copies**: Maximum 4 of any card (except Contender/Portal)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### Cards not displaying

- Check `img_link` field matches actual filename
- Verify images are in `images/cards/` directory
- Check browser console for 404 errors

### Drag and drop not working

- Ensure JavaScript is enabled
- Check for console errors
- Try refreshing the page

### Sounds not playing

- Click anywhere on the page first (browsers require user interaction)
- Check if sounds are muted in game settings
- Verify sound files exist in `sounds/` directory

## License

This project is for personal/educational use with the Alpha Clash TCG.

## Credits

- Alpha Clash TCG - Original game design
- TCGArena - Platform integration
- Deckplanet - Card data source

## Support

For issues or questions:
- Open a GitHub issue
- Visit the Alpha Clash community

---

**Version**: 1.0.0
**Last Updated**: 2024
