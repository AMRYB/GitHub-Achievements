import { SyncResult, SyncJob } from '@/types';
import { fetchProfile, fetchAllMetrics } from './github';
import { calculateAllProgress } from './progress';
import * as storage from './storage';

export async function runSync(token: string): Promise<SyncResult> {
  const jobId = Date.now().toString();
  const job: SyncJob = {
    id: jobId,
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
    errorMessage: null,
    metrics: null,
  };

  try {
    // Step 1: Fetch profile
    const profile = await fetchProfile(token);
    await storage.saveProfile(profile);

    // Step 2: Fetch all metrics
    const metrics = await fetchAllMetrics(profile.username, token);

    // Step 3: Calculate progress
    const progress = calculateAllProgress(metrics);
    await storage.saveProgress(progress);

    // Step 4: Build result
    const result: SyncResult = {
      profile,
      metrics,
      syncedAt: new Date().toISOString(),
      errors: [],
      rateLimitRemaining: 0, // will be set by github service
    };

    await storage.saveLastSync(result);

    // Update job
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.metrics = metrics;

    // Save to history
    const history = await storage.getSyncHistory();
    history.push(job);
    await storage.saveSyncHistory(history);

    return result;
  } catch (error) {
    job.status = 'failed';
    job.completedAt = new Date().toISOString();
    job.errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const history = await storage.getSyncHistory();
    history.push(job);
    await storage.saveSyncHistory(history);

    throw error;
  }
}
