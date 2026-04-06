/**
 * Verify image URLs for all cards in the database
 * Checks if images are accessible and reports missing ones
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CardFace {
  name: string;
  type: string;
  cost: number | null;
  image: string;
}

interface Card {
  affiliation: string | null;
  attack: number | null;
  color: string;
  colors: string[];
  cost: number | null;
  defense: number | null;
  face: {
    front: CardFace;
    back?: CardFace;
  };
  health: number | null;
  id: string;
  isToken: boolean;
  keywords: string[];
  name: string;
  planet: string | null;
  rarity: string;
  set: string;
  subtype: string | null;
  type: string;
}

interface CardDatabase {
  [cardId: string]: Card;
}

interface ImageCheckResult {
  url: string;
  status: number;
  ok: boolean;
  error?: string;
}

interface CardImageStatus {
  cardId: string;
  cardName: string;
  frontImage: string;
  frontOk: boolean;
  backImage?: string;
  backOk?: boolean;
  hasMissingImages: boolean;
}

// Check a single URL
async function checkImageUrl(url: string): Promise<ImageCheckResult> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return {
      url,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Main verification function
async function verifyImages(): Promise<void> {
  const cardsPath = path.join(__dirname, '..', 'cards', 'alpha-clash-cards.json');
  const outputPath = path.join(__dirname, '..', 'data', 'missing-images.json');

  console.log('Reading card database...');
  const database: CardDatabase = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  const cards = Object.values(database);

  console.log(`Checking images for ${cards.length} cards...\n`);

  // Collect all unique image URLs
  const urlsToCheck = new Set<string>();
  const cardImageMap = new Map<string, CardImageStatus>();

  for (const card of cards) {
    const frontUrl = card.face.front.image;
    urlsToCheck.add(frontUrl);

    const status: CardImageStatus = {
      cardId: card.id,
      cardName: card.name,
      frontImage: frontUrl,
      frontOk: false,
      hasMissingImages: false,
    };

    if (card.face.back) {
      const backUrl = card.face.back.image;
      urlsToCheck.add(backUrl);
      status.backImage = backUrl;
      status.backOk = false;
    }

    cardImageMap.set(card.id, status);
  }

  // Check all URLs with concurrency limit
  const urlArray = Array.from(urlsToCheck);
  const results = new Map<string, ImageCheckResult>();
  const concurrencyLimit = 10;

  console.log(`Checking ${urlArray.length} unique image URLs...`);

  for (let i = 0; i < urlArray.length; i += concurrencyLimit) {
    const batch = urlArray.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map(url => checkImageUrl(url));
    const batchResults = await Promise.all(batchPromises);

    for (const result of batchResults) {
      results.set(result.url, result);
    }

    // Progress update
    const progress = Math.min(i + concurrencyLimit, urlArray.length);
    process.stdout.write(`\rProgress: ${progress}/${urlArray.length} URLs checked`);
  }

  console.log('\n');

  // Update card statuses based on results
  const cardsWithMissingImages: CardImageStatus[] = [];

  for (const status of cardImageMap.values()) {
    const frontResult = results.get(status.frontImage);
    status.frontOk = frontResult?.ok ?? false;

    if (status.backImage) {
      const backResult = results.get(status.backImage);
      status.backOk = backResult?.ok ?? false;
    }

    status.hasMissingImages = !status.frontOk || (status.backImage && !status.backOk);

    if (status.hasMissingImages) {
      cardsWithMissingImages.push(status);
    }
  }

  // Report results
  console.log('=== Image Verification Results ===\n');

  const failedUrls = Array.from(results.values()).filter(r => !r.ok);

  if (failedUrls.length === 0) {
    console.log('✓ All images are accessible!');
  } else {
    console.log(`✗ ${failedUrls.length} images failed:\n`);
    for (const result of failedUrls) {
      console.log(`  ${result.url}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      } else {
        console.log(`    Status: ${result.status}`);
      }
    }
  }

  console.log(`\n=== Cards with Missing Images ===\n`);

  if (cardsWithMissingImages.length === 0) {
    console.log('✓ All cards have valid images!');
  } else {
    console.log(`✗ ${cardsWithMissingImages.length} cards have missing images:\n`);
    for (const status of cardsWithMissingImages) {
      console.log(`  ${status.cardName} (${status.cardId})`);
      if (!status.frontOk) {
        console.log(`    ✗ Front: ${status.frontImage}`);
      }
      if (status.backImage && !status.backOk) {
        console.log(`    ✗ Back: ${status.backImage}`);
      }
    }
  }

  // Save missing images data
  const missingData = {
    timestamp: new Date().toISOString(),
    totalCards: cards.length,
    totalUrlsChecked: urlArray.length,
    failedUrls: failedUrls.map(r => ({
      url: r.url,
      status: r.status,
      error: r.error,
    })),
    cardsWithMissingImages: cardsWithMissingImages.map(s => ({
      cardId: s.cardId,
      cardName: s.cardName,
      missingFront: !s.frontOk,
      missingBack: s.backImage ? !s.backOk : false,
    })),
  };

  fs.writeFileSync(outputPath, JSON.stringify(missingData, null, 2));
  console.log(`\nMissing image data saved to: ${outputPath}`);

  // Exit with error code if there are missing images
  if (cardsWithMissingImages.length > 0) {
    console.log(`\n❌ ERROR: ${cardsWithMissingImages.length} cards have missing images!`);
    process.exit(1);
  }

  console.log('\n✓ Image verification complete!');
  process.exit(0);
}

verifyImages().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
