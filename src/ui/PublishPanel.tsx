import React from 'react';
import type { ScanResult, ValidationError, IconCategory } from '../types';

interface PublishPanelProps {
  configured: boolean;
  scanning: boolean;
  scanResult: ScanResult | null;
  scanErrors: ValidationError[];
  publishing: boolean;
  publishProgress: string;
  publishResult: { success: boolean; message: string } | null;
  onScan: () => void;
  onPublish: () => void;
  onGoConfig: () => void;
}

const CATEGORY_LABELS: Record<IconCategory, string> = {
  outlined: 'Outlined（线性）',
  filled: 'Filled（填充）',
  colored: 'Colored（彩色）',
};

export function PublishPanel({
  configured,
  scanning,
  scanResult,
  scanErrors,
  publishing,
  publishProgress,
  publishResult,
  onScan,
  onPublish,
  onGoConfig,
}: PublishPanelProps) {
  if (!configured) {
    return (
      <div>
        <div className="message message-info">
          请先配置 GitHub 仓库连接，点击右上角「设置」进行配置。
        </div>
        <button className="btn-publish" onClick={onGoConfig}>
          前往设置
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 发布结果 */}
      {publishResult && (
        <div
          className={`message ${publishResult.success ? 'message-success' : 'message-error'}`}
        >
          {publishResult.message}
        </div>
      )}

      {/* 校验错误 */}
      {scanErrors.length > 0 && (
        <div className="message message-error">
          <strong>校验未通过，请修正以下问题：</strong>
          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
            {scanErrors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 扫描结果摘要 */}
      {scanResult && (
        <div className="summary">
          <div className="message message-success">
            校验通过，共 {scanResult.icons.length} 个图标
          </div>
          {(['outlined', 'filled', 'colored'] as IconCategory[]).map(
            (cat) =>
              scanResult.summary[cat].length > 0 && (
                <div key={cat} className="summary-category">
                  <span className="label">{CATEGORY_LABELS[cat]}</span>
                  <span className="count">
                    {scanResult.summary[cat].length} 个
                  </span>
                </div>
              )
          )}
        </div>
      )}

      {/* 发布进度 */}
      {publishing && (
        <div className="message message-info">{publishProgress}</div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!scanResult ? (
          <button
            className="btn-publish"
            onClick={onScan}
            disabled={scanning}
          >
            {scanning ? '正在扫描图标...' : '扫描图标'}
          </button>
        ) : (
          <>
            <button
              className="btn-publish"
              onClick={onPublish}
              disabled={publishing}
            >
              {publishing ? '正在发布...' : '发布到 GitHub'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={onScan}
              disabled={scanning || publishing}
              style={{ width: '100%' }}
            >
              重新扫描
            </button>
          </>
        )}
      </div>
    </div>
  );
}
