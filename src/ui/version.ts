// ============================================
// 语义化版本（semver）自动 bump
// 根据本次发布的图标增删，决定版本号怎么涨
// ============================================

export type BumpLevel = 'major' | 'minor' | 'patch';

/**
 * 根据图标增删决定版本级别。
 *
 * 规则（0.x 阶段与 >=1.0 区别对待）：
 * - 有删除/改名图标（破坏性）：0.x → minor，>=1.0 → major
 * - 仅新增图标：0.x → patch，>=1.0 → minor
 * - 仅内容更新（图标重绘，无增删）：patch
 */
export function decideBumpLevel(opts: {
  major: number;
  hasRemovals: boolean;
  hasAdditions: boolean;
}): BumpLevel {
  const { major, hasRemovals, hasAdditions } = opts;
  if (hasRemovals) return major === 0 ? 'minor' : 'major';
  if (hasAdditions) return major === 0 ? 'patch' : 'minor';
  return 'patch';
}

/**
 * 对一个 x.y.z 版本号按级别 bump。无法解析时原样返回。
 */
export function bumpSemver(version: string, level: BumpLevel): string {
  const m = version.trim().match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return version;
  let major = Number(m[1]);
  let minor = Number(m[2]);
  let patch = Number(m[3]);
  if (level === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (level === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

/**
 * 从 package.json 文本中读取顶层 version 字段。读不到返回 null。
 */
export function readPackageVersion(pkgText: string): string | null {
  const m = pkgText.match(/"version"\s*:\s*"([^"]+)"/);
  return m ? m[1] : null;
}

/**
 * 将 package.json 文本中的 version 字段替换为新值。
 * 使用正则只改这一处，保留文件其余格式/字段顺序不变。
 */
export function setPackageVersion(pkgText: string, newVersion: string): string {
  return pkgText.replace(/("version"\s*:\s*")[^"]*(")/, `$1${newVersion}$2`);
}
