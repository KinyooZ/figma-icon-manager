// ============================================
// Figma Plugin ←→ UI 消息类型定义
// ============================================

/** 图标分类 */
export type IconCategory = 'outlined' | 'filled' | 'colored';

/** 单个图标数据 */
export interface IconData {
  /** 组件名 (PascalCase) */
  name: string;
  /** Figma node ID */
  id: string;
  /** 所属分类 */
  category: IconCategory;
  /** 导出的 SVG 字符串 */
  svg: string;
}

/** 扫描结果 */
export interface ScanResult {
  icons: IconData[];
  /** 分类 → 图标名列表 */
  summary: Record<IconCategory, string[]>;
}

/** 校验错误 */
export interface ValidationError {
  /** 相关图标名（可选） */
  name?: string;
  /** 错误描述（中文） */
  message: string;
}

/** GitHub 配置 */
export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  /** 图标文件在仓库中的基础路径 */
  basePath: string;
}

// ----- 消息协议 -----

export type PluginMessage =
  | { type: 'scan' }
  | { type: 'scan-success'; data: ScanResult }
  | { type: 'scan-error'; errors: ValidationError[] }
  | { type: 'load-config' }
  | { type: 'config-loaded'; config: GithubConfig | null }
  | { type: 'save-config'; config: GithubConfig };
