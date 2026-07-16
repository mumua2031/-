import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sources = ['patterns', 'patterns-transparent'];
const outputRoot = path.join(root, 'public', 'pattern-thumbs');
const maxEdge = 520;
const quality = 72;

async function listImages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
    .map((entry) => path.join(directory, entry.name));
}

let generated = 0;
let skipped = 0;

await fs.mkdir(outputRoot, { recursive: true });

for (const source of sources) {
  const inputDirectory = path.join(root, 'public', source);
  const outputDirectory = path.join(outputRoot, source);
  await fs.mkdir(outputDirectory, { recursive: true });

  let images = [];
  try {
    images = await listImages(inputDirectory);
  } catch {
    continue;
  }

  for (const inputPath of images) {
    const baseName = path.basename(inputPath).replace(/\.[^.]+$/, '.webp');
    const outputPath = path.join(outputDirectory, baseName);

    try {
      const [inputStats, outputStats] = await Promise.all([
        fs.stat(inputPath),
        fs.stat(outputPath).catch(() => null),
      ]);
      if (outputStats && outputStats.mtimeMs >= inputStats.mtimeMs) {
        skipped += 1;
        continue;
      }

      await sharp(inputPath, { limitInputPixels: false })
        .rotate()
        .resize({
          width: maxEdge,
          height: maxEdge,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 4 })
        .toFile(outputPath);
      generated += 1;
    } catch (error) {
      console.warn(`Skipped ${path.relative(root, inputPath)}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

console.log(`Generated ${generated} pattern thumbnails; skipped ${skipped} up-to-date files.`);
