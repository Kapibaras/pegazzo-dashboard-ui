export type FileKind = 'image' | 'pdf' | 'other';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'svg']);

/** Guesses how to preview a file from the extension in its URL path (presigned URLs carry a query string). */
export const getFileKind = (url: string): FileKind => {
  let path = url;
  try {
    path = new URL(url, 'http://local').pathname;
  } catch {
    // keep the raw value
  }
  const extension = path.split('.').pop()?.toLowerCase() ?? '';
  if (extension === 'pdf') return 'pdf';
  if (url.startsWith('blob:') || IMAGE_EXTENSIONS.has(extension)) return 'image';
  return 'other';
};
