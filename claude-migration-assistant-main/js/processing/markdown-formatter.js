/**
 * Formats conversations as clean markdown files.
 */

export function formatConversationAsMarkdown(conversation) {
  const lines = [
    `# ${conversation.name || 'Untitled Conversation'}`,
    '',
    `**Created:** ${formatDate(conversation.created_at)}`,
    `**Updated:** ${formatDate(conversation.updated_at)}`,
    `**Messages:** ${conversation.chat_messages.length}`,
    '',
    '---',
    ''
  ];

  for (const msg of conversation.chat_messages) {
    const sender = msg.sender === 'human' ? 'Human' : 'Claude';
    lines.push(`## ${sender}`);
    lines.push('');

    let hasContent = false;

    for (const item of (msg.content || [])) {
      if (item.type === 'text' && item.text) {
        // Strip antArtifact tags, show as code blocks
        const cleaned = item.text.replace(
          /<antArtifact[^>]*>([\s\S]*?)<\/antArtifact>/g,
          (_, content) => '\n```\n' + content.trim() + '\n```\n'
        );
        lines.push(cleaned);
        lines.push('');
        hasContent = true;
      } else if (item.type === 'tool_use' && item.name === 'artifacts' && item.input) {
        lines.push(`**Artifact: ${item.input.title || 'Untitled'}**`);
        const lang = item.input.language || '';
        lines.push('```' + lang);
        lines.push((item.input.content || '').trim());
        lines.push('```');
        lines.push('');
        hasContent = true;
      }
    }

    // Fallback to text field
    if (!hasContent && msg.text) {
      const cleaned = msg.text.replace(
        /<antArtifact[^>]*>([\s\S]*?)<\/antArtifact>/g,
        (_, content) => '\n```\n' + content.trim() + '\n```\n'
      );
      lines.push(cleaned);
      lines.push('');
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function formatSummary(conversations, artifacts, contextDoc) {
  const totalMessages = conversations.reduce((n, c) => n + c.chat_messages.length, 0);
  const dates = conversations.map(c => c.created_at).filter(Boolean).sort();
  const dateStart = dates[0] ? formatDate(dates[0]) : 'Unknown';
  const dateEnd = dates[dates.length - 1] ? formatDate(dates[dates.length - 1]) : 'Unknown';

  const convsWithArtifacts = conversations.filter(c =>
    c.chat_messages.some(m =>
      m.content.some(ci => ci.type === 'tool_use' && ci.name === 'artifacts') ||
      (m.text && m.text.includes('<antArtifact'))
    )
  );

  const lines = [
    '# Migration Summary',
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Statistics',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total conversations | ${conversations.length} |`,
    `| Total messages | ${totalMessages} |`,
    `| Conversations with artifacts | ${convsWithArtifacts.length} |`,
    `| Extracted artifacts | ${artifacts.length} |`,
    `| Date range | ${dateStart} to ${dateEnd} |`,
    '',
    '## Top Conversations (by message count)',
    '',
  ];

  const topConvs = [...conversations]
    .sort((a, b) => b.chat_messages.length - a.chat_messages.length)
    .slice(0, 10);

  for (const conv of topConvs) {
    lines.push(`- **${conv.name}** (${conv.chat_messages.length} messages, ${formatDate(conv.updated_at)})`);
  }

  lines.push('');
  lines.push('## What Transferred');
  lines.push('');
  lines.push('- Conversation text: Exact copy as markdown files');
  lines.push('- Artifact source code: Extracted as individual files');
  lines.push('- Context document: Auto-generated from keyword analysis');
  lines.push('- Memory import script: Suggested memory edits');
  lines.push('');
  lines.push('## What Did NOT Transfer');
  lines.push('');
  lines.push('- Interactive artifact rendering (must re-create in new account)');
  lines.push('- Claude\'s synthesized memory (use Track B manual steps)');
  lines.push('- Project structure (must recreate manually)');
  lines.push('- Style preferences and feature toggles');
  lines.push('');
  lines.push('## Next Steps');
  lines.push('');
  lines.push('1. Review the context document and edit for accuracy');
  lines.push('2. Mark important artifacts for migration');
  lines.push('3. Complete Track B manual steps in the webapp');

  return lines.join('\n');
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
