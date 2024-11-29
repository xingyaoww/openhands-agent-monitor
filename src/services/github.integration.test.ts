import { describe, it, expect } from 'vitest';
import { fetchBotActivities } from './github';
import type { BotActivity } from '../types';

describe('GitHub Service Integration Tests', () => {
  // Skip these tests if VITE_GITHUB_TOKEN is not set
  const runTest = import.meta.env['VITE_GITHUB_TOKEN'] !== undefined && import.meta.env['VITE_GITHUB_TOKEN'] !== '' ? it : it.skip;

  runTest('should fetch real bot activities from OpenHands repository', async () => {
    const activities = await fetchBotActivities();
    
    // Verify we got some activities
    expect(activities.length).toBeGreaterThan(0);

    // Verify each activity has the required fields
    const expectedFields: Record<keyof BotActivity, unknown> = {
      id: expect.any(String),
      type: expect.stringMatching(/^(issue|pr)$/),
      status: expect.stringMatching(/^(success|failure)$/),
      timestamp: expect.any(String),
      url: expect.stringMatching(/^https:\/\/github\.com\//),
      description: expect.any(String),
    };

    for (const activity of activities) {
      expect(activity).toMatchObject(expectedFields);

      // Verify the timestamp is a valid date
      expect(new Date(activity.timestamp).toString()).not.toBe('Invalid Date');

      // Verify the URL points to the correct repository
      expect(activity.url).toContain('All-Hands-AI/OpenHands');
    }

    // Log some stats to help with debugging
    const issueCount = activities.filter(a => a.type === 'issue').length;
    const prCount = activities.filter(a => a.type === 'pr').length;
    const successCount = activities.filter(a => a.status === 'success').length;
    const failureCount = activities.filter(a => a.status === 'failure').length;

    console.log(`Found ${activities.length.toString()} activities:`);
    console.log(`- Issues: ${issueCount.toString()}`);
    console.log(`- PRs: ${prCount.toString()}`);
    console.log(`- Successes: ${successCount.toString()}`);
    console.log(`- Failures: ${failureCount.toString()}`);

    // Print the first activity for manual verification
    if (activities.length > 0) {
      console.log('\nFirst activity:', JSON.stringify(activities[0], null, 2));
    }
  }, 30000); // Increase timeout to 30s for API calls
});
