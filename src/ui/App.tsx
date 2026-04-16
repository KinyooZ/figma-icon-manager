import React, { useState, useEffect, useCallback } from 'react';
import type {
  GithubConfig,
  ScanResult,
  ValidationError,
  PluginMessage,
  IconCategory,
} from '../types';
import { ConfigPanel } from './ConfigPanel';
import { PublishPanel } from './PublishPanel';
import {
  generateComponent,
  generateTypesFile,
  generateCategoryIndex,
  generateRootIndex,
} from './component-generator';
import { pushFiles, verifyConfig } from './github';

type Page = 'config' | 'publish';

export function App() {
  const [page, setPage] = useState<Page>('publish');
  const [config, setConfig] = useState<GithubConfig | null>(null);
  const [configVerified, setConfigVerified] = useState(false);

  // 扫描状态
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanErrors, setScanErrors] = useState<ValidationError[]>([]);

  // 发布状态
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState('');
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 加载保存的配置
  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'load-config' } }, '*');
  }, []);

  // 监听来自 Figma 插件的消息
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as PluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'config-loaded':
          if (msg.config) {
            setConfig(msg.config);
            // 自动验证已保存的配置
            verifyConfig(msg.config)
              .then(() => setConfigVerified(true))
              .catch(() => setConfigVerified(false));
          }
          break;

        case 'scan-success':
          setScanning(false);
          setScanResult(msg.data);
          setScanErrors([]);
          break;

        case 'scan-error':
          setScanning(false);
          setScanResult(null);
          setScanErrors(msg.errors);
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // 保存配置
  const handleSaveConfig = useCallback(
    async (newConfig: GithubConfig) => {
      try {
        await verifyConfig(newConfig);
        setConfig(newConfig);
        setConfigVerified(true);
        parent.postMessage(
          { pluginMessage: { type: 'save-config', config: newConfig } },
          '*'
        );
        setPage('publish');
      } catch (e: any) {
        throw new Error(`连接验证失败：${e.message}`);
      }
    },
    []
  );

  // 触发扫描
  const handleScan = useCallback(() => {
    setScanning(true);
    setScanResult(null);
    setScanErrors([]);
    setPublishResult(null);
    parent.postMessage({ pluginMessage: { type: 'scan' } }, '*');
  }, []);

  // 发布到 GitHub
  const handlePublish = useCallback(async () => {
    if (!config || !scanResult) return;

    setPublishing(true);
    setPublishResult(null);

    try {
      setPublishProgress('正在生成组件文件...');

      const files: { path: string; content: string }[] = [];
      const basePath = config.basePath.replace(/\/+$/, '');

      // 生成 types.ts
      files.push({
        path: `${basePath}/types.ts`,
        content: generateTypesFile(),
      });

      // 按分类生成组件文件
      const categories: IconCategory[] = ['outlined', 'filled', 'colored'];
      for (const category of categories) {
        const categoryIcons = scanResult.icons.filter(
          (icon) => icon.category === category
        );
        if (categoryIcons.length === 0) continue;

        for (const icon of categoryIcons) {
          const componentCode = generateComponent(icon);
          files.push({
            path: `${basePath}/${category}/${icon.name}.tsx`,
            content: componentCode,
          });
        }

        // 分类 index.ts
        files.push({
          path: `${basePath}/${category}/index.ts`,
          content: generateCategoryIndex(categoryIcons.map((i) => i.name)),
        });
      }

      // 根 index.ts
      files.push({
        path: `${basePath}/index.ts`,
        content: generateRootIndex(scanResult.summary),
      });

      setPublishProgress(
        `正在推送 ${files.length} 个文件到 GitHub...`
      );

      const commitSha = await pushFiles(
        config,
        files,
        `chore(icons): 更新图标组件 (${scanResult.icons.length} icons)`
      );

      setPublishResult({
        success: true,
        message: `发布成功！共 ${scanResult.icons.length} 个图标，Commit: ${commitSha.slice(0, 7)}`,
      });
    } catch (e: any) {
      setPublishResult({
        success: false,
        message: `发布失败：${e.message}`,
      });
    } finally {
      setPublishing(false);
      setPublishProgress('');
    }
  }, [config, scanResult]);

  const isConfigured = config && configVerified;

  return (
    <div className="app">
      <div className="header">
        <h1>Icon Manager</h1>
        <div className="header-actions">
          {page === 'publish' && (
            <>
              <div className="connection-status">
                <span
                  className={`status-dot ${isConfigured ? 'connected' : 'disconnected'}`}
                />
                {isConfigured
                  ? `${config!.owner}/${config!.repo}`
                  : '未连接'}
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setPage('config')}
              >
                设置
              </button>
            </>
          )}
          {page === 'config' && (
            <button
              className="btn btn-ghost"
              onClick={() => setPage('publish')}
            >
              返回
            </button>
          )}
        </div>
      </div>

      <div className="content">
        {page === 'config' && (
          <ConfigPanel
            initialConfig={config}
            onSave={handleSaveConfig}
          />
        )}

        {page === 'publish' && (
          <PublishPanel
            configured={!!isConfigured}
            scanning={scanning}
            scanResult={scanResult}
            scanErrors={scanErrors}
            publishing={publishing}
            publishProgress={publishProgress}
            publishResult={publishResult}
            onScan={handleScan}
            onPublish={handlePublish}
            onGoConfig={() => setPage('config')}
          />
        )}
      </div>
    </div>
  );
}
