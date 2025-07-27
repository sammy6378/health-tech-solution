import { DetectedQuery } from '../interfaces/query-kinds';
import { INTENT_PATTERNS } from './intent';

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

export function detectQueryFromPrompt(prompt: string): DetectedQuery {
  const p = normalize(prompt);

  for (const intent of INTENT_PATTERNS) {
    for (const pattern of intent.patterns) {
      let match: RegExpMatchArray | null = null;

      if (typeof pattern === 'string') {
        if (!p.includes(pattern.toLowerCase())) continue;
      } else {
        match = p.match(pattern);
        if (!match) continue;
      }

      const args = intent.extractArgs
        ? (intent.extractArgs(match, prompt) ?? {})
        : {};

      return { kind: intent.kind, args, confidence: 1 };
    }
  }

  return { kind: 'unknown', args: {}, confidence: 0 };
}
