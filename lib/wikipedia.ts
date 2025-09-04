const WIKIPEDIA_SUMMARY_BASE_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

class WikipediaService {
  async getSummaryFromUrl(url: string): Promise<string | null> {
    try {
      const parsed = new URL(url);
      const title = decodeURIComponent(parsed.pathname.split('/').pop() || '');
      if (!title) return null;

      const response = await fetch(`${WIKIPEDIA_SUMMARY_BASE_URL}${title}`, {
        headers: {
          'User-Agent': 'SpinGrid/1.0.0 (https://spingrid.com)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.extract || null;
    } catch (error) {
      console.warn('[Wikipedia] Failed to fetch summary:', error);
      return null;
    }
  }
}

export const wikipediaService = new WikipediaService();
