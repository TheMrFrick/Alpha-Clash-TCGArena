/**
 * Backface data for Alpha Clash cards
 * These are manually maintained since the source data doesn't include backface info
 */

export interface CardFace {
  name: string;
  type: string;
  cost: number | null;
  image: string;
}

export const backfaceData: Record<string, CardFace> = {
  "AC2-T01": {
    name: "The Portal Closed",
    type: "Token",
    cost: null,
    image: "https://multi-deckplanet.us-southeast-1.linodeobjects.com/alpha_clash/AC2-T01_b.webp"
  },
  "AC4-002": {
    name: "Shadowlight, Bright Beacon",
    type: "Contender",
    cost: null,
    image: "https://multi-deckplanet.us-southeast-1.linodeobjects.com/alpha_clash/AC4-060.webp"
  },
  "AC4-060": {
    name: "Shadowlight, Dark Absence",
    type: "Contender",
    cost: null,
    image: "https://multi-deckplanet.us-southeast-1.linodeobjects.com/alpha_clash/AC4-002.webp"
  },
  "AC5-001": {
    name: "Clarity, Defender of All",
    type: "Contender",
    cost: null,
    image: "https://multi-deckplanet.us-southeast-1.linodeobjects.com/alpha_clash/AC5-061.webp"
  },
  "AC5-061": {
    name: "Clarity, Deadly Duelist",
    type: "Contender",
    cost: null,
    image: "https://multi-deckplanet.us-southeast-1.linodeobjects.com/alpha_clash/AC5-001.webp"
  }
};
