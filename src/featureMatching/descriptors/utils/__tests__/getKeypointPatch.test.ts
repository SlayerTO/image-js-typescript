import { TestImagePath } from '../../../../../test/TestImagePath';
import { ImageColorModel } from '../../../../Image';
import { getBestKeypointsInRadius } from '../../../keypoints/getBestKeypointsInRadius';
import { getOrientedFastKeypoints } from '../../../keypoints/getOrientedFastKeypoints';
import { drawKeypoints } from '../../../visualize/drawKeypoints';
import { getKeypointPatch } from '../getKeypointPatch';

test.each([
  {
    message: 'scalene triangle',
    image: 'scaleneTriangle',
    expected: 2,
  },
  {
    message: 'polygon rotated 180°',
    image: 'polygonRotated180degrees',
    expected: 8,
  },
])('default options ($message)', (data) => {
  const image = testUtils.load(
    `featureMatching/polygons/${data.image}.png` as TestImagePath,
  );

  const grey = image.convertColor(ImageColorModel.GREY);

  const allKeypoints = getOrientedFastKeypoints(grey, { windowSize: 15 });
  const keypoints = getBestKeypointsInRadius(allKeypoints, 10);

  expect(keypoints).toHaveLength(data.expected);

  const kptImage = drawKeypoints(image, keypoints, { showOrientation: true });

  expect(kptImage).toMatchImageSnapshot();

  for (let keypoint of keypoints) {
    expect(getKeypointPatch(image, keypoint)).toMatchImageSnapshot();
  }
});
