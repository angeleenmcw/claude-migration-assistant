import { updateStep, getState } from '../../state.js';
import { escapeHtml } from '../../utils.js';
import { createCopyableBlock } from '../components/copyable-block.js';
import { PROMPTS } from '../../data/prompts.js';
import { icon } from '../components/icon.js';

export function render(container, stepState, globalState) {
  const projects = globalState.steps.b2.projects || [];
  const recreated = stepState.projectsRecreated || {};

  container.innerHTML = `
    <div class="step-section">
      <div class="step-section__title">Recreate Projects in New Account</div>
      <div class="step-section__description">
        For each project captured in step B2, recreate it in your new account following these steps:
      </div>

      <ol style="padding-left: var(--space-xl); margin-bottom: var(--space-lg); line-height: 2; font-size: var(--font-size-sm);">
        <li>Create a new Project in your new account</li>
        <li>Open the blueprint file -- copy the custom instructions into project settings</li>
        <li>Upload the original knowledge files to the project</li>
        <li>Start a conversation in the project, upload the blueprint, and send:</li>
      </ol>

      <div id="b4-prompt"></div>
    </div>

    <div class="step-section">
      <div class="step-section__title">Project Checklist</div>
      <div id="b4-project-list"></div>
    </div>

    <div class="step-actions">
      <label class="checkbox">
        <input type="checkbox" class="checkbox__input" id="b4-done" ${stepState.completed ? 'checked' : ''}>
        <span class="checkbox__label">All projects recreated</span>
      </label>
    </div>
  `;

  createCopyableBlock(container.querySelector('#b4-prompt'), {
    text: PROMPTS.projectFamiliarize,
    label: 'Prompt to send in each new project'
  });

  const listEl = container.querySelector('#b4-project-list');

  if (projects.length === 0) {
    listEl.innerHTML = `
      <div class="info-box info-box--info">
        <span class="info-box__icon">${icon('info', 16)}</span>
        <span>No projects were added in step B2. If you don't use Projects, skip this step.</span>
      </div>
    `;
  } else {
    listEl.innerHTML = projects.map((proj, i) => `
      <label class="checkbox" style="padding: var(--space-sm) var(--space-md); border-bottom: 1px solid var(--color-border);">
        <input type="checkbox" class="checkbox__input" data-project="${i}"
          ${recreated[i] ? 'checked' : ''}>
        <span class="checkbox__label">
          <strong>${escapeHtml(proj.name)}</strong>
          <span style="color: var(--color-text-muted); font-size: var(--font-size-xs);">
            -- instructions set, files uploaded, context shared
          </span>
        </span>
      </label>
    `).join('');

    listEl.addEventListener('change', (e) => {
      const cb = e.target.closest('[data-project]');
      if (!cb) return;
      const current = getState().steps.b4.projectsRecreated || {};
      current[cb.dataset.project] = cb.checked;
      updateStep('b4', { projectsRecreated: current });
    });
  }

  const doneCb = container.querySelector('#b4-done');
  doneCb.addEventListener('change', () => {
    updateStep('b4', { completed: doneCb.checked });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function cleanup() {}
