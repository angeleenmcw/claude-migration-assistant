import { getState, subscribe, getCurrentStep } from '../state.js';
import { getStep } from '../data/step-definitions.js';

const stepModules = {};
let containerEl = null;
let currentCleanup = null;

export function initStepRenderer(container) {
  containerEl = container;
  subscribe(onStateChange);
  renderCurrentStep();
}

async function loadStepModule(stepId) {
  if (stepModules[stepId]) return stepModules[stepId];
  try {
    const mod = await import(`./steps/step-${stepId}.js`);
    stepModules[stepId] = mod;
    return mod;
  } catch (e) {
    console.error(`Failed to load step module: step-${stepId}`, e);
    return null;
  }
}

async function renderCurrentStep() {
  if (!containerEl) return;

  // Cleanup previous step
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const stepId = getCurrentStep();
  const stepDef = getStep(stepId);
  const state = getState();

  if (!stepDef) {
    containerEl.innerHTML = '<div class="step-card"><div class="step-card__body">Unknown step.</div></div>';
    return;
  }

  // Render card shell
  const trackLabel = stepDef.track === 'a' ? 'Track A' : 'Track B';
  const trackClass = stepDef.track === 'a' ? 'sidebar-step__badge--a' : 'sidebar-step__badge--b';

  containerEl.innerHTML = `
    <div class="step-card">
      <div class="step-card__header">
        <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs);">
          <span class="sidebar-step__badge ${trackClass}">${trackLabel}</span>
          <span style="font-size: var(--font-size-sm); color: var(--color-text-muted);">Step ${stepId.toUpperCase()}</span>
        </div>
        <div class="step-card__title">${stepDef.title}</div>
        <div class="step-card__subtitle">${stepDef.subtitle}</div>
      </div>
      <div class="step-card__body" id="step-body"></div>
    </div>
  `;

  const bodyEl = containerEl.querySelector('#step-body');

  // Load and render step module
  const mod = await loadStepModule(stepId);
  if (mod && mod.render) {
    mod.render(bodyEl, state.steps[stepId], state);
    if (mod.cleanup) {
      currentCleanup = mod.cleanup;
    }
  } else {
    bodyEl.innerHTML = `
      <div class="info-box info-box--warning">
        <span class="info-box__icon"><i data-lucide="alert-triangle" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i></span>
        <span>Failed to load this step. Try refreshing the page. If the problem persists, check your network connection.</span>
      </div>
    `;
  }

  // Activate Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

let currentStepId = null;
function onStateChange(state) {
  if (state.currentStep !== currentStepId) {
    currentStepId = state.currentStep;
    renderCurrentStep();
  }
}
