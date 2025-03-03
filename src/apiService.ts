import axios from 'axios';

const API_BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchWholeQuran = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/quran/quran-uthmani`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching surahs:', error);
        throw error;
    }
};

export const fetchSurahs = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/surah`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching surahs:', error);
        throw error;
    }
};

export const fetchSurah = async (surahNumber: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/surah/${surahNumber}/editions/simple-minimal`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching surah:', error);
        throw error;
    }
};

export const fetchAyah = async (ayahNumber: string, edition: string = 'simple-minimal') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ayah/${ayahNumber}/${edition}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching ayah:', error);
        throw error;
    }
};

export const fetchJuz = async (juzNumber: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/juz/${juzNumber}/simple-minimal`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching Juz:', error);
        throw error;
    }
};
