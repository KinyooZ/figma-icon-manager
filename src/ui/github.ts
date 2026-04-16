import type { GithubConfig } from '../types';

// ============================================
// GitHub API 封装
// 通过 Git Data API 实现单次 commit 推送多文件
// ============================================

interface FileEntry {
  /** 仓库中的文件路径 */
  path: string;
  /** 文件内容 */
  content: string;
}

interface GitHubError {
  message: string;
  documentation_url?: string;
}

async function ghFetch<T>(
  config: GithubConfig,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `https://api.github.com${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = '';
    try {
      const err: GitHubError = await res.json();
      detail = err.message;
    } catch {
      detail = res.statusText;
    }
    throw new Error(`GitHub API 错误 (${res.status}): ${detail}`);
  }

  return res.json() as Promise<T>;
}

/**
 * 验证 GitHub Token 及仓库是否可访问
 */
export async function verifyConfig(config: GithubConfig): Promise<void> {
  await ghFetch<any>(
    config,
    `/repos/${config.owner}/${config.repo}`
  );
}

/**
 * 将文件列表以单次 commit 推送到 GitHub 仓库
 *
 * 流程:
 * 1. 获取目标分支最新 commit SHA
 * 2. 获取该 commit 的 tree SHA
 * 3. 为每个文件创建 blob
 * 4. 创建新的 tree（包含所有文件）
 * 5. 创建 commit
 * 6. 更新分支引用
 */
export async function pushFiles(
  config: GithubConfig,
  files: FileEntry[],
  commitMessage: string
): Promise<string> {
  const { owner, repo, branch } = config;
  const repoBase = `/repos/${owner}/${repo}`;

  // 1. 获取分支最新 commit
  const refData = await ghFetch<{ object: { sha: string } }>(
    config,
    `${repoBase}/git/ref/heads/${branch}`
  );
  const latestCommitSha = refData.object.sha;

  // 2. 获取 commit 的 tree
  const commitData = await ghFetch<{ tree: { sha: string } }>(
    config,
    `${repoBase}/git/commits/${latestCommitSha}`
  );
  const baseTreeSha = commitData.tree.sha;

  // 3. 创建所有 blob（并行）
  const blobPromises = files.map(async (file) => {
    const blob = await ghFetch<{ sha: string }>(
      config,
      `${repoBase}/git/blobs`,
      {
        method: 'POST',
        body: JSON.stringify({
          content: file.content,
          encoding: 'utf-8',
        }),
      }
    );
    return {
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      sha: blob.sha,
    };
  });

  const treeItems = await Promise.all(blobPromises);

  // 4. 创建新 tree
  const newTree = await ghFetch<{ sha: string }>(
    config,
    `${repoBase}/git/trees`,
    {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    }
  );

  // 5. 创建 commit
  const newCommit = await ghFetch<{ sha: string; html_url: string }>(
    config,
    `${repoBase}/git/commits`,
    {
      method: 'POST',
      body: JSON.stringify({
        message: commitMessage,
        tree: newTree.sha,
        parents: [latestCommitSha],
      }),
    }
  );

  // 6. 更新分支引用
  await ghFetch<any>(config, `${repoBase}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommit.sha,
    }),
  });

  return newCommit.sha;
}
