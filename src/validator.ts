import type { IconData, ValidationError } from './types';

/** PascalCase: 大写开头，只含字母和数字，长度 >= 2 */
const PASCAL_CASE_RE = /^[A-Z][0-9a-zA-Z]+$/;

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

  return errors;
}
