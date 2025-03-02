export function removeDiacritics(text: string): string {
    // Normalize the text to decompose diacritics
    return text.normalize("NFD").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
}

export function maskWordInAyah(text: string): { maskedText: string, maskedWord: string } {
    const words = text.split(' ');
    const randomIndex = Math.floor(Math.random() * words.length);
    const maskedWord = words[randomIndex];
    words[randomIndex] = '____';
    return { maskedText: words.join(' '), maskedWord };
  };