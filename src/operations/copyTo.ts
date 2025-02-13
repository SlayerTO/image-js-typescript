import { Image, Mask, Point } from '..';
import { getOutputImage, maskToOutputMask } from '../utils/getOutputImage';
import { setBlendedPixel } from '../utils/setBlendedPixel';

export interface CopyToOptions<OutType> {
  /**
   * Origin for the crop relative to the top-left corner of the image.
   *
   * @default {row: 0, column: 0}
   */
  origin?: Point;
  /**
   * Image to which to output.
   */
  out?: OutType;
}

export function copyTo(
  source: Image,
  target: Image,
  options?: CopyToOptions<Image>,
): Image;
export function copyTo(
  source: Mask,
  target: Mask,
  options?: CopyToOptions<Mask>,
): Mask;
/**
 * Copy the image to another one by specifying the location in the target image.
 *
 * @param source - The source image.
 * @param target - The target image.
 * @param options - copyTo options.
 * @returns The target with the source copied to it.
 */
export function copyTo(
  source: Image | Mask,
  target: Image | Mask,
  options: CopyToOptions<Image | Mask> = {},
): Image | Mask {
  const { origin = { column: 0, row: 0 } } = options;
  const { column, row } = origin;

  if (source.colorModel !== target.colorModel) {
    throw new Error(
      'copyTo: source and target must have the same color model.',
    );
  }

  let result: Image | Mask;
  if (target instanceof Image) {
    result = getOutputImage(target, options, { clone: true });
  } else {
    result = maskToOutputMask(target, options, { clone: true });
  }

  for (
    let currentRow = Math.max(row, 0);
    currentRow < Math.min(source.height + row, target.height);
    currentRow++
  ) {
    for (
      let currentColumn = Math.max(column, 0);
      currentColumn < Math.min(source.width + column, target.width);
      currentColumn++
    ) {
      let sourcePixel = source.getPixel(
        currentColumn - column,
        currentRow - row,
      );
      setBlendedPixel(result, currentColumn, currentRow, {
        color: sourcePixel,
      });
    }
  }

  return result;
}
