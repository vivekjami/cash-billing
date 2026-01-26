/**
 * Database Layer for MADHURAM POS
 * 
 * This module provides the same interface as before but uses
 * the backend API instead of IndexedDB.
 * 
 * All data is now stored on the server in SQLite database.
 */

import {
    getItems,
    addItem as apiAddItem,
    updateItem as apiUpdateItem,
    deleteItem as apiDeleteItem,
    getBills,
    saveBillApi,
    clearBills,
    getNextBillNumberApi,
    resetBillNumberApi
} from '../api/api.js';

// Local cache for items (to reduce API calls)
let itemsCache = null;
let itemsCacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Database-like object for compatibility with existing components
 */
const db = {
    items: {
        /**
         * Get all items as array
         */
        async toArray() {
            // Use cache if fresh
            const now = Date.now();
            if (itemsCache && (now - itemsCacheTime) < CACHE_DURATION) {
                return itemsCache;
            }

            try {
                const items = await getItems();
                itemsCache = items;
                itemsCacheTime = now;
                return items;
            } catch (error) {
                console.error('Failed to get items from server:', error);
                // Return cached items if available, even if stale
                if (itemsCache) return itemsCache;
                return [];
            }
        },

        /**
         * Add a new item
         */
        async add(item) {
            try {
                const result = await apiAddItem(item.name, item.price, item.category);
                // Invalidate cache
                itemsCache = null;
                return result.id;
            } catch (error) {
                console.error('Failed to add item:', error);
                throw error;
            }
        },

        /**
         * Update an item
         */
        async update(id, changes) {
            try {
                await apiUpdateItem(id, changes.name, changes.price, changes.category);
                // Invalidate cache
                itemsCache = null;
            } catch (error) {
                console.error('Failed to update item:', error);
                throw error;
            }
        },

        /**
         * Delete an item
         */
        async delete(id) {
            try {
                await apiDeleteItem(id);
                // Invalidate cache
                itemsCache = null;
            } catch (error) {
                console.error('Failed to delete item:', error);
                throw error;
            }
        },

        /**
         * Count items
         */
        async count() {
            const items = await this.toArray();
            return items.length;
        }
    },

    bills: {
        /**
         * Get all bills as array
         */
        async toArray() {
            try {
                return await getBills();
            } catch (error) {
                console.error('Failed to get bills from server:', error);
                return [];
            }
        },

        /**
         * Add a new bill
         */
        async add(bill) {
            try {
                const result = await saveBillApi(bill);
                return result.id;
            } catch (error) {
                console.error('Failed to save bill:', error);
                throw error;
            }
        },

        /**
         * Clear all bills
         */
        async clear() {
            try {
                await clearBills();
            } catch (error) {
                console.error('Failed to clear bills:', error);
                throw error;
            }
        }
    },

    settings: {
        /**
         * Get a setting (not used directly, kept for compatibility)
         */
        async get(key) {
            // Settings are handled server-side
            return null;
        },

        /**
         * Put a setting (not used directly, kept for compatibility)
         */
        async put(setting) {
            // Settings are handled server-side
            return;
        }
    }
};

/**
 * Get the next bill number (padded to 5 digits)
 * @returns {Promise<string>} Next bill number (e.g., "00001")
 */
export async function getNextBillNumber() {
    try {
        return await getNextBillNumberApi();
    } catch (error) {
        console.error('Failed to get next bill number:', error);
        // Fallback to local generation if server is unavailable
        return '00001';
    }
}

/**
 * Get the next KOT number (synced with bill number)
 * @returns {Promise<string>} Next KOT number
 */
export async function getNextKOTNumber() {
    return await getNextBillNumber();
}

/**
 * Reset bill number to 0 (next bill will be 00001)
 */
export async function resetBillNumber() {
    try {
        await resetBillNumberApi();
    } catch (error) {
        console.error('Failed to reset bill number:', error);
        throw error;
    }
}

/**
 * Save a bill to history
 * @param {Object} bill - Bill data
 * @returns {Promise<number>} Bill ID
 */
export async function saveBill(bill) {
    try {
        const result = await saveBillApi(bill);
        return result.id;
    } catch (error) {
        console.error('Failed to save bill:', error);
        throw error;
    }
}

/**
 * Get all bills
 * @returns {Promise<Array>} All bills
 */
export async function getAllBills() {
    return await db.bills.toArray();
}

/**
 * Clear all bills
 */
export async function clearAllBills() {
    await db.bills.clear();
}

/**
 * Reset menu items (not typically needed with server)
 */
export async function resetMenuItems() {
    // Menu items are managed on the server
    console.log('Menu items are managed on the server');
}

/**
 * Initialize sample items (handled by server)
 */
export async function initializeSampleItems() {
    // Sample items are initialized on the server
    console.log('Sample items initialized on server');
}

export { db };
export default db;
