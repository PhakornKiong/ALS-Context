export const nodeVersionString = process.versions.node;

type NodeVersion = {
  majorVer: number;
  minorVer: number;
  patchVer: number;
};

export function getNodeVersion(nodeVersionString: string): NodeVersion {
  const [major, minor, patch] = nodeVersionString.split('.');
  return {
    majorVer: Number.parseInt(major),
    minorVer: Number.parseInt(minor),
    patchVer: Number.parseInt(patch),
  };
}

export function isAlsSupported(nodeVersion: NodeVersion): boolean {
  const { majorVer, minorVer } = nodeVersion;

  if (majorVer > 13) {
    return true;
  }

  if (majorVer < 12) {
    return false;
  }

  // https://nodejs.org/en/blog/release/v12.17.0/
  if (majorVer === 12) {
    return minorVer >= 17;
  }

  // https://nodejs.org/en/blog/release/v13.10.0/
  if (majorVer === 13) {
    return minorVer >= 10;
  }

  return false;
}

export function isClsSupported(nodeVersion: NodeVersion): boolean {
  const { majorVer } = nodeVersion;

  if (majorVer >= 8) {
    return true;
  }

  if (majorVer < 8) {
    return false;
  }
  return false;
}
