export function removeDiacritics(text: string): string {
    if (!text) return '';

    // Normalize the text to decompose diacritics
    // This regex covers all Arabic diacritics including:
    // - Fatha, Kasra, Damma, Sukun, Shadda, etc.
    return text
        .normalize('NFD')
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim(); // Remove leading/trailing whitespace
}

export function normalizeArabicText(text: string): string {
    if (!text) return '';

    return text
        .normalize('NFD')
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
        .replace(/[أإآا]/g, 'ا') // Normalize alif variations
        .replace(/[ىي]/g, 'ي') // Normalize ya variations
        .replace(/[ؤئ]/g, 'ء') // Normalize hamza variations
        .replace(/[ة]/g, 'ه') // Normalize ta marbuta to ha
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim(); // Remove leading/trailing whitespace
}

export function compareArabicTexts(text1: string, text2: string): boolean {
    return normalizeArabicText(text1.toLowerCase()) === normalizeArabicText(text2.toLowerCase());
}

// Generate all possible variations of a word for matching
export function generateWordVariations(word: string): string[] {
    if (!word) return [];

    // Remove any punctuation that might be attached to the word
    const cleanWord = word.replace(/[.,;:!؟?()[\]{}""'']/g, '');

    return [
        cleanWord, // Original cleaned word
        removeDiacritics(cleanWord), // Without diacritics
        normalizeArabicText(cleanWord), // Fully normalized
        cleanWord.toLowerCase(), // Lowercase
        removeDiacritics(cleanWord).toLowerCase(), // Lowercase without diacritics
        normalizeArabicText(cleanWord).toLowerCase(), // Lowercase fully normalized
    ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
}

export function isWordMatch(userInput: string, targetWord: string): boolean {
    if (!userInput || !targetWord) return false;

    const userVariations = generateWordVariations(userInput);
    const targetVariations = generateWordVariations(targetWord);

    // Check if any variation of the user input matches any variation of the target word
    for (const userVar of userVariations) {
        for (const targetVar of targetVariations) {
            if (userVar === targetVar) {
                return true;
            }
        }
    }

    return false;
}

export function isSurahNameMatch(userInput: string, possibleNames: string[]): boolean {
    if (!userInput || !possibleNames || possibleNames.length === 0) return false;

    const normalizedInput = userInput.toLowerCase().trim();
    const userVariations = generateWordVariations(userInput);

    // Check for exact match after normalization
    for (const name of possibleNames) {
        // Generate variations for this name
        const nameVariations = generateWordVariations(name);

        // Check if any user variation matches any name variation
        for (const userVar of userVariations) {
            for (const nameVar of nameVariations) {
                // Exact match
                if (userVar === nameVar) {
                    return true;
                }

                // Partial match (if name is long enough)
                if (nameVar.length > 2 && userVar.length > 2) {
                    if (nameVar.includes(userVar) || userVar.includes(nameVar)) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

export function maskWordInAyah(text: string): {
    maskedText: string;
    maskedWord: string;
    maskedWordVariations: string[];
} {
    // Normalize newlines and spaces
    const normalizedText = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    const words = normalizedText.split(' ');

    // Filter out very short words and words with punctuation only
    const eligibleWords = words.filter((word) => {
        const cleanWord = word.replace(/[.,;:!؟?()[\]{}""'']/g, '');
        return cleanWord.length > 2;
    });

    // If no eligible words, fall back to any word
    const wordsToUse = eligibleWords.length > 0 ? eligibleWords : words;

    // Get random index from eligible words
    const randomIndex = Math.floor(Math.random() * wordsToUse.length);
    const maskedWord = wordsToUse[randomIndex];

    // Clean the masked word from any punctuation at the beginning or end
    const cleanMaskedWord = maskedWord.replace(/^[.,;:!؟?()[\]{}""'']+|[.,;:!؟?()[\]{}""'']+$/g, '');

    // Generate variations of the masked word for matching
    const maskedWordVariations = generateWordVariations(cleanMaskedWord);

    // Find the index of this word in the original array
    const originalIndex = words.indexOf(maskedWord);
    words[originalIndex] = '<span class="masked">____</span>';

    return {
        maskedText: words.join(' '),
        maskedWord: cleanMaskedWord,
        maskedWordVariations,
    };
}
