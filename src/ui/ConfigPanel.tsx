import React, { useState } from 'react';
import type { GithubConfig } from '../types';

interface ConfigPanelProps {
  initialConfig: GithubConfig | null;
  onSave: (config: GithubConfig) => Promise<void>;
}

export function ConfigPanel({ initialConfig, onSave }: ConfigPanelProps) {
  const [token, setToken] = useState(initialConfig?.token ?? '');
  const [owner, setOwner] = useState(initialConfig?.owner ?? '');
  const [repo, setRepo] = useState(initialConfig?.repo ?? '');
  const [branch, setBranch] = useState(initialConfig?.branch ?? 'main');
  const [basePath, setBasePath] = useState(
    initialConfig?.basePath ?? 'src/icons'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      setError('请输入 GitHub Token');
      return;
    }
    if (!owner.trim() || !repo.trim()) {
      setError('请输入仓库信息');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        token: token.trim(),
        owner: owner.trim(),
        repo: repo.trim(),
        branch: branch.trim() || 'main',
        basePath: basePath.trim() || 'src/icons',
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>GitHub Personal Access Token</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxx"
        />
        <div className="hint">
          需要 repo 权限，在 GitHub Settings → Developer settings → Personal
          access tokens 中创建
        </div>
      </div>

      <div className="form-group">
        <label>仓库拥有者 (Owner)</label>
        <input
          type="text"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="your-org"
        />
      </div>

      <div className="form-group">
        <label>仓库名称 (Repository)</label>
        <input
          type="text"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="icon-library"
        />
      </div>

      <div className="form-group">
        <label>分支 (Branch)</label>
        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="main"
        />
      </div>

      <div className="form-group">
        <label>图标文件路径 (Base Path)</label>
        <input
          type="text"
          value={basePath}
          onChange={(e) => setBasePath(e.target.value)}
          placeholder="src/icons"
        />
        <div className="hint">
          图标组件将生成到该路径下，如 src/icons/outlined/ArrowUp.tsx
        </div>
      </div>

      {error && <div className="message message-error">{error}</div>}

      <button
        type="submit"
        className="btn-publish"
        disabled={saving}
      >
        {saving ? '正在验证连接...' : '保存并验证'}
      </button>
    </form>
  );
}
