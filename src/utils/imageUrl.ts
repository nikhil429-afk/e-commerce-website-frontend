import BASE_URL from "./baseapi";

/**
 * Address of a product photo.
 * Uploaded photos are served through the API's /thumb endpoint as small cached WebP files
 * (a 4 MB photo becomes ~30 KB), so the product pages load quickly. Anything that is not an
 * upload (external URLs) is returned unchanged.
 *
 *   imageSrc(product.images[0], 480)   // product card
 *   imageSrc(product.images[0], 1080)  // large pop-up photo
 */
export function imageSrc(path: string | null | undefined, width = 480): string {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("/uploads/")) {
    const name = path.slice("/uploads/".length);
    if (/^[\w.-]+$/.test(name)) return `${BASE_URL}/thumb/${name}?w=${width}`;
  }
  return `${BASE_URL}${path}`;
}
