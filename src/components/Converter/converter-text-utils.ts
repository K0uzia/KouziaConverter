let markedModule: Promise<typeof import('marked').marked> | null = null;

async function getMarked(): Promise<typeof import('marked').marked> {
  if (!markedModule) {
    markedModule = import('marked').then(({ marked }) => {
      marked.setOptions({ gfm: true, breaks: true });
      return marked;
    });
  }
  return markedModule;
}

export function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body?.textContent ?? '').replace(/\s+\n/g, '\n').trim();
}

export async function markdownToPlainText(md: string): Promise<string> {
  const marked = await getMarked();
  const html = await marked.parse(md);
  return htmlToPlainText(html);
}

export async function parseMarkdownToHtml(md: string): Promise<string> {
  const marked = await getMarked();
  return marked.parse(md) as string;
}
