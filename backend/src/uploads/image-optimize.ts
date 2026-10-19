import sharp from 'sharp';

/** Longest edge for web delivery (hero / gallery / dishes). */
const MAX_EDGE = 1920;
const JPEG_QUALITY = 80;

export type OptimizedImage = {
  buffer: Buffer;
  contentType: string;
  ext: '.jpg' | '.png' | '.webp' | '.gif';
};

/**
 * Downscale and recompress for the public site.
 * GIFs are left alone (may be animated). Everything else becomes JPEG.
 */
export async function optimizeImageForWeb(
  input: Buffer,
  mimetype: string,
): Promise<OptimizedImage> {
  if (mimetype === 'image/gif') {
    return { buffer: input, contentType: 'image/gif', ext: '.gif' };
  }

  const pipeline = sharp(input, { failOn: 'none', animated: false }).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  let img = pipeline;
  if (width > MAX_EDGE || height > MAX_EDGE) {
    img = img.resize({
      width: width >= height ? MAX_EDGE : undefined,
      height: height > width ? MAX_EDGE : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const buffer = await img
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toBuffer();

  return { buffer, contentType: 'image/jpeg', ext: '.jpg' };
}
