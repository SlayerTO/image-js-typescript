// generate some variations of the alphabet image for feature matching
// run this script with: ts-node --log-error generateFMtestImages.ts
import { ImageColorModel, readSync, writeSync, Image } from '../src';

const original = readSync('../test/img/featureMatching/alphabet.jpg');

const angles = [-10, -5, -2, 2, 5, 10];
for (let angle of angles) {
  const rotated = original.transformRotate(angle, { fullImage: true });
  writeSync(`../test/img/featureMatching/alphabetRotated${angle}.jpg`, rotated);
}

const translations = [10, 20, 50];
const empty = new Image(original.width + 100, original.height + 100, {
  colorModel: ImageColorModel.RGBA,
}).fill(100);

for (let translation of translations) {
  const translated = original.copyTo(empty, {
    origin: { column: 50, row: translation },
  });
  writeSync(
    `../test/img/featureMatching/alphabetTranslated${translation}.jpg`,
    translated,
  );
}
