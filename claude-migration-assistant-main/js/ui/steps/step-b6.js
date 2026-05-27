import { updateStep } from '../../state.js';
import { createCopyableBlock } from '../components/copyable-block.js';
import { PROMPTS } from '../../data/prompts.js';
import { icon } from '../components/icon.js';

export function render(container, stepState) {
  const passed = stepState.passed;

  container.innerHTML = `
    <div class="step-section">
      <div class="step-section__title">Validate Your Migration</div>
      <div class="step-section__description">
        Send the prompt below in your <strong>new account</strong>. Compare Claude's response
        against the <code>memory-capture.md</code> from step B1. Fix any gaps by adding
        memory edits or uploading additional context.
      </div>
      <div id="b6-prompt"></div>
    </div>

    <div class="step-section">
      <div class="step-section__title">Result</div>
      <div class="step-section__description">
        Did Claude's response accurately reflect your profile, preferences, and context?
      </div>

      <div class="pass-fail" id="b6-result">
        <button class="pass-fail__option pass-fail__option--pass ${passed === true ? 'pass-fail__option--selected' : ''}"
          data-result="pass">
          ${icon('check-circle', 16)} Pass
        </button>
        <button class="pass-fail__option pass-fail__option--fail ${passed === false ? 'pass-fail__option--selected' : ''}"
          data-result="fail">
          ${icon('x-circle', 16)} Needs Work
        </button>
      </div>

      ${passed === true ? `
        <div class="info-box info-box--success" style="margin-top: var(--space-md);">
          <span class="info-box__icon">${icon('check-circle', 16)}</span>
          <div>
            <strong>Migration complete.</strong>
            <br>Keep your old account accessible for 30 days as reference. After 1 week of use,
            run this validation again to catch any drift.
          </div>
        </div>
      ` : ''}

      ${passed === false ? `
        <div class="info-box info-box--warning" style="margin-top: var(--space-md);">
          <span class="info-box__icon">${icon('alert-triangle', 16)}</span>
          <div>
            <strong>Gaps detected.</strong>
            <br>Review the response and identify what's missing. You can:
            <ul style="margin-top: var(--space-sm); padding-left: var(--space-lg);">
              <li>Add memory edits for missing facts (go back to step B3)</li>
              <li>Upload additional context documents to relevant Projects</li>
              <li>Re-run this validation after making corrections</li>
            </ul>
          </div>
        </div>
      ` : ''}
    </div>

    <div class="step-actions">
      <label class="checkbox">
        <input type="checkbox" class="checkbox__input" id="b6-done" ${stepState.completed ? 'checked' : ''}>
        <span class="checkbox__label">Migration validated</span>
      </label>
    </div>
  `;

  createCopyableBlock(container.querySelector('#b6-prompt'), {
    text: PROMPTS.validate,
    label: 'Validation prompt for new account'
  });

  // Pass/fail toggles
  const resultEl = container.querySelector('#b6-result');
  resultEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-result]');
    if (!btn) return;
    const result = btn.dataset.result === 'pass';
    updateStep('b6', { passed: result, completed: result });
    // Re-render to show feedback
    render(container, { ...stepState, passed: result, completed: result });
  });

  const doneCb = container.querySelector('#b6-done');
  doneCb.addEventListener('change', () => {
    updateStep('b6', { completed: doneCb.checked });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function cleanup() {}
