/**
 * Database configuration using Dexie.js (IndexedDB wrapper)
 * 
 * Stores:
 * - items: Menu items with name, price, category
 * - bills: Bill history for backup/restore
 * - settings: App settings (last bill number, cashier name, etc.)
 */

import Dexie from 'dexie';

// Create database instance
export const db = new Dexie('DakshinPOS');

// Define schema
db.version(1).stores({
    items: '++id, name, price, category',
    bills: '++id, billNumber, date, time',
    settings: 'key'
});

/**
 * Get today's date string in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get the next bill number (padded to 5 digits)
 * Resets to 1 each new day
 * @returns {Promise<string>} Next bill number (e.g., "00001")
 */
export async function getNextBillNumber() {
    const today = getTodayDateString();
    const dateSetting = await db.settings.get('lastBillDate');
    const numberSetting = await db.settings.get('lastBillNumber');

    let nextNumber;

    // Check if it's a new day - reset counter
    if (!dateSetting || dateSetting.value !== today) {
        nextNumber = 1;
        await db.settings.put({ key: 'lastBillDate', value: today });
    } else {
        nextNumber = numberSetting ? numberSetting.value + 1 : 1;
    }

    await db.settings.put({ key: 'lastBillNumber', value: nextNumber });
    return nextNumber.toString().padStart(5, '0');
}

/**
 * Get the next KOT number (synced with bill number, padded to 5 digits)
 * Resets to 1 each new day (same as bill number)
 * @returns {Promise<string>} Next KOT number (same as bill number, e.g., "00001")
 */
export async function getNextKOTNumber() {
    const today = getTodayDateString();
    const dateSetting = await db.settings.get('lastBillDate');
    const numberSetting = await db.settings.get('lastBillNumber');

    // Check if it's a new day - would reset to 1
    if (!dateSetting || dateSetting.value !== today) {
        return '00001';
    }

    const nextNumber = numberSetting ? numberSetting.value + 1 : 1;
    return nextNumber.toString().padStart(5, '0');
}

/**
 * Reset bill number to 0 (next bill will be 00001)
 */
export async function resetBillNumber() {
    await db.settings.put({ key: 'lastBillNumber', value: 0 });
}

/**
 * Save a bill to history
 * @param {Object} bill - Bill data
 * @returns {Promise<number>} Bill ID
 */
export async function saveBill(bill) {
    return await db.bills.add(bill);
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
 * Clear all items and reload the menu
 */
export async function resetMenuItems() {
    await db.items.clear();
    await initializeSampleItems();
}

/**
 * Initialize with Madhuram Cafe menu items if empty
 */
export async function initializeSampleItems() {
    const count = await db.items.count();
    if (count === 0) {
        await db.items.bulkAdd([
            // Tiffins
            { name: 'Idli', price: 30.00, category: 'Tiffins' },
            { name: 'Sambar Idli', price: 50.00, category: 'Tiffins' },
            { name: 'Gheepodi Idli', price: 60.00, category: 'Tiffins' },
            { name: 'Vada', price: 50.00, category: 'Tiffins' },
            { name: 'Perugu Vada', price: 60.00, category: 'Tiffins' },
            { name: 'Mysore Bonda', price: 40.00, category: 'Tiffins' },
            { name: 'Upma', price: 40.00, category: 'Tiffins' },
            { name: 'Ghee Upma', price: 50.00, category: 'Tiffins' },
            { name: 'Ghee Pongal', price: 60.00, category: 'Tiffins' },
            { name: 'Poori', price: 55.00, category: 'Tiffins' },
            { name: 'Plain Dosa', price: 55.00, category: 'Tiffins' },
            { name: 'Onion Dosa', price: 65.00, category: 'Tiffins' },
            { name: 'Masala Dosa', price: 70.00, category: 'Tiffins' },
            { name: 'Upma Dosa', price: 65.00, category: 'Tiffins' },
            { name: 'Onion Masala Dosa', price: 75.00, category: 'Tiffins' },
            { name: 'Ghee Karam Dosa', price: 80.00, category: 'Tiffins' },
            { name: 'Ghee Karam Onion Dosa', price: 90.00, category: 'Tiffins' },
            { name: 'Ghee Karam Masala Dosa', price: 95.00, category: 'Tiffins' },
            { name: 'Ghee Karam Upma Dosa', price: 95.00, category: 'Tiffins' },
            { name: 'Ravva Dosa', price: 50.00, category: 'Tiffins' },
            { name: 'Onion Ravva Dosa', price: 60.00, category: 'Tiffins' },
            { name: 'Ravva Upma Dosa', price: 60.00, category: 'Tiffins' },
            { name: 'Onion Masala Ravva', price: 75.00, category: 'Tiffins' },
            { name: 'Uthappam', price: 55.00, category: 'Tiffins' },
            { name: 'Plain Pesarattu', price: 60.00, category: 'Tiffins' },
            { name: 'Chitti Pesarattu Upma', price: 65.00, category: 'Tiffins' },
            { name: 'Chitti Pesarattu', price: 60.00, category: 'Tiffins' },
            { name: 'Pesarattu Upma', price: 60.00, category: 'Tiffins' },
            { name: 'Onion Pesarattu', price: 70.00, category: 'Tiffins' },
            { name: 'Onion Pesarattu Upma', price: 80.00, category: 'Tiffins' },
            { name: 'Chapathi', price: 50.00, category: 'Tiffins' },
            { name: 'Parotta', price: 50.00, category: 'Tiffins' },
            { name: 'Single Poori Upma', price: 40.00, category: 'Tiffins' },
            { name: 'Pottikkallu', price: 40.00, category: 'Tiffins' },
            { name: 'Single Idli', price: 20.00, category: 'Tiffins' },
            { name: 'Single Vada', price: 30.00, category: 'Tiffins' },
            { name: 'Single Poori', price: 30.00, category: 'Tiffins' },
            { name: 'Single Perugu Vada', price: 30.00, category: 'Tiffins' },
            // Combos
            { name: '2 Idli & 1 Bonda', price: 45.00, category: 'Combos' },
            { name: '1 Idli & 2 Bonda', price: 40.00, category: 'Combos' },
            { name: '1 Idli & 1 Bonda', price: 30.00, category: 'Combos' },
            // Fresh Juices
            { name: 'ABC Juice', price: 80.00, category: 'Fresh Juices' },
            { name: 'Carrot Juice', price: 70.00, category: 'Fresh Juices' },
            { name: 'Beetroot Juice', price: 70.00, category: 'Fresh Juices' },
            { name: 'Watermelon Juice', price: 60.00, category: 'Fresh Juices' },
            { name: 'Banana Juice', price: 50.00, category: 'Fresh Juices' },
            { name: 'Grapes Juice', price: 50.00, category: 'Fresh Juices' },
            { name: 'Karbujua Juice', price: 50.00, category: 'Fresh Juices' },
            { name: 'Pineapple Juice', price: 60.00, category: 'Fresh Juices' },
            { name: 'Papaya Juice', price: 50.00, category: 'Fresh Juices' },
            // Milkshakes
            { name: 'Chocolate Milkshake', price: 70.00, category: 'Milkshakes' },
            { name: 'Vanilla Milkshake', price: 60.00, category: 'Milkshakes' },
            { name: 'Strawberry Milkshake', price: 70.00, category: 'Milkshakes' },
            { name: 'Butterscotch Milkshake', price: 80.00, category: 'Milkshakes' },
            // Tea & Coffee
            { name: 'Tea', price: 10.00, category: 'Tea & Coffee' },
            { name: 'Green Tea', price: 20.00, category: 'Tea & Coffee' },
            { name: 'Lemon Tea', price: 20.00, category: 'Tea & Coffee' },
            { name: 'Ginger Tea', price: 20.00, category: 'Tea & Coffee' },
            { name: 'Filter Coffee', price: 30.00, category: 'Tea & Coffee' },
            { name: 'Coffee (Extra Strong)', price: 25.00, category: 'Tea & Coffee' },
            { name: 'Black Coffee', price: 20.00, category: 'Tea & Coffee' },
            { name: 'Hot Milk', price: 25.00, category: 'Tea & Coffee' },
            { name: 'Boost', price: 30.00, category: 'Tea & Coffee' },
            { name: 'Horlicks', price: 30.00, category: 'Tea & Coffee' },
            { name: 'Bournvita', price: 30.00, category: 'Tea & Coffee' },
        ]);
    }
}

export default db;
