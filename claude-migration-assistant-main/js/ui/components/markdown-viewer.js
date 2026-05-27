import { escapeHtml } from '../../utils.js';

export function createMarkdownViewer(container, options = {}) {
  const {
    markdown = '',
    editable = false,
    onChange = null
  } = options;

  let currentMode = 'preview';
  let currentMarkdown = markdown;

  function renderTabs() {
    if (!editable) return '';
    return `
      <div class="md-tabs">
        <button class="md-tabs__tab ${currentMode === 'preview' ? 'md-tabs__tab--active' : ''}" data-mode="preview">Preview</button>
        <button class="md-tabs__tab ${currentMode === 'edit' ? 'md-tabs__tab--active' : ''}" data-mode="edit">Edit</button>
      </div>
    `;
  }

  function render() {
    container.innerHTML = `
      ${renderTabs()}
      <div id="md-content"></div>
    `;

    const contentEl = container.querySelector('#md-content');

    if (currentMode === 'preview') {
      contentEl.innerHTML = `<div class="md-preview">${renderMarkdown(currentMarkdown)}</div>`;
    } else {
      contentEl.innerHTML = `<textarea class="md-editor">${escapeHtml(currentMarkdown)}</textarea>`;
      const textarea = contentEl.querySelector('.md-editor');
      textarea.addEventListener('input', () => {
        currentMarkdown = textarea.value;
        if (onChange) onChange(currentMarkdown);
      });
    }

    // Wire tab clicks
    if (editable) {
      container.querySelectorAll('.md-tabs__tab').forEach(tab => {
        tab.addEventListener('click', () => {
          currentMode = tab.dataset.mode;
          render();
        });
      });
    }
  }

  render();

  return {
    getContent() { return currentMarkdown; },
    setContent(md) {
      currentMarkdown = md;
      render();
    }
  };
}

function renderMarkdown(md) {
  if (typeof marked !== 'undefined' && marked.parse) {
    try {
      const raw = marked.parse(md);
      return sanitizeHtml(raw);
    } catch (e) {
      console.warn('Markdown parse error:', e);
    }
  }
  // Fallback: simple whitespace preservation
  return `<pre style="white-space: pre-wrap;">${escapeHtml(md)}</pre>`;
}

function sanitizeHtml(html) {
  // Strip script/iframe/object/embed tags and on* event attributes
  return html
    .replace(/<\s*(script|iframe|object|embed|form|base|meta|link)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|form|base|meta|link)[^>]*\/?>/gi, '')
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

