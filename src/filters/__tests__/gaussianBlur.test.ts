import { BorderType } from '../../utils/interpolateBorder';
import { gaussianBlur } from '../gaussianBlur';

test('symmetrical kernel, should return the kernel itself', () => {
  const image = testUtils.createGreyImage([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 255, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  const options = { size: 5, sigma: 1, borderType: BorderType.REPLICATE };

  let result = image.gaussianBlur(options);

  let sum = 0;
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 5; column++) {
      sum += result.getValue(column, row, 0);
    }
  }

  // expect the value to be close to 255
  expect(sum).toBe(253);

  expect(result).toMatchImageData([
    [1, 3, 6, 3, 1],
    [3, 15, 25, 15, 3],
    [6, 25, 41, 25, 6],
    [3, 15, 25, 15, 3],
    [1, 3, 6, 3, 1],
  ]);
});

test('size error', () => {
  const image = testUtils.createGreyImage([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 255, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  const options = { size: 4, sigma: 1 };

  expect(() => {
    image.gaussianBlur(options);
  }).toThrow('size must be positive and odd');
});

test('x and y kernels', () => {
  const image = testUtils.createGreyImage([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 255, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  const options = {
    size: 5,
    sigmaX: 1,
    sigmaY: 1,
    borderType: BorderType.REPLICATE,
  };

  let result = image.gaussianBlur(options);

  let sum = 0;
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 5; column++) {
      sum += result.getValue(column, row, 0);
    }
  }

  // expect the value to be close to 255
  expect(sum).toBe(253);

  expect(result).toMatchImageData([
    [1, 3, 6, 3, 1],
    [3, 15, 25, 15, 3],
    [6, 25, 41, 25, 6],
    [3, 15, 25, 15, 3],
    [1, 3, 6, 3, 1],
  ]);
});

test.skip('gaussian blur should have same result as opencv', () => {
  const img = testUtils.load('opencv/test.png');
  const options = {
    borderType: BorderType.REFLECT,
    size: 3,
    sigmaX: 1,
    sigmaY: 1,
  };
  const blurred = gaussianBlur(img, options);

  // const grey = convertColor(img, ImageKind.GREY);
  // const greyBlurred = gaussianBlur(grey, options);
  // console.log(greyBlurred.data);

  const expected = testUtils.load('opencv/testGaussianBlur.png');
  // write('gaussian.png', blurred);
  expect(expected).toMatchImage(blurred);
});
