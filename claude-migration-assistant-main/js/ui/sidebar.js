import { STEPS } from '../data/step-definitions.js';
import { getState, subscribe, setCurrentStep, getCompletedCount, getTotalSteps } from '../state.js';
import { icon } from './components/icon.js';

let sidebarEl = null;
let progressEl = null;

export function renderSidebar(container) {
  sidebarEl = container;
  const state = getState();

  const trackASteps = STEPS.filter(s => s.track === 'a');
  const trackBSteps = STEPS.filter(s => s.track === 'b');

  container.innerHTML = `
    <div class="sidebar-section">
      <div class="sidebar-section__title">Track A: Automated</div>
      ${trackASteps.map(s => renderStepItem(s, state)).join('')}
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section__title">Track B: Manual</div>
      ${trackBSteps.map(s => renderStepItem(s, state)).join('')}
    </div>
  `;

  container.addEventListener('click', handleStepClick);
  subscribe(onStateChange);
}

export function renderProgressBar(container) {
  progressEl = container;
  updateProgress();
  subscribe(updateProgress);
}

function renderStepItem(step, state) {
  const stepState = state.steps[step.id];
  const isActive = state.currentStep === step.id;
  const isCompleted = stepState?.completed;

  const classes = [
    'sidebar-step',
    isActive ? 'sidebar-step--active' : '',
    isCompleted ? 'sidebar-step--completed' : ''
  ].filter(Boolean).join(' ');

  const checkIcon = isCompleted
    ? icon('check-circle', 18)
    : icon('circle', 18);

  return `
    <div class="${classes}" data-step="${step.id}">
      <span class="sidebar-step__check">${checkIcon}</span>
      <span class="sidebar-step__label">${step.title}</span>
    </div>
  `;
}

function handleStepClick(e) {
  const stepEl = e.target.closest('[data-step]');
  if (!stepEl) return;
  const stepId = stepEl.dataset.step;
  setCurrentStep(stepId);
}

function onStateChange(state) {
  if (!sidebarEl) return;
  const items = sidebarEl.querySelectorAll('.sidebar-step');
  items.forEach(el => {
    const id = el.dataset.step;
    const stepState = state.steps[id];
    const isActive = state.currentStep === id;

    el.classList.toggle('sidebar-step--active', isActive);
    el.classList.toggle('sidebar-step--completed', stepState?.completed);

    const checkEl = el.querySelector('.sidebar-step__check');
    if (checkEl) {
      checkEl.innerHTML = stepState?.completed
        ? icon('check-circle', 18)
        : icon('circle', 18);
    }
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateProgress() {
  if (!progressEl) return;
  const completed = getCompletedCount();
  const total = getTotalSteps();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  progressEl.innerHTML = `
    <div class="progress-bar">
      <div class="progress-bar__fill" style="width: ${pct}%"></div>
    </div>
    <div class="progress-bar__label">${completed} of ${total} steps complete</div>
  `;
}
