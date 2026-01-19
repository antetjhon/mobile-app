// utils/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = '@ebpls_api_url';

export const getApiUrl = async (): Promise<string> => {
  try {
    const url = await AsyncStorage.getItem(API_URL_KEY);
    return url || '';
  } catch (error) {
    console.error('Error getting API URL:', error);
    return '';
  }
};

export const setApiUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(API_URL_KEY, url);
  } catch (error) {
    console.error('Error setting API URL:', error);
    throw error;
  }
};

export const clearApiUrl = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(API_URL_KEY);
  } catch (error) {
    console.error('Error clearing API URL:', error);
    throw error;
  }
};