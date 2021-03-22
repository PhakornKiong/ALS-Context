import { getNodeVersion, isAlsSupported, isClsSupported } from '../dist/utils/nodeVersion';

describe('node Version Util Test', () => {
  describe('Test isAlsSupported', () => {
    test('Versions below 12 do not support ALS', () => {
      const nodeVersion = getNodeVersion('11.5.0');
      expect(isAlsSupported(nodeVersion)).toBe(false);
    });

    test('Versions below 12.17 do not support ALS', () => {
      const nodeVersion = getNodeVersion('12.16.3');
      expect(isAlsSupported(nodeVersion)).toBe(false);
    });

    test('Versions below 13.10 do not support ALS', () => {
      const nodeVersion = getNodeVersion('13.9.3');
      expect(isAlsSupported(nodeVersion)).toBe(false);
    });

    test('Versions 12.17+ not support ALS', () => {
      const nodeVersion = getNodeVersion('12.17.0');
      expect(isAlsSupported(nodeVersion)).toBe(true);
    });

    test('Versions 13.10+ support ALS', () => {
      const nodeVersion = getNodeVersion('13.10.1');
      expect(isAlsSupported(nodeVersion)).toBe(true);
    });

    test('Versions 14 support ALS', () => {
      const nodeVersion = getNodeVersion('14.0.0');
      expect(isAlsSupported(nodeVersion)).toBe(true);
    });

    test('Versions > 14 support ALS', () => {
      const nodeVersion = getNodeVersion('15.0.0');
      expect(isAlsSupported(nodeVersion)).toBe(true);
    });

    test('return false be for other strings', () => {
      const nodeVersion = getNodeVersion('x.y.z');
      expect(isAlsSupported(nodeVersion)).toBe(false);
    });
  });

  describe('Test isClsSupported', () => {
    test('Versions below 8 do not support CLS', () => {
      const nodeVersion = getNodeVersion('7.10.1');
      expect(isClsSupported(nodeVersion)).toBe(false);
    });

    test('Versions 8 support CLS', () => {
      const nodeVersion = getNodeVersion('8.0.0');
      expect(isClsSupported(nodeVersion)).toBe(true);
    });

    test('Versions > 8 support CLS', () => {
      const nodeVersion = getNodeVersion('8.7.0');
      expect(isClsSupported(nodeVersion)).toBe(true);
    });

    test('return false be for other strings', () => {
      const nodeVersion = getNodeVersion('x.y.z');
      expect(isClsSupported(nodeVersion)).toBe(false);
    });
  });
});
