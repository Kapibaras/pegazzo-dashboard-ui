export function getCookie(cookies: string, name: string): string | null {
  if (!cookies) return null;

  const value = `; ${cookies}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export function getCookiesClient(): string {
  if (typeof document === 'undefined') return '';

  return document.cookie;
}
