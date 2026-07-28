import type { IconData, ValidationError } from './types';

/** PascalCase: 大写开头，只含字母和数字，长度 >= 2 */
const PASCAL_CASE_RE = /^[A-Z][0-9a-zA-Z]+$/;

/**
 * 会带来硬编码 id 的 SVG 结构。
 *
 * 这类元素导出后 id 是写死的（如 mask0_330492_1472），同一个图标在页面上
 * 渲染多次就会产生重复 DOM id；而且它们多数是 Figma 画法留下的冗余
 * （内描边、蒙版裁剪），并非图标本身需要。
 *
 * 注意：linearGradient / radialGradient 不在此列——彩色图标依赖渐变上色，
 * 属于正当用法，放行。
 */
interface Finding {
  /** 出现的元素 */
  label: string;
  /** 设计侧的成因与改法（这些元素多由 Figma 导出时自动生成，并非手动画的蒙版） */
  fix: string;
}

/**
 * 检出 SVG 中的受限元素，并给出对应的设计侧改法。
 *
 * 只匹配元素本身（<mask ...>），不会误伤 mask="url(#x)" 这类属性引用。
 */
function findDisallowedElements(svg: string): Finding[] {
  const findings: Finding[] = [];

  if (/<mask[\s>]/i.test(svg)) {
    // Figma 导出内描边时会生成 id 形如 path-1-inside-1_xxx 的蒙版：
    // SVG 原生只支持居中描边，Figma 用蒙版裁掉外半边来模拟「内部」对齐
    const isInsideStroke = /<mask[^>]*id="[^"]*inside[^"]*"/i.test(svg);
    findings.push({
      label: 'mask 蒙版',
      fix: isInsideStroke
        ? '描边对齐设成了「内部 Inside」，请改为「居中 Center」'
        : '图层或画板勾选了「裁剪内容 Clip content」，请取消勾选；若确为蒙版图层，请改用拼合形状',
    });
  }

  if (/<clipPath[\s>]/i.test(svg)) {
    findings.push({
      label: 'clipPath 裁剪',
      fix: '画板勾选了「裁剪内容 Clip content」，请取消勾选',
    });
  }

  return findings;
}

/**
 * 校验所有图标，返回错误列表（空 = 通过）
 */
export function validateIcons(icons: IconData[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (icons.length === 0) {
    errors.push({ message: '未找到任何图标组件，请确认 Figma 文件结构是否正确' });
    return errors;
  }

  // 1. 命名规范校验
  for (const icon of icons) {
    if (!PASCAL_CASE_RE.test(icon.name)) {
      errors.push({
        name: icon.name,
        message: `图标「${icon.name}」命名不符合规范，需要使用大驼峰命名（如 ArrowUp），且只能包含英文字母和数字`,
      });
    }
  }

  // 2. 同分类内重名校验
  const seen = new Map<string, IconData>();
  for (const icon of icons) {
    const key = `${icon.category}/${icon.name}`;
    const existing = seen.get(key);
    if (existing) {
      errors.push({
        name: icon.name,
        message: `图标「${icon.name}」在分类「${icon.category}」中存在重复`,
      });
    } else {
      seen.set(key, icon);
    }
  }

  // 3. SVG 有效性校验
  for (const icon of icons) {
    if (!icon.svg || icon.svg.trim().length === 0) {
      errors.push({
        name: icon.name,
        message: `图标「${icon.name}」导出的 SVG 为空`,
      });
    }
  }

  // 4. 受限结构校验：mask / clipPath 带硬编码 id，阻止发布并点名图标与改法
  for (const icon of icons) {
    if (!icon.svg) continue;
    const findings = findDisallowedElements(icon.svg);
    for (const { label, fix } of findings) {
      errors.push({
        name: icon.name,
        message: `图标「${icon.name}」（${icon.category}）导出后含 ${label}，不允许发布：${fix}。（这类结构的 id 是写死的，同一图标渲染多次会造成 DOM id 冲突）`,
      });
    }
  }

  return errors;
}
