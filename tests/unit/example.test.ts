/**
 * Simple test to verify Bun test runner setup
 */
import { describe, expect, it } from 'bun:test';

describe('Example test', () => {
  it('should pass to confirm test runner is working', () => {
    expect(true).toBe(true);
  });
});
