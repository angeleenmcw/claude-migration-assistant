/**
 * Reads a Claude export ZIP file and extracts conversations.json.
 * Reports progress via callback.
 */

export async function readExportZip(file, onProgress) {
  if (!window.JSZip) {
    throw new Error('JSZip not loaded. Check CDN link.');
  }

  onProgress('Reading ZIP file...', 10);

  const zip = await JSZip.loadAsync(file);

  onProgress('Searching for conversations...', 25);

  // Find conversations.json - could be at root or nested
  let conversationsFile = null;

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const name = path.split('/').pop();
    if (name === 'conversations.json') {
      conversationsFile = entry;
      break;
    }
  }

  if (!conversationsFile) {
    // Try finding any JSON file that looks like conversations
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;
      if (path.endsWith('.json')) {
        const preview = await entry.async('string').then(s => s.slice(0, 100));
        if (preview.trim().startsWith('[')) {
          conversationsFile = entry;
          break;
        }
      }
    }
  }

  if (!conversationsFile) {
    throw new Error(
      'Could not find conversations.json in the ZIP. ' +
      'Make sure this is a Claude data export (Settings > Privacy > Export Data).'
    );
  }

  onProgress('Parsing conversations JSON...', 40);

  const jsonString = await conversationsFile.async('string');

  onProgress('Parsing JSON data...', 60);

  let raw;
  try {
    raw = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Failed to parse conversations.json: ' + e.message);
  }

  onProgress('Done reading ZIP.', 100);

  return raw;
}

/**
 * List all files in a ZIP for debugging.
 */
export async function listZipContents(file) {
  const zip = await JSZip.loadAsync(file);
  const entries = [];
  for (const [path, entry] of Object.entries(zip.files)) {
    if (!entry.dir) {
      entries.push({
        path,
        size: entry._data ? entry._data.uncompressedSize : 0
      });
    }
  }
  return entries;
}
