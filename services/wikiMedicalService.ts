export interface WikiInsights {
    title: string;
    summary: string;
    sourceUrl: string;
}

class WikiMedicalService {
    async fetchDiseaseInfo(diseaseName: string): Promise<WikiInsights | null> {
        if (!diseaseName || diseaseName === 'Normal' || diseaseName === 'Healthy' || diseaseName.includes('Healthy')) {
            return null;
        }

        try {
            console.log(`Fetching Wikipedia info for: ${diseaseName}`);
            
            // Clean up name for better search probability
            // e.g. "Acne (Acne Vulgaris)" -> "Acne Vulgaris"
            // "Onychomycosis (Fungal nail infection)" -> "Onychomycosis"
            let searchQuery = diseaseName;
            if (diseaseName.includes('(')) {
                const parts = diseaseName.split('(');
                // Usually the more medical term is the most reliable wiki search
                searchQuery = parts[0].trim();
            }

            const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(searchQuery)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            const pages = data.query?.pages;
            if (!pages) return null;
            
            const pageId = Object.keys(pages)[0];
            if (pageId === "-1") {
                // Try fallback search logic if first precise attempt fails
                return await this.fallbackSearch(diseaseName);
            }
            
            const page = pages[pageId];
            
            return {
                title: page.title,
                summary: page.extract || "No detailed summary available.",
                sourceUrl: `https://en.wikipedia.org/?curid=${page.pageid}`
            };

        } catch (error) {
            console.error('Wikipedia fetch failed:', error);
            return null;
        }
    }

    private async fallbackSearch(term: string): Promise<WikiInsights | null> {
        try {
             // Free-text search to find the nearest matching medical article
             const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&utf8=&format=json&srlimit=1`;
             const res = await fetch(searchUrl);
             const data = await res.json();
             
             if (data.query?.search && data.query.search.length > 0) {
                 const bestMatchTitle = data.query.search[0].title;
                 // Refetch exact extract using the best match title
                 return await this.fetchDiseaseInfo(bestMatchTitle);
             }
             return null;
        } catch {
             return null;
        }
    }
}

export default new WikiMedicalService();
