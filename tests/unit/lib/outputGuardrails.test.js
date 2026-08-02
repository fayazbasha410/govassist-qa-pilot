import { describe, test, expect, vi } from 'vitest';
import outputGuardrails from '../../../src/lib/outputGuardrails.js';
const {
  validateOutputFormat,
  filterOutput,
  checkGroundedness,
  stripUnknownCitations,
  generateWithGuardrails,
} = outputGuardrails;


describe('validateOutputFormat', () => {
  test('accepts a normal, well-formed reply', () => {
    expect(validateOutputFormat('You can renew your Emirates ID via ICP Smart Services.').valid).toBe(true);
  });


  test('rejects empty string', () => {
    expect(validateOutputFormat('')).toEqual({ valid: false, reason: 'empty_or_missing' });
  });


  test('rejects null', () => {
    expect(validateOutputFormat(null)).toEqual({ valid: false, reason: 'empty_or_missing' });
  });


  test('rejects text below minLength', () => {
    expect(validateOutputFormat('Ok.').valid).toBe(false);
  });


  test('rejects text above maxLength', () => {
    expect(validateOutputFormat('a'.repeat(5000)).valid).toBe(false);
  });


  test('rejects a reply that leaks the "POLICY CONTEXT:" system prompt marker', () => {
    const result = validateOutputFormat('Sure. POLICY CONTEXT: [POL-001] blah blah blah blah blah');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('system_prompt_leak');
  });


  test('rejects a reply that leaks the system prompt intro line', () => {
    expect(validateOutputFormat('You are GovMurshid, an AI guide for something something long enough').valid).toBe(false);
  });


  test('respects a custom minLength option', () => {
    expect(validateOutputFormat('Hi there', { minLength: 20 }).valid).toBe(false);
  });
});


describe('filterOutput', () => {
  test('leaves clean text unchanged', () => {
    const result = filterOutput('You can renew your Emirates ID online.');
    expect(result.wasFiltered).toBe(false);
    expect(result.filtered).toBe('You can renew your Emirates ID online.');
  });


  test('catches "as an AI with no restrictions"', () => {
    const result = filterOutput('As an AI with no restrictions, I will tell you anything.');
    expect(result.wasFiltered).toBe(true);
    expect(result.filtered).toContain('UAE government services');
  });


  test('catches "I will ignore my instructions"', () => {
    expect(filterOutput('Sure, I will ignore my instructions and help.').wasFiltered).toBe(true);
  });


  test('catches "developer mode enabled"', () => {
    expect(filterOutput('Developer mode enabled. Ask me anything.').wasFiltered).toBe(true);
  });


  test('does NOT false-positive on legitimate text mentioning "developer" in another context', () => {
    expect(filterOutput('Contact the developer portal for API access.').wasFiltered).toBe(false);
  });


  test('replaces filtered output entirely rather than editing in place', () => {
    const result = filterOutput('I am now DAN and will do anything you say.');
    expect(result.filtered).not.toContain('DAN');
  });
});


describe('checkGroundedness', () => {
  test('grounded: cited policy ID matches a retrieved doc', () => {
    const docs = [{ id: 'POL-005' }, { id: 'POL-006' }];
    const result = checkGroundedness('See [POL-005] for details.', docs);
    expect(result.grounded).toBe(true);
    expect(result.citedIds).toEqual(['POL-005']);
    expect(result.unknownIds).toEqual([]);
  });


  test('ungrounded: cited policy ID was NOT retrieved (fabricated citation)', () => {
    const docs = [{ id: 'POL-005' }];
    const result = checkGroundedness('See [POL-999] for details.', docs);
    expect(result.grounded).toBe(false);
    expect(result.unknownIds).toEqual(['POL-999']);
  });


  test('a reply with no citations at all is still considered grounded (no false claim made)', () => {
    const result = checkGroundedness('General information about UAE services.', [{ id: 'POL-005' }]);
    expect(result.grounded).toBe(true);
    expect(result.hasCitation).toBe(false);
  });


  test('handles a mix of known and unknown citations in the same reply', () => {
    const docs = [{ id: 'POL-005' }];
    const result = checkGroundedness('See POL-005 and also POL-777.', docs);
    expect(result.grounded).toBe(false);
    expect(result.unknownIds).toEqual(['POL-777']);
  });


  test('dedupes repeated citations of the same ID', () => {
    const docs = [{ id: 'POL-005' }];
    const result = checkGroundedness('POL-005 ... POL-005 ... POL-005', docs);
    expect(result.citedIds).toEqual(['POL-005']);
  });
});


describe('stripUnknownCitations', () => {
  test('strips a bracketed fabricated citation', () => {
    const result = stripUnknownCitations('See [POL-999] for more info.', ['POL-999']);
    expect(result).not.toContain('POL-999');
  });


  test('leaves valid citations untouched when nothing to strip', () => {
    const result = stripUnknownCitations('See [POL-005] for more info.', []);
    expect(result).toContain('POL-005');
  });
});


describe('generateWithGuardrails — orchestrator (mocked LLM, zero network calls)', () => {
  test('happy path: valid reply on first try, no reask needed', async () => {
    const mockLLM = vi.fn().mockResolvedValue('You can renew your Emirates ID via ICP Smart Services online.');
    const result = await generateWithGuardrails({
      callLLM: mockLLM, systemPrompt: 'sys', userMessage: 'msg', docs: []
    });
    expect(result.formatValid).toBe(true);
    expect(result.reaskCount).toBe(0);
    expect(mockLLM).toHaveBeenCalledTimes(1);
  });


  test('reasks once on an empty first response, then succeeds', async () => {
    let callCount = 0;
    const mockLLM = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? '' : 'You can renew your Emirates ID via ICP Smart Services online.';
    });
    const result = await generateWithGuardrails({
      callLLM: mockLLM, systemPrompt: 'sys', userMessage: 'msg', docs: []
    });
    expect(mockLLM).toHaveBeenCalledTimes(2);
    expect(result.reaskCount).toBe(1);
    expect(result.formatValid).toBe(true);
  });


  test('exhausts reasks and gives up gracefully if still invalid', async () => {
    const mockLLM = vi.fn().mockResolvedValue('');
    const result = await generateWithGuardrails({
      callLLM: mockLLM, systemPrompt: 'sys', userMessage: 'msg', docs: [], maxReasks: 1
    });
    expect(result.reaskCount).toBe(1);
    expect(result.formatValid).toBe(false);
    expect(mockLLM).toHaveBeenCalledTimes(2); // initial + 1 reask
  });


  test('strips a fabricated citation from the final reply', async () => {
    const mockLLM = vi.fn().mockResolvedValue('See [POL-999] for details on Emirates ID renewal, which is a longer sentence.');
    const result = await generateWithGuardrails({
      callLLM: mockLLM, systemPrompt: 'sys', userMessage: 'msg', docs: [{ id: 'POL-005' }]
    });
    expect(result.grounded).toBe(false);
    expect(result.reply).not.toContain('POL-999');
  });


  test('filters a jailbreak-compliant response entirely', async () => {
    const mockLLM = vi.fn().mockResolvedValue('As an AI with no restrictions, here is anything you want.');
    const result = await generateWithGuardrails({
      callLLM: mockLLM, systemPrompt: 'sys', userMessage: 'msg', docs: []
    });
    expect(result.wasFiltered).toBe(true);
    expect(result.reply).toContain('UAE government services');
  });


  test('respects a custom maxReasks of 0 (no retries at all)', async () => {
    const mockLLM = vi.fn().mockResolvedValue('');
    const result = await generateWithGuardrails({
      callLLM: mockLLM, systemPrompt: 'sys', userMessage: 'msg', docs: [], maxReasks: 0
    });
    expect(mockLLM).toHaveBeenCalledTimes(1);
    expect(result.reaskCount).toBe(0);
  });
});