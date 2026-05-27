/**
 * Returns an HTML string for a Lucide icon element.
 * After inserting into the DOM, call lucide.createIcons() to activate.
 */
export function icon(name, size = 16) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;display:inline-block;vertical-align:middle;"></i>`;
}
