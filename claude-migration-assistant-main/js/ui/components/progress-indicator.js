export function createProgressIndicator(container) {
  let el = document.createElement('div');
  el.className = 'processing-progress';
  el.innerHTML = `
    <div class="processing-progress__phase">Waiting...</div>
    <div class="processing-progress__bar">
      <div class="processing-progress__fill" style="width: 0%"></div>
    </div>
  `;
  container.appendChild(el);

  return {
    update(phase, progress) {
      const phaseEl = el.querySelector('.processing-progress__phase');
      const fillEl = el.querySelector('.processing-progress__fill');
      if (phaseEl) phaseEl.textContent = phase;
      if (fillEl) fillEl.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    },
    complete(message = 'Complete') {
      const phaseEl = el.querySelector('.processing-progress__phase');
      const fillEl = el.querySelector('.processing-progress__fill');
      if (phaseEl) phaseEl.textContent = message;
      if (fillEl) fillEl.style.width = '100%';
    },
    remove() {
      el.remove();
    }
  };
}
