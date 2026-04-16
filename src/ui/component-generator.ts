import type { IconData, IconCategory } from '../types';

// ============================================
// SVG → React TSX 组件生成器
// ============================================

/** SVG 属性 → JSX 属性映射 */
const ATTR_MAP: Record<string, string> = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'font-size': 'fontSize',
  'font-family': 'fontFamily',
  'font-weight': 'fontWeight',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'dominant-baseline': 'dominantBaseline',
  'alignment-baseline': 'alignmentBaseline',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'xmlns:xlink': null as any, // 移除
  class: 'className',
};

/**
 * 将 SVG 属性名转为 JSX camelCase
 */
function toJsxAttr(attr: string): string | null {
  if (attr in ATTR_MAP) return ATTR_MAP[attr];
  // data-* 和 aria-* 保持不变
  if (attr.startsWith('data-') || attr.startsWith('aria-')) return attr;
  return attr;
}

/**
 * 将 SVG 内容中的属性转为 JSX 格式
 */
function convertAttrsToJsx(svgContent: string): string {
  // 替换所有 HTML 属性为 JSX 格式
  return svgContent.replace(
    /\s([a-z][a-z\-:]+)=/gi,
    (match, attr: string) => {
      const jsxAttr = toJsxAttr(attr);
      if (jsxAttr === null) return ''; // 移除该属性
      return ` ${jsxAttr}=`;
    }
  );
}

/**
 * 从 SVG 字符串中提取 viewBox
 */
function extractViewBox(svg: string): string {
  const match = svg.match(/viewBox="([^"]+)"/);
  return match ? match[1] : '0 0 24 24';
}

/**
 * 提取 SVG 标签内部的子元素内容
 */
function extractSvgChildren(
  svg: string,
  category: IconCategory
): string {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!match) return '';

  let inner = match[1].trim();

  // 移除 XML 注释
  inner = inner.replace(/<!--[\s\S]*?-->/g, '');

  // 根据分类清除硬编码颜色
  if (category === 'outlined') {
    // 线性图标：移除子元素上的 stroke 硬编码颜色，让父级 stroke={color} 继承
    // 同时移除子元素上的 fill（通常是 "none"）以外的硬编码 fill 颜色
    inner = removeHardcodedColors(inner, 'stroke');
    inner = removeHardcodedFillExceptNone(inner);
  } else if (category === 'filled') {
    // 填充图标：移除子元素上的 fill 硬编码颜色，让父级 fill={color} 继承
    inner = removeHardcodedColors(inner, 'fill');
    // 同时移除子元素上的 stroke 硬编码颜色
    inner = removeHardcodedColors(inner, 'stroke');
  }
  // colored 类型保留所有原始颜色

  // 转换属性为 JSX
  inner = convertAttrsToJsx(inner);

  return inner;
}

/**
 * 移除 SVG 子元素中指定属性的硬编码颜色值
 * 匹配所有颜色格式：#hex、rgb()、rgba()、hsl()、颜色关键词等
 */
function removeHardcodedColors(svg: string, attr: string): string {
  // 匹配 attr="颜色值"，颜色值包括 #hex、rgb(...)、rgba(...)、hsl(...)、命名颜色
  const colorPattern = new RegExp(
    `\\s${attr}="(?:#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla)\\([^)]*\\)|black|white|red|green|blue|gray|grey|orange|purple|yellow|pink|brown|transparent)"`,
    'gi'
  );
  return svg.replace(colorPattern, '');
}

/**
 * 移除 fill 属性中非 "none" 的硬编码颜色
 * 保留 fill="none"（outlined 图标需要子元素的 fill="none"）
 */
function removeHardcodedFillExceptNone(svg: string): string {
  return svg.replace(
    /\sfill="([^"]*)"/gi,
    (match, value: string) => {
      if (value.toLowerCase() === 'none') return match; // 保留 fill="none"
      return ''; // 移除硬编码颜色
    }
  );
}

/**
 * 生成单个图标的 React TSX 组件代码
 */
export function generateComponent(icon: IconData): string {
  const { name, category, svg } = icon;
  const viewBox = extractViewBox(svg);
  const children = extractSvgChildren(svg, category);

  if (category === 'colored') {
    return generateColoredComponent(name, viewBox, children);
  }

  if (category === 'filled') {
    return generateFilledComponent(name, viewBox, children);
  }

  return generateOutlinedComponent(name, viewBox, children);
}

function generateOutlinedComponent(
  name: string,
  viewBox: string,
  children: string
): string {
  return `import { forwardRef } from 'react';
import type { IconProps } from '../types';

const ${name} = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="${viewBox}"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      ${children}
    </svg>
  )
);

${name}.displayName = '${name}';
export default ${name};
`;
}

function generateFilledComponent(
  name: string,
  viewBox: string,
  children: string
): string {
  return `import { forwardRef } from 'react';
import type { IconProps } from '../types';

const ${name} = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = 'currentColor', ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="${viewBox}"
      fill={color}
      {...props}
    >
      ${children}
    </svg>
  )
);

${name}.displayName = '${name}';
export default ${name};
`;
}

function generateColoredComponent(
  name: string,
  viewBox: string,
  children: string
): string {
  return `import { forwardRef } from 'react';
import type { IconProps } from '../types';

const ${name} = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="${viewBox}"
      {...props}
    >
      ${children}
    </svg>
  )
);

${name}.displayName = '${name}';
export default ${name};
`;
}

/**
 * 生成 types.ts 文件内容
 */
export function generateTypesFile(): string {
  return `import type { SVGProps, Ref } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** 图标尺寸，同时设置 width 和 height */
  size?: number | string;
  /** 图标颜色，默认 currentColor（colored 类型图标不支持此属性） */
  color?: string;
  /** 描边宽度，仅 outlined 类型生效 */
  strokeWidth?: number | string;
  ref?: Ref<SVGSVGElement>;
}
`;
}

/**
 * 生成分类的 index.ts barrel 文件
 */
export function generateCategoryIndex(iconNames: string[]): string {
  return iconNames
    .sort()
    .map((name) => `export { default as ${name} } from './${name}';`)
    .join('\n') + '\n';
}

/**
 * 生成根 index.ts 文件
 */
export function generateRootIndex(
  categories: Record<IconCategory, string[]>
): string {
  const lines: string[] = [];

  if (categories.outlined.length > 0) {
    lines.push("export * as Outlined from './outlined';");
  }
  if (categories.filled.length > 0) {
    lines.push("export * as Filled from './filled';");
  }
  if (categories.colored.length > 0) {
    lines.push("export * as Colored from './colored';");
  }

  lines.push('');
  lines.push("export type { IconProps } from './types';");
  lines.push('');

  return lines.join('\n');
}
