
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'medscan_history_v1';

/**
 * Scan Record Interface
 * @typedef {Object} ScanRecord
 * @property {string} id - Unique ID
 * @property {number} timestamp - Unix timestamp
 * @property {string} type - 'skin' | 'xray' | 'mri' | 'fracture'
 * @property {string} prediction - Main prediction title
 * @property {number} confidence - 0 to 1
 * @property {string} imageUri - Local URI of the image
 * @property {string} model - Model name used
 */

class HistoryService {
    
    /**
     * Save a new scan to history
     * @param {Omit<ScanRecord, 'id' | 'timestamp'>} scanData 
     */
    async saveScan(scanData) {
        try {
            const newRecord = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                ...scanData
            };

            const history = await this.getHistory();
            const updatedHistory = [newRecord, ...history];

            // Limit history to last 50 items to save space
            if (updatedHistory.length > 50) {
                updatedHistory.pop();
            }

            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
            console.log('Scan saved to history:', newRecord.id);
            return newRecord;
        } catch (error) {
            console.error('Failed to save scan:', error);
            return null;
        }
    }

    /**
     * Get all history items
     * @returns {Promise<ScanRecord[]>}
     */
    async getHistory() {
        try {
            const json = await AsyncStorage.getItem(HISTORY_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    }

    /**
     * Delete a specific record
     * @param {string} id 
     */
    async deleteScan(id) {
        try {
            const history = await this.getHistory();
            const updatedHistory = history.filter(item => item.id !== id);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Failed to delete scan:', error);
        }
    }

    /**
     * Clear all history
     */
    async clearHistory() {
        try {
            await AsyncStorage.removeItem(HISTORY_KEY);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }
}

export default new HistoryService();
