import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import type { PixelDiff } from './types';

export function diffImages(base64A: string, base64B: string): PixelDiff {
  const bufA = Buffer.from(base64A.replace(/^data:image\/png;base64,/, ''), 'base64');
  const bufB = Buffer.from(base64B.replace(/^data:image\/png;base64,/, ''), 'base64');

  const imgA = PNG.sync.read(bufA);
  const imgB = PNG.sync.read(bufB);

  const width  = Math.max(imgA.width,  imgB.width);
  const height = Math.max(imgA.height, imgB.height);

  const normA = new PNG({ width, height });
  const normB = new PNG({ width, height });
  const diff  = new PNG({ width, height });

  PNG.bitblt(imgA, normA, 0, 0, imgA.width, imgA.height, 0, 0);
  PNG.bitblt(imgB, normB, 0, 0, imgB.width, imgB.height, 0, 0);

  const mismatch = pixelmatch(
    normA.data, normB.data, diff.data,
    width, height,
    { threshold: 0.1, includeAA: false, diffColor: [255, 50, 50] }
  );

  const diffPercentage = ((mismatch / (width * height)) * 100).toFixed(2);
  const diffBase64 = `data:image/png;base64,${PNG.sync.write(diff).toString('base64')}`;

  return { diffPercentage, diffBase64 };
}
