/**
 * Generates memory-import-script.txt by extracting likely memory-worthy facts
 * from human messages in conversations.
 */

import { getMessageText } from './conversation-parser.js';

const MEMORY_PATTERNS = [
  /i (?:always |usually |prefer to |like to )(.{10,180})/gi,
  /please (?:always |never |make sure to |remember to )(.{10,180})/gi,
  /i(?:'m| am) (?:a |an |the )(.{5,150})/gi,
  /i work (?:at|for|on|with|in) (.{5,150})/gi,
  /my (?:team|company|role|job|title|name|stack|tech) (?:is|are|includes?) (.{5,150})/gi,
  /i(?:'ve| have) been (?:working on|building|developing|using) (.{5,150})/gi,
  /(?:call me|i go by|my name is) (.{2,80})/gi,
  /i (?:use|prefer|rely on) (.{3,100}) (?:for|to|when)/gi,
];

export function generateMemoryScript(conversations) {
  const facts = new Map();

  for (const conv of conversations) {
    for (const msg of conv.chat_messages) {
      if (msg.sender !== 'human') continue;
      const text = getMessageText(msg);

      for (const pattern of MEMORY_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const fullMatch = match[0].trim();
          const fact = cleanFact(fullMatch);
          if (!fact || fact.length < 10 || fact.length > 200) continue;

          const key = fact.toLowerCase().replace(/\s+/g, ' ');
          if (!facts.has(key)) {
            facts.set(key, { original: fact, count: 0 });
          }
          facts.get(key).count++;
        }
      }
    }
  }

  // Sort by frequency, take top 30
  const topFacts = Array.from(facts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  if (topFacts.length === 0) {
    return [
      '# Memory Import Script',
      '',
      '# No strong preference patterns were detected in your conversations.',
      '# Use the manual memory capture in Track B step B1 instead.',
    ].join('\n');
  }

  const lines = [
    '# Memory Import Script',
    '#',
    '# Paste these into a new conversation in your new Claude account.',
    '# Send them in batches of 5-10 at a time.',
    '# Review each one -- skip any that are outdated or incorrect.',
    '# Note: Claude has a maximum of 30 memory edit slots.',
    '',
  ];

  for (let i = 0; i < topFacts.length; i++) {
    lines.push(`Please remember: ${topFacts[i].original}`);
  }

  return lines.join('\n');
}

function cleanFact(text) {
  return text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .trim();
}
