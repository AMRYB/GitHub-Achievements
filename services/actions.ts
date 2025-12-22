// GitHub Actions Service
// Executes GitHub API commands to help users earn achievements
import { ActionResult, AutoEarnMethod } from '@/types';

const GITHUB_API = 'https://api.github.com';
const REPO_NAME = 'github-achievements-playground';

async function githubPost(endpoint: string, token: string, body: any): Promise<any> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'GitHubAchievementsTracker/1.0',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${response.status}`);
  }
  return response.json();
}

async function githubPut(endpoint: string, token: string, body: any): Promise<any> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'GitHubAchievementsTracker/1.0',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${response.status}`);
  }
  return response.json();
}

async function githubPatch(endpoint: string, token: string, body: any): Promise<any> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'GitHubAchievementsTracker/1.0',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${response.status}`);
  }
  return response.json();
}

async function githubGet(endpoint: string, token: string): Promise<any> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitHubAchievementsTracker/1.0',
    },
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${response.status}`);
  }
  return response.json();
}

async function ensurePlaygroundRepo(username: string, token: string): Promise<string> {
  // Check if repo exists
  const existing = await githubGet(`/repos/${username}/${REPO_NAME}`, token);
  if (existing) return existing.full_name;

  // Create the repo
  const repo = await githubPost('/user/repos', token, {
    name: REPO_NAME,
    description: 'Playground repository for earning GitHub achievements. Created by GitHub Achievements Tracker.',
    auto_init: true,
    private: false,
  });
  return repo.full_name;
}

async function getDefaultBranch(repoFullName: string, token: string): Promise<string> {
  const repo = await githubGet(`/repos/${repoFullName}`, token);
  return repo?.default_branch || 'main';
}

// ============================
// Achievement Actions
// ============================

async function createPRAndMerge(username: string, token: string): Promise<ActionResult> {
  const repoFullName = await ensurePlaygroundRepo(username, token);
  const defaultBranch = await getDefaultBranch(repoFullName, token);
  const branchName = `achievement-pr-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // Get default branch SHA
  const ref = await githubGet(`/repos/${repoFullName}/git/ref/heads/${defaultBranch}`, token);
  const baseSha = ref.object.sha;

  // Create branch
  await githubPost(`/repos/${repoFullName}/git/refs`, token, {
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // Create a file on the new branch
  await githubPut(`/repos/${repoFullName}/contents/achievements/${branchName}.md`, token, {
    message: `Achievement: Pull Shark progress — ${timestamp}`,
    content: btoa(`# Pull Shark Achievement\n\nContribution logged at ${timestamp}\n`),
    branch: branchName,
  });

  // Create PR
  const pr = await githubPost(`/repos/${repoFullName}/pulls`, token, {
    title: `Pull Shark: Contribution ${timestamp}`,
    body: 'Automated PR to earn the Pull Shark achievement.',
    head: branchName,
    base: defaultBranch,
  });

  // Merge PR
  await githubPut(`/repos/${repoFullName}/pulls/${pr.number}/merge`, token, {
    merge_method: 'merge',
  });

  return {
    success: true,
    message: `PR #${pr.number} created and merged! Pull Shark progress +1`,
    url: pr.html_url,
  };
}

async function createPRNoReview(username: string, token: string): Promise<ActionResult> {
  // Same as createPRAndMerge — merging without review = YOLO
  return createPRAndMerge(username, token);
}

async function createCoauthoredPR(username: string, token: string): Promise<ActionResult> {
  const repoFullName = await ensurePlaygroundRepo(username, token);
  const defaultBranch = await getDefaultBranch(repoFullName, token);
  const branchName = `coauthor-pr-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const ref = await githubGet(`/repos/${repoFullName}/git/ref/heads/${defaultBranch}`, token);
  const baseSha = ref.object.sha;

  await githubPost(`/repos/${repoFullName}/git/refs`, token, {
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // Create file with co-author trailer in commit message
  await githubPut(`/repos/${repoFullName}/contents/achievements/coauthor-${branchName}.md`, token, {
    message: `Pair Extraordinaire: Co-authored contribution\n\nCo-authored-by: ${username} <${username}@users.noreply.github.com>`,
    content: btoa(`# Pair Extraordinaire\n\nCo-authored contribution at ${timestamp}\n`),
    branch: branchName,
  });

  const pr = await githubPost(`/repos/${repoFullName}/pulls`, token, {
    title: `Pair Extraordinaire: Co-authored ${timestamp}`,
    body: 'Co-authored PR to earn the Pair Extraordinaire achievement.',
    head: branchName,
    base: defaultBranch,
  });

  await githubPut(`/repos/${repoFullName}/pulls/${pr.number}/merge`, token, {
    merge_method: 'merge',
  });

  return {
    success: true,
    message: `Co-authored PR #${pr.number} created and merged! Pair Extraordinaire progress +1`,
    url: pr.html_url,
  };
}

async function createAndCloseIssue(username: string, token: string): Promise<ActionResult> {
  const repoFullName = await ensurePlaygroundRepo(username, token);
  const timestamp = new Date().toISOString();

  // Create issue
  const issue = await githubPost(`/repos/${repoFullName}/issues`, token, {
    title: `Quickdraw: Achievement issue ${timestamp}`,
    body: 'Opened and closed quickly to earn the Quickdraw achievement.',
  });

  // Close it immediately
  await githubPatch(`/repos/${repoFullName}/issues/${issue.number}`, token, {
    state: 'closed',
  });

  return {
    success: true,
    message: `Issue #${issue.number} created and closed instantly! Quickdraw earned 🤠`,
    url: issue.html_url,
  };
}

async function reactHeart(username: string, token: string): Promise<ActionResult> {
  const repoFullName = await ensurePlaygroundRepo(username, token);

  // Find or create something to react to
  const issues = await githubGet(`/repos/${repoFullName}/issues?state=all&per_page=1`, token);

  let issueNumber: number;
  if (issues && issues.length > 0) {
    issueNumber = issues[0].number;
  } else {
    const issue = await githubPost(`/repos/${repoFullName}/issues`, token, {
      title: 'Heart On Your Sleeve',
      body: 'React with ❤️ to earn the Heart On Your Sleeve achievement!',
    });
    issueNumber = issue.number;
  }

  // React with heart
  await githubPost(`/repos/${repoFullName}/issues/${issueNumber}/reactions`, token, {
    content: 'heart',
  });

  return {
    success: true,
    message: `❤️ reaction added! Heart On Your Sleeve progress +1`,
    url: `https://github.com/${repoFullName}/issues/${issueNumber}`,
  };
}

// ============================
// Main dispatcher
// ============================

export async function executeAction(
  method: AutoEarnMethod,
  username: string,
  token: string
): Promise<ActionResult> {
  switch (method) {
    case 'create_pr_and_merge':
      return createPRAndMerge(username, token);
    case 'create_pr_no_review':
      return createPRNoReview(username, token);
    case 'create_coauthored_pr':
      return createCoauthoredPR(username, token);
    case 'create_and_close_issue':
      return createAndCloseIssue(username, token);
    case 'react_heart':
      return reactHeart(username, token);
    default:
      return { success: false, message: 'This achievement cannot be automated.' };
  }
}
