import type { IconData, ValidationError } from './types';

/** PascalCase: 大写开头，只含字母和数字，长度 >= 2 */
const PASCAL_CASE_RE = /^[A-Z][0-9a-zA-Z]+$/;

/**
 * 检出 SVG 中的 mask 蒙版，并给出对应的设计侧改法。
 *
 * mask 的 id 是写死的（如 mask0_330492_1472），同一图标渲染多次会造成 DOM id
 * 冲突，且多为 Figma 画法留下的冗余，所以扫描阶段直接拦住。
 *
 * 放行的：
 * - clipPath 裁剪——不影响发版
 * - linearGradient / radialGradient——彩色图标依赖渐变上色，属正当用法
 *
 * 只匹配元素本身（<mask ...>），不会误伤 mask="url(#x)" 这类属性引用。
 */
function findMaskFix(svg: string): string | null {
  if (!/<mask[\s>]/i.test(svg)) return null;

  // Figma 导出内描边时会生成 id 形如 path-1-inside-1_xxx 的蒙版：
  // SVG 原生只支持居中描边，Figma 用蒙版裁掉外半边来模拟「内部」对齐。
  // 实战中这条几乎都出在 Union/Subtract 这类布尔拼合形状上——拼合本身不导出
  // mask，是拼合后那圈没轮廓化的内描边导出了 mask。
  const isInsideStroke = /<mask[^>]*id="[^"]*inside[^"]*"/i.test(svg);
  return isInsideStroke
    ? '有描边的对齐是「内部 Inside」。请重点检查 Union / Subtract 等布尔拼合形状——' +
        '拼合后那圈描边往往没轮廓化。选中该形状执行「轮廓化描边 Outline Stroke」' +
        '把描边转成填充，外观不变；也可把对齐改为「居中 Center」，但描边会外扩半个线宽'
    : '图层或画板勾选了「裁剪内容 Clip content」，请取消勾选。' +
        '若确为蒙版图层，请改用布尔拼合并「轮廓化描边 Outline Stroke」后替代';
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

  // 4. mask 蒙版校验：点名图标与改法后阻止发布
  for (const icon of icons) {
    if (!icon.svg) continue;
    const fix = findMaskFix(icon.svg);
    if (fix) {
      errors.push({
        name: icon.name,
        message: `图标「${icon.name}」（${icon.category}）导出后含 mask 蒙版，不允许发布：${fix}`,
      });
    }
  }

  return errors;
}
