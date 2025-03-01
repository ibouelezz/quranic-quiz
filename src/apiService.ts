import axios from 'axios';

const API_BASE_URL = 'http://api.alquran.cloud/v1';

export const fetchSurahs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/surah`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
};

export const fetchAyah = async (ayahNumber: string, edition: string = 'quran-uthmani') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ayah/${ayahNumber}/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ayah:', error);
    throw error;
  }
};