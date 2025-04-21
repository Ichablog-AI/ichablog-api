import { describe, expect, it } from 'bun:test';
import { baseLogger } from '@be//utils/logger.js';
import loggerRegistry from '@be/services/LoggerRegistry.js';

describe('LoggerRegistry', () => {
  it('returns the same child logger for the same name', () => {
    const log1 = loggerRegistry.getLogger('test');
    const log2 = loggerRegistry.getLogger('test');
    expect(log1).toBe(log2);
  });

  it('child logger has correct loggerName property', () => {
    const name = 'childLoggerAlpha';
    const childLogger = loggerRegistry.getLogger(name);
    expect(childLogger.bindings().loggerName).toBe(name);
  });

  it('getBaseLogger returns the base logger instance', () => {
    const base = loggerRegistry.getBaseLogger();
    expect(base).toBe(baseLogger);
  });

  it('returns different child loggers for different names', () => {
    const loggerA = loggerRegistry.getLogger('loggerA');
    const loggerB = loggerRegistry.getLogger('loggerB');
    expect(loggerA).not.toBe(loggerB);
  });

  it('child logger is a child of base logger with shared methods', () => {
    const child = loggerRegistry.getLogger('child');
    const base = loggerRegistry.getBaseLogger();
    // They should share common logging method names like info, debug, error
    expect(typeof child.info).toBe('function');
    expect(typeof base.info).toBe('function');
    expect(typeof child.debug).toBe('function');
    expect(typeof base.debug).toBe('function');
    expect(child).not.toBe(base);
    expect(child.bindings).toBeDefined();
  });

  it('handles edge case logger names', () => {
    const emptyNameLogger = loggerRegistry.getLogger('');
    expect(emptyNameLogger.bindings().loggerName).toBe('');
    const specialName = '@#$%^&*()_+{}|"<>?';
    const specialLogger = loggerRegistry.getLogger(specialName);
    expect(specialLogger.bindings().loggerName).toBe(specialName);
  });

  it('returns same logger instance on repeated rapid calls with same name', () => {
    const iterations = 50;
    const loggers = [];
    for (let i = 0; i < iterations; i++) {
      loggers.push(loggerRegistry.getLogger('rapidCall'));
    }
    for (let i = 1; i < iterations; i++) {
      expect(loggers[0]).toBe(loggers[i]);
    }
  });
});
