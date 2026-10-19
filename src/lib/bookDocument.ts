/**
 * Stores book-only text fields alongside an existing plain-text manuscript.
 *
 * Legacy documents remain plain text until a book field is edited. The optional
 * trailing HTML comment carries structured fields through the existing file and
 * Drive sync pipeline without changing the visible manuscript text.
 */
const START = '\n\n<!-- CALLIOPEN_BOOK_FIELDS_V1\n';
const END = '\n-->';

export type BookTextFields = Record<string, string>;

function decode(raw: string): { body: string; fields: BookTextFields; suffix: string } {
  const index = raw.lastIndexOf(START);
  if (index < 0 || !raw.endsWith(END)) {
    return { body: raw, fields: {}, suffix: '' };
  }

  const encoded = raw.slice(index + START.length, -END.length);
  try {
    const parsed: unknown = JSON.parse(encoded);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { body: raw, fields: {}, suffix: '' };
    }

    const fields = parsed as Record<string, unknown>;
    if (Object.values(fields).some(value => typeof value !== 'string')) {
      return { body: raw, fields: {}, suffix: '' };
    }

    return {
      body: raw.slice(0, index),
      fields: fields as BookTextFields,
      suffix: raw.slice(index),
    };
  } catch {
    return { body: raw, fields: {}, suffix: '' };
  }
}

/** Return only the ordinary manuscript text, never the book's hidden fields. */
export function getManuscriptText(raw: string): string {
  return decode(raw).body;
}

/** Replace manuscript text without losing cover/layout edits. */
export function withManuscriptText(raw: string, body: string): string {
  return body + decode(raw).suffix;
}

/** Preserve intentionally erased values; an empty string is a valid edit. */
export function getBookText(raw: string, key: string, fallback = ''): string {
  const { fields } = decode(raw);
  return Object.prototype.hasOwnProperty.call(fields, key) ? fields[key] : fallback;
}

/** Update a single field without modifying any other field or the manuscript. */
export function withBookText(raw: string, key: string, value: string): string {
  const { body, fields } = decode(raw);
  return body + START + JSON.stringify({ ...fields, [key]: value }) + END;
}

/** Document-specific book format, layout selection and typography preferences. */
export interface SavedBookSettings {
  format?: string;
  selectedLayouts?: string[];
  fontSizeOverride?: number | null;
}

export function getBookSettings(raw: string): SavedBookSettings {
  const value = getBookText(raw, '__bookSettings', '');
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return {
      format: typeof parsed.format === 'string' ? parsed.format : undefined,
      selectedLayouts: Array.isArray(parsed.selectedLayouts) ? parsed.selectedLayouts.filter((x: unknown) => typeof x === 'string') : undefined,
      fontSizeOverride: parsed.fontSizeOverride === null || typeof parsed.fontSizeOverride === 'number' ? parsed.fontSizeOverride : undefined,
    };
  } catch { return {}; }
}

export function withBookSettings(raw: string, settings: SavedBookSettings): string {
  return withBookText(raw, '__bookSettings', JSON.stringify(settings));
}
