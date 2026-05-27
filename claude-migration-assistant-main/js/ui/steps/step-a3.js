import { updateStep, getExportData, setExportData } from '../../state.js';
import { createMarkdownViewer } from '../components/markdown-viewer.js';
import { icon } from '../components/icon.js';

let viewer = null;

export function render(container, stepState, globalState) {
  const contextDoc = stepState.contextDocEdited || globalState.exportData.contextDocument;

  if (!contextDoc) {
    container.innerHTML = `
      <div class="info-box info-box--warning">
        <span class="info-box__icon">${icon('alert-triangle', 16)}</span>
        <span>No context document available. Complete step A2 first to process your export ZIP.</span>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="step-section">
      <div class="step-section__title">Context Document</div>
      <div class="step-section__description">
        This document was auto-generated from your conversation history. It captures frequently
        discussed topics, technologies, preferences, and recent conversation summaries.
        Review it carefully and edit for accuracy before using it in your new account.
      </div>

      <div class="info-box info-box--info" style="margin-bottom: var(--space-md);">
        <span class="info-box__icon">${icon('info', 16)}</span>
        <span>This is machine-generated from conversation text only. It does not capture
        Claude's synthesized understanding or implicit preferences. Use Track B to capture those.</span>
      </div>

      <div id="a3-viewer"></div>
    </div>

    <div class="step-actions">
      <button class="btn" id="a3-save">
        ${icon('save', 14)}
        Save Edits
      </button>
      <label class="checkbox">
        <input type="checkbox" class="checkbox__input" id="a3-done" ${stepState.completed ? 'checked' : ''}>
        <span class="checkbox__label">Context document reviewed</span>
      </label>
    </div>
  `;

  const viewerContainer = container.querySelector('#a3-viewer');
  viewer = createMarkdownViewer(viewerContainer, {
    markdown: contextDoc,
    editable: true,
    onChange: (md) => {
      updateStep('a3', { contextDocEdited: md });
    }
  });

  const saveBtn = container.querySelector('#a3-save');
  saveBtn.addEventListener('click', () => {
    const edited = viewer.getContent();
    updateStep('a3', { contextDocEdited: edited });
    setExportData('contextDocument', edited);
    saveBtn.innerHTML = `${icon('check', 14)} Saved`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
      saveBtn.innerHTML = `${icon('save', 14)} Save Edits`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 2000);
  });

  const cb = container.querySelector('#a3-done');
  cb.addEventListener('change', () => {
    updateStep('a3', { completed: cb.checked });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function cleanup() {
  viewer = null;
}
