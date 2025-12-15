import { GitHubProfile, SyncMetrics } from '@/types';

const GITHUB_API = 'https://api.github.com';

interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
}

let rateLimitInfo: RateLimitInfo = {
  remaining: 5000,
  limit: 5000,
  resetAt: new Date(),
};

function updateRateLimit(headers: Headers) {
  const remaining = headers.get('x-ratelimit-remaining');
  const limit = headers.get('x-ratelimit-limit');
  const reset = headers.get('x-ratelimit-reset');

  if (remaining) rateLimitInfo.remaining = parseInt(remaining, 10);
  if (limit) rateLimitInfo.limit = parseInt(limit, 10);
  if (reset) rateLimitInfo.resetAt = new Date(parseInt(reset, 10) * 1000);
}

export function getRateLimit(): RateLimitInfo {
  return { ...rateLimitInfo };
}

async function githubFetch(endpoint: string, token: string): Promise<any> {
  if (rateLimitInfo.remaining < 10) {
    const waitMs = rateLimitInfo.resetAt.getTime() - Date.now();
    if (waitMs > 0) {
      throw new Error(
        `GitHub API rate limit nearly exhausted. Resets at ${rateLimitInfo.resetAt.toLocaleTimeString()}. ` +
        `Please wait ${Math.ceil(waitMs / 60000)} minutes.`
      );
    }
  }

  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitHubAchievementsTracker/1.0',
    },
  });

  updateRateLimit(response.headers);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid GitHub token. Please check your Personal Access Token.');
    }
    if (response.status === 403 && rateLimitInfo.remaining === 0) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function githubSearchCount(query: string, token: string): Promise<number> {
  const data = await githubFetch(
    `/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
    token
  );
  return data.total_count || 0;
}

export async function fetchProfile(token: string): Promise<GitHubProfile> {
  const data = await githubFetch('/user', token);
  return {
    username: data.login,
    avatarUrl: data.avatar_url,
    name: data.name || data.login,
    bio: data.bio || '',
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following,
    createdAt: data.created_at,
  };
}

export async function fetchMergedPRCount(username: string, token: string): Promise<number> {
  return githubSearchCount(`author:${username} type:pr is:merged`, token);
}

export async function fetchCoauthoredPRCount(username: string, token: string): Promise<number> {
  // Co-authored PRs are hard to track precisely. We search for PRs mentioning the user
  // that they didn't author — this is an estimate.
  try {
    return githubSearchCount(`commenter:${username} type:pr is:merged -author:${username}`, token);
  } catch {
    return 0; // estimated / fallback
  }
}

export async function fetchMaxRepoStars(username: string, token: string): Promise<number> {
  const repos = await githubFetch(
    `/users/${username}/repos?sort=stars&direction=desc&per_page=5&type=owner`,
    token
  );
  if (!repos || repos.length === 0) return 0;
  return Math.max(...repos.map((r: any) => r.stargazers_count || 0));
}

export async function fetchPRWithoutReview(username: string, token: string): Promise<number> {
  // Rough estimate: PRs merged by the user with 0 reviews
  // This is not 100% accurate but gives a reasonable estimate
  try {
    return githubSearchCount(`author:${username} type:pr is:merged review:none`, token);
  } catch {
    return 0;
  }
}

export async function fetchAllMetrics(username: string, token: string): Promise<SyncMetrics> {
  const [prsMerged, coauthored, maxStars, noReview] = await Promise.all([
    fetchMergedPRCount(username, token),
    fetchCoauthoredPRCount(username, token),
    fetchMaxRepoStars(username, token),
    fetchPRWithoutReview(username, token),
  ]);

  return {
    pullRequestsMerged: prsMerged,
    coauthoredPrsMerged: coauthored,
    repoMaxStars: maxStars,
    discussionAnswers: 0, // Cannot be tracked reliably via REST API
    prMergedWithoutReview: noReview,
    sponsorsCount: 0, // Cannot be tracked via API without special permissions
  };
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    await fetchProfile(token);
    return true;
  } catch {
    return false;
  }
}
