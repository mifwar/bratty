/**
 * On load: if pathname has content and no ?text= query param,
 * convert pathname to ?text= query param via history.replaceState.
 * The app uses ONLY ?text= as source of truth.
 */
export function normalizeUrl(): void {
  const pathname = window.location.pathname;
  const search = window.location.search;

  const hasTextParam = new URLSearchParams(search).has("text");

  if (pathname !== "/" && !hasTextParam) {
    // Decode pathname (spaces may be encoded as %20 or +)
    const rawText = decodeURIComponent(pathname.slice(1)).replace(/\+/g, " ");
    const newSearch = new URLSearchParams();
    newSearch.set("text", rawText);
    const newUrl = `/?${newSearch.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }
}

export function getTextFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("text") ?? "";
}

export function setTextInUrl(text: string): void {
  const params = new URLSearchParams(window.location.search);
  if (text) {
    params.set("text", text);
  } else {
    params.delete("text");
  }
  const newSearch = params.toString();
  const newUrl = newSearch ? `/?${newSearch}` : "/";
  window.history.replaceState(null, "", newUrl);
}

export function buildShareUrl(text: string): string {
  const url = new URL(window.location.origin);
  url.searchParams.set("text", text);
  return url.toString();
}
