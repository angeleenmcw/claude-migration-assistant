/**
 * Generates context-document.md by analyzing all conversations.
 * Uses keyword frequency, tech term detection, and preference extraction.
 */

import { getMessageText, getDateRange } from './conversation-parser.js';

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'to','of','in','for','on','with','at','by','from','as','into','through',
  'during','before','after','above','below','between','out','off','over','under',
  'again','then','once','here','there','when','where','why','how','all','each',
  'every','both','few','more','most','other','some','such','no','not','only',
  'own','same','so','than','too','very','just','because','but','and','or','if',
  'while','about','up','down','this','that','these','those','i','me','my','we',
  'our','you','your','it','its','they','them','their','what','which','who',
  'whom','he','she','him','her','please','thanks','thank','like','want','need',
  'know','think','also','well','make','use','get','go','see','new','one','two',
  'way','thing','much','many','right','good','bad','first','last','long','great',
  'little','own','old','right','big','high','different','small','large','next',
  'early','young','important','public','people','time','year','years','work',
  'still','back','even','give','day','help','line','turn','keep','show','let',
  'say','said','look','find','come','made','after','take','put','tell','try',
  'hand','point','end','part','start','might','able','sure','using','used',
  'something','don','doesn','didn','won','wouldn','couldn','shouldn','isn','aren',
  'wasn','weren','haven','hasn','hadn','really','actually','going','want','yes',
  'yeah','okay','hey','hi','hello','ok'
]);

const TECH_TERMS = [
  'react','vue','angular','svelte','nextjs','next.js','nuxt','gatsby',
  'python','javascript','typescript','rust','golang','java','kotlin','swift',
  'ruby','php','scala','elixir','haskell','clojure','dart','flutter',
  'node','nodejs','express','fastapi','django','flask','rails','spring',
  'docker','kubernetes','k8s','terraform','ansible','pulumi',
  'aws','lambda','s3','ec2','dynamodb','cloudfront','sqs','sns',
  'gcp','azure','firebase','supabase','vercel','netlify','railway',
  'postgres','postgresql','mysql','mongodb','redis','sqlite','elasticsearch',
  'prisma','drizzle','sequelize','mongoose','typeorm',
  'git','github','gitlab','bitbucket','ci/cd','jenkins','circleci',
  'tailwind','tailwindcss','css','sass','styled-components','emotion',
  'webpack','vite','esbuild','rollup','parcel','turbopack',
  'graphql','rest','grpc','websocket','api','oauth','jwt',
  'machine learning','deep learning','neural network','llm','gpt','claude',
  'openai','anthropic','langchain','embeddings','rag','vector database',
  'tensorflow','pytorch','scikit-learn','pandas','numpy','jupyter',
  'testing','jest','pytest','cypress','playwright','selenium',
  'figma','sketch','storybook','design system',
  'agile','scrum','kanban','jira','notion','linear','confluence',
  'stripe','twilio','sendgrid','auth0','clerk',
  'nginx','apache','caddy','cloudflare',
  'markdown','json','yaml','toml','xml','csv',
  'linux','macos','windows','ubuntu','debian',
  'vim','neovim','vscode','emacs','cursor',
  'bash','zsh','powershell','tmux',
  'sql','nosql','timeseries','influxdb','clickhouse','bigquery',
  'kafka','rabbitmq','nats','celery',
  'prometheus','grafana','datadog','sentry','pagerduty'
];

export function generateContextDocument(conversations) {
  const humanMessages = [];
  for (const conv of conversations) {
    for (const msg of conv.chat_messages) {
      if (msg.sender !== 'human') continue;
      humanMessages.push({
        text: getMessageText(msg),
        conversationId: conv.uuid,
        conversationName: conv.name
      });
    }
  }

  const topTopics = extractTopics(humanMessages, conversations.length);
  const techMentions = detectTechTerms(humanMessages);
  const preferences = detectPreferences(humanMessages);
  const recentSummaries = summarizeRecent(conversations);
  const dateRange = getDateRange(conversations);

  return assembleDocument({
    topTopics,
    techMentions,
    preferences,
    recentSummaries,
    totalConversations: conversations.length,
    totalMessages: conversations.reduce((n, c) => n + c.chat_messages.length, 0),
    dateRange
  });
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s.#+-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function extractTopics(messages, totalConvs) {
  const convTerms = new Map(); // convId -> Set<term>

  for (const msg of messages) {
    const tokens = tokenize(msg.text);
    if (!convTerms.has(msg.conversationId)) {
      convTerms.set(msg.conversationId, new Set());
    }
    const termSet = convTerms.get(msg.conversationId);
    for (const token of tokens) {
      if (!STOP_WORDS.has(token)) {
        termSet.add(token);
      }
    }
  }

  // Count how many conversations each term appears in
  const termConvCount = new Map();
  for (const [, terms] of convTerms) {
    for (const term of terms) {
      termConvCount.set(term, (termConvCount.get(term) || 0) + 1);
    }
  }

  // Filter: at least 2 conversations, not in >80% of conversations
  const maxConvs = totalConvs * 0.8;
  const scored = [];
  for (const [term, count] of termConvCount) {
    if (count >= 2 && count < maxConvs) {
      scored.push({ term, count });
    }
  }

  scored.sort((a, b) => b.count - a.count);
  return scored.slice(0, 25);
}

function detectTechTerms(messages) {
  const allText = messages.map(m => m.text.toLowerCase()).join(' ');
  const counts = [];

  for (const term of TECH_TERMS) {
    const pattern = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi');
    const matches = allText.match(pattern);
    if (matches && matches.length > 0) {
      counts.push({ term, count: matches.length });
    }
  }

  counts.sort((a, b) => b.count - a.count);
  return counts.slice(0, 30);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PREFERENCE_PATTERNS = [
  { pattern: /i (?:always |usually |prefer to |like to )(.{10,120})/gi, type: 'preference' },
  { pattern: /please (?:always |never |make sure to )(.{10,120})/gi, type: 'instruction' },
  { pattern: /i(?:'m| am) (?:a |an |the )(.{5,80})/gi, type: 'identity' },
  { pattern: /i work (?:at|for|on|with|in) (.{5,80})/gi, type: 'work' },
  { pattern: /my (?:team|company|role|job|title|name) (?:is|are) (.{5,80})/gi, type: 'identity' },
];

function detectPreferences(messages) {
  const found = new Map();

  for (const msg of messages) {
    const text = msg.text;
    for (const { pattern, type } of PREFERENCE_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fact = match[1].trim().replace(/[.!?]+$/, '');
        if (fact.length < 10 || fact.length > 150) continue;
        const key = fact.toLowerCase().replace(/\s+/g, ' ');
        if (!found.has(key)) {
          found.set(key, { text: match[0].trim(), type, count: 0 });
        }
        found.get(key).count++;
      }
    }
  }

  return Array.from(found.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

function summarizeRecent(conversations) {
  const substantive = conversations
    .filter(c => c.chat_messages.length > 4)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 20);

  return substantive.map(conv => {
    const firstHuman = conv.chat_messages.find(m => m.sender === 'human');
    const firstHumanText = firstHuman ? getMessageText(firstHuman).slice(0, 200) : '';

    return {
      name: conv.name,
      date: conv.updated_at,
      messageCount: conv.chat_messages.length,
      firstMessage: firstHumanText
    };
  });
}

function formatDate(isoString) {
  if (!isoString) return 'Unknown';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return isoString;
  }
}

function assembleDocument({ topTopics, techMentions, preferences, recentSummaries,
  totalConversations, totalMessages, dateRange }) {

  const lines = [
    '# Migration Context Document',
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    `**Source:** ${totalConversations} conversations, ${totalMessages} messages`,
    `**Date range:** ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`,
    '',
    '> This document is machine-generated from conversation text. It supplements',
    '> but does not replace the manual memory capture (Track B). Review and edit',
    '> for accuracy before uploading to your new account.',
    '',
    '---',
    '',
  ];

  // Topics
  if (topTopics.length > 0) {
    lines.push('## Frequently Discussed Topics');
    lines.push('');
    for (const { term, count } of topTopics) {
      lines.push(`- **${term}** - mentioned across ${count} conversations`);
    }
    lines.push('');
  }

  // Technologies
  if (techMentions.length > 0) {
    lines.push('## Technologies and Tools');
    lines.push('');
    for (const { term, count } of techMentions) {
      lines.push(`- **${term}** (${count} mentions)`);
    }
    lines.push('');
  }

  // Preferences
  if (preferences.length > 0) {
    lines.push('## Detected Preferences and Patterns');
    lines.push('');
    for (const pref of preferences) {
      const badge = pref.type === 'identity' ? '[Identity]'
        : pref.type === 'work' ? '[Work]'
        : pref.type === 'instruction' ? '[Instruction]'
        : '[Preference]';
      lines.push(`- ${badge} "${pref.text}"`);
    }
    lines.push('');
  }

  // Recent conversations
  if (recentSummaries.length > 0) {
    lines.push('## Recent Conversation Summaries');
    lines.push('');
    for (const conv of recentSummaries) {
      lines.push(`### ${conv.name} (${formatDate(conv.date)})`);
      lines.push(`*${conv.messageCount} messages*`);
      lines.push('');
      if (conv.firstMessage) {
        lines.push(`> ${conv.firstMessage}${conv.firstMessage.length >= 200 ? '...' : ''}`);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}
