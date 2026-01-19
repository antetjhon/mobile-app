import AsyncStorage from "@react-native-async-storage/async-storage";

const SELECTED_OPTION_KEY = '@ebpls_config_option';
const MANUAL_API_KEY = '@ebpls_manual_api';
const SELECTED_MUNICIPALITY_KEY = '@ebpls_selected_municipality';

// Municipality API mappings
const MUNICIPALITY_APIS: Record<string, string> = {
    abuyog: 'http://192.168.1.101:8080/ebpls/api/mobile',
    alangalang: 'http://192.168.1.102:8080/ebpls/api/mobile',
    albuera: 'http://192.168.1.103:8080/ebpls/api/mobile',
    babatngon: 'http://192.168.1.104:8080/ebpls/api/mobile',
    barugo: 'http://192.168.1.105:8080/ebpls/api/mobile',
    bato: 'http://192.168.1.106:8080/ebpls/api/mobile',
    baybay: 'http://192.168.0.180:8080/ebpls/api/mobile',
    burauen: 'http://192.168.1.108:8080/ebpls/api/mobile',
    calubian: 'http://192.168.1.109:8080/ebpls/api/mobile',
    capoocan: 'http://192.168.1.110:8080/ebpls/api/mobile',
    carigara: 'http://192.168.1.111:8080/ebpls/api/mobile',
    dagami: 'http://192.168.1.112:8080/ebpls/api/mobile',
    dulag: 'http://192.168.1.113:8080/ebpls/api/mobile',
    hilongos: 'http://192.168.1.114:8080/ebpls/api/mobile',
    hindang: 'http://192.168.1.115:8080/ebpls/api/mobile',
    inopacan: 'http://192.168.1.116:8080/ebpls/api/mobile',
    isabel: 'http://192.168.1.117:8080/ebpls/api/mobile',
    jaro: 'http://192.168.1.118:8080/ebpls/api/mobile',
    javier: 'http://192.168.1.119:8080/ebpls/api/mobile',
    julita: 'http://192.168.1.120:8080/ebpls/api/mobile',
    kananga: 'http://192.168.1.121:8080/ebpls/api/mobile',
    lapaz: 'http://192.168.1.122:8080/ebpls/api/mobile',
    leyte: 'http://192.168.1.123:8080/ebpls/api/mobile',
    macarthur: 'http://192.168.1.124:8080/ebpls/api/mobile',
    mahaplag: 'http://192.168.1.125:8080/ebpls/api/mobile',
    matagob: 'http://192.168.1.126:8080/ebpls/api/mobile',
    matalom: 'http://192.168.1.127:8080/ebpls/api/mobile',
    mayorga: 'http://192.168.1.128:8080/ebpls/api/mobile',
    merida: 'http://192.168.1.129:8080/ebpls/api/mobile',
    palo: 'http://192.168.1.130:8080/ebpls/api/mobile',
    palompon: 'http://192.168.1.131:8080/ebpls/api/mobile',
    pastrana: 'http://192.168.1.132:8080/ebpls/api/mobile',
    sanisidro: 'http://192.168.1.133:8080/ebpls/api/mobile',
    sanmiguel: 'http://192.168.1.134:8080/ebpls/api/mobile',
    santafe: 'http://192.168.1.135:8080/ebpls/api/mobile',
    tabango: 'http://192.168.1.136:8080/ebpls/api/mobile',
    tanauan: 'http://192.168.1.137:8080/ebpls/api/mobile',
    tolosa: 'http://192.168.1.138:8080/ebpls/api/mobile',
    tunga: 'http://192.168.1.139:8080/ebpls/api/mobile',
    villaba: 'http://192.168.1.140:8080/ebpls/api/mobile',
};

/**
 * Get the configured API URL based on the selected option
 * @returns The API URL string
 * @throws Error if API URL is not configured
 */
export const getApiUrl = async (): Promise<string> => {
    try {
        const configOption = await AsyncStorage.getItem(SELECTED_OPTION_KEY);

        if (!configOption) {
            throw new Error("API configuration not set. Please configure in settings.");
        }

        if (configOption === 'manual') {
            // Get manual API URL
            const manualApi = await AsyncStorage.getItem(MANUAL_API_KEY);
            if (!manualApi) {
                throw new Error("Manual API URL not configured");
            }
            return manualApi;
        } else if (configOption === 'municipality') {
            // Get municipality and return associated API
            const municipality = await AsyncStorage.getItem(SELECTED_MUNICIPALITY_KEY);
            if (!municipality) {
                throw new Error("Municipality not selected");
            }

            const apiUrl = MUNICIPALITY_APIS[municipality];
            if (!apiUrl) {
                throw new Error(`API URL not found for municipality: ${municipality}`);
            }
            return apiUrl;
        } else {
            throw new Error("Invalid configuration option");
        }
    } catch (error) {
        console.error("[API Helper] Error getting API URL:", error);
        throw error;
    }
};

/**
 * Set manual API URL
 * @param url The API URL to set
 */
export const setManualApiUrl = async (url: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(SELECTED_OPTION_KEY, 'manual');
        await AsyncStorage.setItem(MANUAL_API_KEY, url);
        await AsyncStorage.removeItem(SELECTED_MUNICIPALITY_KEY);
        console.log("[API Helper] Manual API URL set:", url);
    } catch (error) {
        console.error("[API Helper] Error setting manual API URL:", error);
        throw error;
    }
};

/**
 * Set municipality (which auto-configures API)
 * @param municipality The municipality code
 */
export const setMunicipality = async (municipality: string): Promise<void> => {
    try {
        if (!MUNICIPALITY_APIS[municipality]) {
            throw new Error(`Invalid municipality: ${municipality}`);
        }

        await AsyncStorage.setItem(SELECTED_OPTION_KEY, 'municipality');
        await AsyncStorage.setItem(SELECTED_MUNICIPALITY_KEY, municipality);
        await AsyncStorage.removeItem(MANUAL_API_KEY);
        console.log("[API Helper] Municipality set:", municipality);
        console.log("[API Helper] Associated API:", MUNICIPALITY_APIS[municipality]);
    } catch (error) {
        console.error("[API Helper] Error setting municipality:", error);
        throw error;
    }
};

/**
 * Get current configuration type
 * @returns 'manual' | 'municipality' | null
 */
export const getConfigType = async (): Promise<'manual' | 'municipality' | null> => {
    try {
        const configOption = await AsyncStorage.getItem(SELECTED_OPTION_KEY);
        return configOption as 'manual' | 'municipality' | null;
    } catch (error) {
        console.error("[API Helper] Error getting config type:", error);
        return null;
    }
};

/**
 * Get selected municipality
 * @returns The municipality code or null
 */
export const getSelectedMunicipality = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(SELECTED_MUNICIPALITY_KEY);
    } catch (error) {
        console.error("[API Helper] Error getting municipality:", error);
        return null;
    }
};

/**
 * Get manual API URL (if configured)
 * @returns The manual API URL or null
 */
export const getManualApiUrl = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(MANUAL_API_KEY);
    } catch (error) {
        console.error("[API Helper] Error getting manual API URL:", error);
        return null;
    }
};

/**
 * Check if API is configured
 * @returns true if configured, false otherwise
 */
export const isApiConfigured = async (): Promise<boolean> => {
    try {
        const configOption = await AsyncStorage.getItem(SELECTED_OPTION_KEY);
        if (!configOption) return false;

        if (configOption === 'manual') {
            const manualApi = await AsyncStorage.getItem(MANUAL_API_KEY);
            return !!manualApi;
        } else if (configOption === 'municipality') {
            const municipality = await AsyncStorage.getItem(SELECTED_MUNICIPALITY_KEY);
            return !!municipality;
        }

        return false;
    } catch (error) {
        console.error("[API Helper] Error checking if API is configured:", error);
        return false;
    }
};

/**
 * Clear all API configuration
 */
export const clearApiConfig = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SELECTED_OPTION_KEY);
        await AsyncStorage.removeItem(MANUAL_API_KEY);
        await AsyncStorage.removeItem(SELECTED_MUNICIPALITY_KEY);
        console.log("[API Helper] All API configuration cleared");
    } catch (error) {
        console.error("[API Helper] Error clearing API configuration:", error);
        throw error;
    }
};

/**
 * Get municipality API URL by municipality code
 * @param municipality The municipality code
 * @returns The API URL for the municipality
 */
export const getMunicipalityApiUrl = (municipality: string): string | undefined => {
    return MUNICIPALITY_APIS[municipality];
};

/**
 * Get all available municipalities
 * @returns Array of municipality codes
 */
export const getAvailableMunicipalities = (): string[] => {
    return Object.keys(MUNICIPALITY_APIS);
};