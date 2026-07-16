const staticPatternImagePattern = /^\/(patterns|patterns-transparent)\/([^/?#]+)\.(png|jpe?g|webp)$/i;

export function getPatternThumbnailUrl(imageUrl?: string) {
  if (!imageUrl) return '';
  const match = imageUrl.match(staticPatternImagePattern);
  if (!match) return imageUrl;
  const [, directory, filename] = match;
  return `/pattern-thumbs/${directory}/${filename}.webp`;
}
