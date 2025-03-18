export function removeDiacritics(text: string): string {
    if (!text) return '';

    // Normalize the text to decompose diacritics
    // This regex covers all Arabic diacritics including:
    // - Fatha, Kasra, Damma, Sukun, Shadda, etc.
    // return text
    //     .normalize('NFD')
    //     .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
    //     .replace(/\s+/g, ' ') // Normalize whitespace
    //     .trim(); // Remove leading/trailing whitespace
    // Normalize the text to decompose diacritics and other marks
    return text
        .normalize('NFD') // Normalize to decomposed form for proper handling of diacritics
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u200C\u200D\u0610-\u061A]/g, '') // Remove diacritics and non-spacing marks
        .replace(/\s+/g, ' ') // Normalize multiple spaces to a single space
        .trim(); // Remove leading and trailing whitespace
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
    maskedWordLength: number;
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
    const normalizedMaskedWord = normalizeArabicText(cleanMaskedWord);

    // Generate variations of the masked word for matching
    const maskedWordVariations = generateWordVariations(cleanMaskedWord);

    // Find the index of this word in the original array
    const originalIndex = words.indexOf(maskedWord);

    // Create a placeholder with individual character slots for typing
    const maskedWordLength = normalizedMaskedWord.length;
    const placeholder = `<span id="masked-word-container" class="masked"></span>`;

    words[originalIndex] = placeholder;

    return {
        maskedText: words.join(' '),
        maskedWord: cleanMaskedWord,
        maskedWordVariations,
        maskedWordLength,
    };
}

// Preloaded audio elements for instant playback
const audioCache: Record<string, HTMLAudioElement> = {};

// Call this function at app initialization to preload audio files
export function preloadAudioFiles(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.Audio) {
        return;
    }

    try {
        // Preload success sound
        const successAudio = new Audio('/sounds/success.mp3');
        successAudio.preload = 'auto';
        successAudio.load();
        audioCache['correct'] = successAudio;

        // Preload fail sound
        const failAudio = new Audio('/sounds/fail.mp3');
        failAudio.preload = 'auto';
        failAudio.load();
        audioCache['incorrect'] = failAudio;

        // Silent preload to prepare browser audio context
        const warmupAudio = new Audio();
        warmupAudio.volume = 0.01;
        warmupAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA='; // tiny silent audio
        warmupAudio.load();
        warmupAudio.play().catch(() => {});
    } catch (error) {
        // Silently fail - preloading is optional
    }
}

export function playSound(type: 'correct' | 'incorrect'): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.Audio) {
        return;
    }

    try {
        // Use cached audio if available, otherwise create a new one
        let audio: HTMLAudioElement;

        if (audioCache[type]) {
            // Use the cached audio element and clone it for simultaneous sounds
            audio = audioCache[type].cloneNode() as HTMLAudioElement;
        } else {
            // Fallback to creating a new audio object
            audio = new Audio(type === 'correct' ? '/sounds/success.mp3' : '/sounds/fail.mp3');
        }

        // Set volume and try to play immediately
        audio.volume = 0.6;
        audio.play().catch((error) => {
            // Silently handle errors for better UX
            if (error.name !== 'NotAllowedError') {
                console.debug('Audio playback error:', error.name);
            }
        });
    } catch (error) {
        // Fail silently - no console logs to avoid cluttering
    }
}
