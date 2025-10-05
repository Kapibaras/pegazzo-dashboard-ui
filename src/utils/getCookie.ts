export default function getCookie(cookies: string, name: string): string | null {
    if (!cookies) return null;
  
    const value = `; ${cookies}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  }
  