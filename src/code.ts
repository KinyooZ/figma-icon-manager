import type {
  IconData,
  IconCategory,
  ScanResult,
  ValidationError,
  GithubConfig,
  PluginMessage,
} from './types';
import { validateIcons } from './validator';

// ============================================
// Figma Sandbox 主入口
// ============================================

const CONFIG_KEY = 'github-config';

figma.showUI(__html__, { width: 480, height: 560, themeColors: true });

// ----- 消息处理 -----

figma.ui.onmessage = async (msg: PluginMessage) => {
  switch (msg.type) {
    case 'scan':
      await handleScan();
      break;

    case 'load-config':
      await handleLoadConfig();
      break;

    case 'save-config':
      await figma.clientStorage.setAsync(CONFIG_KEY, msg.config);
      break;
  }
};

// ----- 扫描逻辑 -----

async function handleScan() {
  try {
    const icons = await scanIcons();
    const errors = validateIcons(icons);

    if (errors.length > 0) {
      figma.ui.postMessage({ type: 'scan-error', errors } as PluginMessage);
      return;
    }

    const summary: ScanResult['summary'] = {
      outlined: [],
      filled: [],
      colored: [],
    };
    for (const icon of icons) {
      summary[icon.category].push(icon.name);
    }

    figma.ui.postMessage({
      type: 'scan-success',
      data: { icons, summary },
    } as PluginMessage);
  } catch (e: any) {
    figma.ui.postMessage({
      type: 'scan-error',
      errors: [{ message: e.message || '未知错误' }] as ValidationError[],
    } as PluginMessage);
  }
}

async function handleLoadConfig() {
  const config: GithubConfig | null =
    await figma.clientStorage.getAsync(CONFIG_KEY);
  figma.ui.postMessage({ type: 'config-loaded', config } as PluginMessage);
}

// ----- 图标扫描与导出 -----

/** 从 Figma 文档结构中扫描所有图标 */
async function scanIcons(): Promise<IconData[]> {
  const root = figma.root;

  // 1. 找到名称包含 "icon" 的页面
  const iconPages = root.children.filter(
    (page) => /icon/i.test(page.name) && page.type === 'PAGE'
  );

  if (iconPages.length === 0) {
    throw new Error(
      '未找到图标页面，请确保至少有一个名称包含「icon」的页面'
    );
  }

  // 2. 在这些页面下找到以 outlined/filled/colored 结尾的 Frame
  const categoryFrames: { frame: FrameNode; category: IconCategory }[] = [];

  for (const page of iconPages) {
    for (const child of page.children) {
      if (child.type !== 'FRAME') continue;
      const match = child.name.match(/(outlined|filled|colored)$/i);
      if (match) {
        categoryFrames.push({
          frame: child as FrameNode,
          category: match[1].toLowerCase() as IconCategory,
        });
      }
    }
  }

  if (categoryFrames.length === 0) {
    throw new Error(
      '未找到图标分类 Frame，请确保页面下有以「Outlined」「Filled」或「Colored」结尾的 Frame'
    );
  }

  // 3. 递归收集所有 Component 并导出 SVG
  const icons: IconData[] = [];

  for (const { frame, category } of categoryFrames) {
    const components = collectComponents(frame);
    for (const comp of components) {
      const svgBytes = await comp.exportAsync({ format: 'SVG' });
      const svg = String.fromCharCode(...svgBytes);
      icons.push({
        name: comp.name,
        id: comp.id,
        category,
        svg,
      });
    }
  }

  return icons;
}

/** 递归收集 Frame 下所有 Component 节点 */
function collectComponents(node: BaseNode): ComponentNode[] {
  if (node.type === 'COMPONENT') {
    return [node as ComponentNode];
  }
  if ('children' in node) {
    const results: ComponentNode[] = [];
    for (const child of (node as ChildrenMixin).children) {
      results.push(...collectComponents(child));
    }
    return results;
  }
  return [];
}
