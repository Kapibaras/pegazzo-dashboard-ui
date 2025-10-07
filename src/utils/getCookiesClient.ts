export default function getCookiesClient(): string {
    if (typeof document === "undefined") return "";
  
    return document.cookie;
  }

  