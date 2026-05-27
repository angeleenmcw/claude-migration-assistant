import { updateStep, getState } from '../../state.js';
import { escapeHtml } from '../../utils.js';
import { createCopyableBlock } from '../components/copyable-block.js';
import { PROMPTS } from '../../data/prompts.js';
import { icon } from '../components/icon.js';

export function render(container, stepState, globalState) {
  const memoryScript = globalState.exportData.memoryScript || '';
  const memoryEdits = parseMemoryEdits(memoryScript);
  const processed = stepState.memoryEditsProcessed || {};

  container.innerHTML = `
    <div class="step-section">
      <div class="step-section__title">Step 1: Bulk Context Seeding</div>
      <div class="step-section__description">
        Open a new conversation in your <strong>new account</strong>. Upload both
        <code>context-document.md</code> (from Track A) and <code>memory-capture.md</code>
        (from step B1). Then send this prompt:
      </div>
      <div id="b3-seed-prompt"></div>
    </div>

    <div class="step-section">
      <div class="step-section__title">Step 2: Individual Memory Edits</div>
      <div class="step-section__description">
        These memory-worthy facts were extracted from your conversations. Copy and paste them
        in batches to your new account. Mark each as sent or skipped.
      </div>

      <div class="info-box info-box--warning" style="margin-bottom: var(--space-md);">
        <span class="info-box__icon">${icon('alert-triangle', 16)}</span>
        <span>Claude has a maximum of 30 memory edit slots. Prioritize edits that capture
        information NOT already in Claude's synthesized memory from Step 1.</span>
      </div>

      <div id="b3-edits"></div>
    </div>

    <div class="step-actions">
      <label class="checkbox">
        <input type="checkbox" class="checkbox__input" id="b3-done" ${stepState.completed ? 'checked' : ''}>
        <span class="checkbox__label">Memory restoration complete</span>
      </label>
    </div>
  `;

  createCopyableBlock(container.querySelector('#b3-seed-prompt'), {
    text: PROMPTS.memoryRestore,
    label: 'Prompt to send with uploaded documents'
  });

  const editsContainer = container.querySelector('#b3-edits');

  if (memoryEdits.length === 0) {
    editsContainer.innerHTML = `
      <div style="padding: var(--space-md); text-align: center; color: var(--color-text-muted); font-size: var(--font-size-sm);">
        No memory edits generated. Complete step A2 first, or use the manual approach in Step 1 above.
      </div>
    `;
  } else {
    renderEdits(editsContainer, memoryEdits, processed);
  }

  const cb = container.querySelector('#b3-done');
  cb.addEventListener('change', () => {
    updateStep('b3', { completed: cb.checked });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderEdits(container, edits, processed) {
  const sentCount = Object.values(processed).filter(v => v === 'sent').length;
  const skippedCount = Object.values(processed).filter(v => v === 'skipped').length;

  container.innerHTML = `
    <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: var(--space-sm);">
      ${sentCount} sent, ${skippedCount} skipped, ${edits.length - sentCount - skippedCount} remaining
    </div>
    <div id="b3-edit-list"></div>
    <button class="btn" id="b3-copy-remaining" style="margin-top: var(--space-sm);">
      ${icon('clipboard', 14)}
      Copy All Remaining
    </button>
  `;

  const listEl = container.querySelector('#b3-edit-list');

  for (let i = 0; i < edits.length; i++) {
    const edit = edits[i];
    const status = processed[i];
    const item = document.createElement('div');
    item.className = `memory-edit-item ${status ? 'memory-edit-item--processed' : ''}`;
    item.innerHTML = `
      <span class="memory-edit-item__number">${i + 1}</span>
      <span class="memory-edit-item__text">${escapeHtml(edit)}</span>
      <div class="memory-edit-item__actions">
        ${status === 'sent' ? `<span style="color: var(--color-success); font-size: var(--font-size-xs);">Sent</span>` :
          status === 'skipped' ? `<span style="color: var(--color-text-muted); font-size: var(--font-size-xs);">Skipped</span>` :
          `<button class="btn btn--small btn--success" data-action="send" data-index="${i}">Sent</button>
           <button class="btn btn--small" data-action="skip" data-index="${i}">Skip</button>`}
      </div>
    `;
    listEl.appendChild(item);
  }

  // Handle actions
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index);
    const current = getState().steps.b3.memoryEditsProcessed || {};
    current[idx] = btn.dataset.action === 'send' ? 'sent' : 'skipped';
    updateStep('b3', { memoryEditsProcessed: current });
    renderEdits(container, edits, current);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });

  // Copy remaining
  const copyBtn = container.querySelector('#b3-copy-remaining');
  copyBtn.addEventListener('click', async () => {
    const remaining = edits.filter((_, i) => !processed[i]);
    const text = remaining.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.innerHTML = `${icon('check', 14)} Copied ${remaining.length} edits`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      setTimeout(() => {
        copyBtn.innerHTML = `${icon('clipboard', 14)} Copy All Remaining`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  });
}

function parseMemoryEdits(script) {
  if (!script) return [];
  return script.split('\n')
    .filter(line => line.startsWith('Please remember:'))
    .map(line => line.trim());
}

export function cleanup() {}
