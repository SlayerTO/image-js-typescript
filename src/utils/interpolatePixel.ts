import { IJS } from '../IJS';

import { ClampFunction } from './clamp';
import { BorderInterpolationFunction } from './interpolateBorder';
import { round } from './round';

export enum InterpolationType {
  NEAREST = 'NEAREST',
  BILINEAR = 'BILINEAR',
  BICUBIC = 'BICUBIC',
}

type InterpolationFunction = (
  image: IJS,
  column: number,
  row: number,
  channel: number,
  intepolateBorder: BorderInterpolationFunction,
  clamp: ClampFunction,
) => number;

/**
 * @param interpolationType
 */
export function getInterpolationFunction(
  interpolationType: InterpolationType,
): InterpolationFunction {
  switch (interpolationType) {
    case InterpolationType.NEAREST: {
      return interpolateNearest;
    }
    case InterpolationType.BILINEAR: {
      return interpolateBilinear;
    }
    case InterpolationType.BICUBIC: {
      return interpolateBicubic;
    }
    default: {
      throw new Error(`interpolation ${interpolationType} not implemented`);
    }
  }
}

/**
 * @param image
 * @param column
 * @param row
 * @param channel
 * @param interpolateBorder
 */
function interpolateNearest(
  image: IJS,
  column: number,
  row: number,
  channel: number,
  interpolateBorder: BorderInterpolationFunction,
): number {
  column = Math.round(column);
  row = Math.round(row);

  return interpolateBorder(column, row, channel, image);
}

/**
 * @param image
 * @param column
 * @param row
 * @param channel
 * @param interpolateBorder
 */
function interpolateBilinear(
  image: IJS,
  column: number,
  row: number,
  channel: number,
  interpolateBorder: BorderInterpolationFunction,
): number {
  const px0 = Math.floor(column);
  const py0 = Math.floor(row);

  if (px0 === column && py0 === row) {
    return interpolateBorder(px0, py0, channel, image);
  }

  const px1 = px0 + 1;
  const py1 = py0 + 1;

  const vx0y0 = interpolateBorder(px0, py0, channel, image);
  const vx1y0 = interpolateBorder(px1, py0, channel, image);
  const vx0y1 = interpolateBorder(px0, py1, channel, image);
  const vx1y1 = interpolateBorder(px1, py1, channel, image);

  const r1 = (px1 - column) * vx0y0 + (column - px0) * vx1y0;
  const r2 = (px1 - column) * vx0y1 + (column - px0) * vx1y1;
  return round((py1 - row) * r1 + (row - py0) * r2);
}

/**
 * @param image
 * @param column
 * @param row
 * @param channel
 * @param interpolateBorder
 * @param clamp
 */
function interpolateBicubic(
  image: IJS,
  column: number,
  row: number,
  channel: number,
  interpolateBorder: BorderInterpolationFunction,
  clamp: ClampFunction,
): number {
  const px1 = Math.floor(column);
  const py1 = Math.floor(row);

  if (px1 === column && py1 === row) {
    return interpolateBorder(px1, py1, channel, image);
  }

  const xNorm = column - px1;
  const yNorm = row - py1;

  const vx0y0 = interpolateBorder(px1 - 1, py1 - 1, channel, image);
  const vx1y0 = interpolateBorder(px1, py1 - 1, channel, image);
  const vx2y0 = interpolateBorder(px1 + 1, py1 - 1, channel, image);
  const vx3y0 = interpolateBorder(px1 + 2, py1 - 1, channel, image);
  const v0 = cubic(vx0y0, vx1y0, vx2y0, vx3y0, xNorm);

  const vx0y1 = interpolateBorder(px1 - 1, py1, channel, image);
  const vx1y1 = interpolateBorder(px1, py1, channel, image);
  const vx2y1 = interpolateBorder(px1 + 1, py1, channel, image);
  const vx3y1 = interpolateBorder(px1 + 2, py1, channel, image);
  const v1 = cubic(vx0y1, vx1y1, vx2y1, vx3y1, xNorm);

  const vx0y2 = interpolateBorder(px1 - 1, py1 + 1, channel, image);
  const vx1y2 = interpolateBorder(px1, py1 + 1, channel, image);
  const vx2y2 = interpolateBorder(px1 + 1, py1 + 1, channel, image);
  const vx3y2 = interpolateBorder(px1 + 2, py1 + 1, channel, image);
  const v2 = cubic(vx0y2, vx1y2, vx2y2, vx3y2, xNorm);

  const vx0y3 = interpolateBorder(px1 - 1, py1 + 2, channel, image);
  const vx1y3 = interpolateBorder(px1, py1 + 2, channel, image);
  const vx2y3 = interpolateBorder(px1 + 1, py1 + 2, channel, image);
  const vx3y3 = interpolateBorder(px1 + 2, py1 + 2, channel, image);
  const v3 = cubic(vx0y3, vx1y3, vx2y3, vx3y3, xNorm);

  return round(clamp(cubic(v0, v1, v2, v3, yNorm)));
}

/**
 * @param a
 * @param b
 * @param c
 * @param d
 * @param x
 */
function cubic(a: number, b: number, c: number, d: number, x: number): number {
  return (
    b +
    0.5 *
      x *
      (c -
        a +
        x * (2.0 * a - 5.0 * b + 4.0 * c - d + x * (3.0 * (b - c) + d - a)))
  );
}
