import { Image } from '..';

import { computeRmse } from './computeRmse';

/**
 * Compute the Peak signal-to-noise ratio (PSNR) between two images.
 * The larger the PSNR, the more similar the images.
 * https://en.wikipedia.org/wiki/Peak_signal-to-noise_ratio
 *
 * @param image - First image.
 * @param otherImage - Second image.
 * @returns PSNR of the two images in decibels.
 */
export function computePsnr(image: Image, otherImage: Image): number {
  const rmsePixel = computeRmse(image, otherImage);

  return 20 * Math.log10(image.maxValue / (rmsePixel + Number.MIN_VALUE));
}
