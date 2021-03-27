import { isClsSupported } from './utils/nodeVersion';

const { getNodeVersion, isAlsSupported, nodeVersionString } = require('./utils/nodeVersion');

export const ALS = isAlsSupported(getNodeVersion(nodeVersionString))
  ? require('./als/als').default
  : require('./cls/cls').default;

export const CLS = isClsSupported(getNodeVersion(nodeVersionString))
  ? require('./cls/cls').default
  : new Error('not supported');

export default ALS;
