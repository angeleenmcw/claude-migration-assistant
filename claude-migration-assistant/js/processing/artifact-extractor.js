/**
 * Extracts artifacts from conversations using two approaches:
 * 1. Structured content array (tool_use items)
 * 2. Regex on text field (fallback for older exports)
 */

const TYPE_TO_EXT = {
  'application/vnd.ant.react': 'jsx',
  'application/vnd.ant.code': null,  // Use language field
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
  'text/x-python': 'py',
  'text/python': 'py',
  'text/markdown': 'md',
  'text/plain': 'txt',
  'image/svg+xml': 'svg',
  'application/vnd.ant.mermaid': 'mmd',
  'application/json': 'json',
};

const LANG_TO_EXT = {
  'python': 'py',
  'javascript': 'js',
  'typescript': 'ts',
  'jsx': 'jsx',
  'tsx': 'tsx',
  'html': 'html',
  'css': 'css',
  'sql': 'sql',
  'bash': 'sh',
  'shell': 'sh',
  'ruby': 'rb',
  'go': 'go',
  'rust': 'rs',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'c++': 'cpp',
  'json': 'json',
  'yaml': 'yaml',
  'yml': 'yaml',
  'toml': 'toml',
  'xml': 'xml',
  'markdown': 'md',
  'swift': 'swift',
  'kotlin': 'kt',
};

export function extractArtifacts(conversations) {
  const artifactMap = new Map();

  for (const conv of conversations) {
    for (const msg of conv.chat_messages) {
      if (msg.sender !== 'assistant') continue;

      // Path 1: Structured content array
      extractFromContent(msg, conv, artifactMap);

      // Path 2: Regex on text field
      extractFromText(msg, conv, artifactMap);
    }
  }

  return Array.from(artifactMap.values());
}

function extractFromContent(msg, conv, artifactMap) {
  if (!msg.content) return;

  for (const item of msg.content) {
    if (item.type !== 'tool_use' || item.name !== 'artifacts' || !item.input) continue;

    const input = item.input;
    const id = input.id || input.version_uuid || `gen-${Math.random().toString(36).slice(2, 10)}`;

    const artifact = {
      id,
      title: input.title || 'Untitled',
      type: input.type || 'text/plain',
      language: input.language || null,
      content: input.content || '',
      sourceConversationId: conv.uuid,
      sourceConversationName: conv.name,
      timestamp: msg.created_at,
      extractionMethod: 'structured'
    };

    artifact.extension = getExtension(artifact.type, artifact.language);
    artifact.fileName = buildFileName(artifact);

    // Keep latest version by ID
    const existing = artifactMap.get(id);
    if (!existing || artifact.timestamp > existing.timestamp) {
      artifactMap.set(id, artifact);
    }
  }
}

function extractFromText(msg, conv, artifactMap) {
  if (!msg.text || !msg.text.includes('<antArtifact')) return;

  // Regex with lookaheads for attribute-order independence
  const regex = /<antArtifact\s+([^>]*)>([\s\S]*?)<\/antArtifact>/g;
  let match;

  while ((match = regex.exec(msg.text)) !== null) {
    const attrString = match[1];
    const content = match[2];

    const identifier = extractAttr(attrString, 'identifier');
    const type = extractAttr(attrString, 'type');
    const title = extractAttr(attrString, 'title');
    const language = extractAttr(attrString, 'language');

    if (!identifier) continue;

    // Only add if not already found via structured path
    if (artifactMap.has(identifier)) continue;

    const artifact = {
      id: identifier,
      title: title || 'Untitled',
      type: type || 'text/plain',
      language: language || null,
      content: content.trim(),
      sourceConversationId: conv.uuid,
      sourceConversationName: conv.name,
      timestamp: msg.created_at,
      extractionMethod: 'regex'
    };

    artifact.extension = getExtension(artifact.type, artifact.language);
    artifact.fileName = buildFileName(artifact);
    artifactMap.set(identifier, artifact);
  }
}

function extractAttr(attrString, name) {
  const regex = new RegExp(`${name}="([^"]*)"`, 'i');
  const match = attrString.match(regex);
  return match ? match[1] : null;
}

function getExtension(type, language) {
  // Check type mapping first
  const fromType = TYPE_TO_EXT[type];
  if (fromType) return fromType;

  // Check language field
  if (language) {
    const lang = language.toLowerCase();
    if (LANG_TO_EXT[lang]) return LANG_TO_EXT[lang];
    // Language itself might be a valid extension
    if (lang.length <= 5 && /^[a-z]+$/.test(lang)) return lang;
  }

  return 'txt';
}

function buildFileName(artifact) {
  const slug = slugify(artifact.title);
  const hash = artifact.id.slice(0, 6);
  return `${slug}-${hash}.${artifact.extension}`;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'untitled';
}

export function buildArtifactIndex(artifacts) {
  return artifacts.map(a => ({
    id: a.id,
    title: a.title,
    type: a.type,
    language: a.language,
    fileName: a.fileName,
    sourceConversationId: a.sourceConversationId,
    sourceConversationName: a.sourceConversationName,
    extractionMethod: a.extractionMethod,
    contentLength: a.content.length
  }));
}
