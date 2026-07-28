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
const DISALLOWED_ELEMENTS: { tag: string; label: string }[] = [
  { tag: 'mask', label: 'mask 蒙版' },
  { tag: 'clipPath', label: 'clipPath 裁剪' },
];

/** 检出 SVG 中出现的受限元素，返回其中文标签列表 */
function findDisallowedElements(svg: string): string[] {
  const found: string[] = [];
  for (const { tag, label } of DISALLOWED_ELEMENTS) {
    // 只匹配元素本身（<mask ...>），不匹配 mask="url(#x)" 这类属性引用
    if (new RegExp(`<${tag}[\\s>]`, 'i').test(svg)) {
      found.push(label);
    }
  }
  return found;
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

  // 4. 受限结构校验：mask / clipPath 带硬编码 id，阻止发布并点名图标
  for (const icon of icons) {
    if (!icon.svg) continue;
    const found = findDisallowedElements(icon.svg);
    if (found.length > 0) {
      errors.push({
        name: icon.name,
        message: `图标「${icon.name}」（${icon.category}）包含 ${found.join('、')}，不允许发布。这类结构带写死的 id，同一图标渲染多次会造成 DOM id 冲突。请在 Figma 中改为纯路径：描边对齐改为「居中」、用「拼合形状 / 轮廓化描边」替代蒙版和裁剪。`,
      });
    }
  }

  return errors;
}
