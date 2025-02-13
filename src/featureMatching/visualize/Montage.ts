import { Image, ImageColorModel } from '../../Image';
import { Point } from '../../geometry';
import { FastKeypoint } from '../keypoints/getFastKeypoints';
import { Match } from '../matching/bruteForceMatch';

import { drawKeypoints, DrawKeypointsOptions } from './drawKeypoints';
import { drawMatches, DrawMatchesOptions } from './drawMatches';
import { scaleKeypoints } from './scaleKeypoints';

export enum MontageDisposition {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}
export interface MontageOptions {
  /**
   * Factor by which to scale the images.
   *
   * @default 1
   */
  scale?: number;
  /**
   * How should the images be aligned: vertically or horizontally.
   *
   * @default MontageDispositions.HORIZONTAL
   */
  disposition?: MontageDisposition;
}

export class Montage {
  /**
   * Scaled width of the first image.
   */
  public readonly sourceWidth: number;
  /**
   * Scaled height of the first image.
   */
  public readonly sourceHeight: number;
  /**
   * Scaled width of the second image.
   */
  public readonly destinationWidth: number;
  /**
   * Scaled height of the second image.
   */
  public readonly destinationHeight: number;
  /**
   * Origin of the destination / second image relative to top-left corner of the Montage.
   */
  public readonly destinationOrigin: Point;
  /**
   * Width of the Montage.
   */
  public readonly width: number;
  /**
   * Height of the Montage.
   */
  public readonly height: number;
  /**
   * Factor by which to scale the images are scaled in the montage.
   */
  public readonly scale: number;

  public readonly disposition: MontageDisposition;

  /**
   * Image of the Montage.
   */
  public image: Image;

  /**
   * Create a Montage of two images. The two images are placed side by side for comparison.
   *
   * @param source - First image.
   * @param destination - Second image.
   * @param options  - Montage options.
   */
  public constructor(
    source: Image,
    destination: Image,
    options: MontageOptions = {},
  ) {
    const { scale = 1, disposition = MontageDisposition.HORIZONTAL } = options;

    if (!Number.isInteger(scale)) {
      throw new Error('scale should be an integer');
    }

    this.scale = scale;
    this.disposition = disposition;

    this.sourceWidth = scale * source.width;
    this.destinationWidth = scale * destination.width;
    this.sourceHeight = scale * source.height;
    this.destinationHeight = scale * destination.height;

    if (disposition === MontageDisposition.HORIZONTAL) {
      this.destinationOrigin = { row: 0, column: this.sourceWidth };
      this.width = this.sourceWidth + this.destinationWidth;
      this.height = Math.max(this.sourceHeight, this.destinationHeight);
    } else if (disposition === MontageDisposition.VERTICAL) {
      this.destinationOrigin = { row: this.sourceHeight, column: 0 };
      this.width = Math.max(this.sourceWidth, this.destinationWidth);
      this.height = this.sourceHeight + this.destinationHeight;
    } else {
      throw new Error(`unknown disposition type`);
    }

    if (source.colorModel !== ImageColorModel.RGB) {
      source = source.convertColor(ImageColorModel.RGB);
    }
    if (destination.colorModel !== ImageColorModel.RGB) {
      destination = destination.convertColor(ImageColorModel.RGB);
    }

    const image = new Image(this.width, this.height);

    source
      .resize({ xFactor: scale, yFactor: scale })
      .copyTo(image, { out: image });
    destination.resize({ xFactor: scale, yFactor: scale }).copyTo(image, {
      out: image,
      origin: this.destinationOrigin,
    });

    this.image = image;
  }

  /**
   * Draw keypoints on the Montage.
   *
   * @param keypoints - Keypoints to draw.
   * @param options - Draw keypoints options.
   */
  public drawKeypoints(
    keypoints: FastKeypoint[],
    options: DrawKeypointsOptions = {},
  ): void {
    const scaledKeypoints = scaleKeypoints(keypoints, this.scale);
    this.image = drawKeypoints(this.image, scaledKeypoints, options);
  }

  /**
   * Draw the matches between source and destination keypoints.
   *
   * @param matches - Matches to draw.
   * @param sourceKeypoints - Source keypoints.
   * @param destinationKeypoints  - Destination keypoints
   * @param options - Draw matches options.
   */
  public drawMatches(
    matches: Match[],
    sourceKeypoints: FastKeypoint[],
    destinationKeypoints: FastKeypoint[],
    options: DrawMatchesOptions = {},
  ): void {
    this.image = drawMatches(
      this,
      matches,
      sourceKeypoints,
      destinationKeypoints,
      options,
    );
  }
}
