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
 * Get the next bill number (padded to 5 digits)
 * @returns {Promise<string>} Next bill number (e.g., "00001")
 */
export async function getNextBillNumber() {
    const setting = await db.settings.get('lastBillNumber');
    const nextNumber = setting ? setting.value + 1 : 1;
    await db.settings.put({ key: 'lastBillNumber', value: nextNumber });
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
 * Initialize with sample items if empty
 */
export async function initializeSampleItems() {
    const count = await db.items.count();
    if (count === 0) {
        await db.items.bulkAdd([
            { name: 'Chilli Wings', price: 330.00, category: 'Starters' },
            { name: 'Chicken Mughalai Mix Biryani', price: 330.00, category: 'Biryani' },
            { name: 'Bliss Water', price: 27.00, category: 'Beverages' },
            { name: 'Chicken Gongura Biryani (boneless)', price: 360.00, category: 'Biryani' },
            { name: 'Mutton Biryani', price: 380.00, category: 'Biryani' },
            { name: 'Veg Biryani', price: 220.00, category: 'Biryani' },
            { name: 'Paneer Biryani', price: 280.00, category: 'Biryani' },
            { name: 'Gulab Jamun', price: 60.00, category: 'Sweets' },
            { name: 'Double Ka Meetha', price: 80.00, category: 'Sweets' },
            { name: 'Soft Drinks', price: 40.00, category: 'Beverages' },
            { name: 'Fresh Lime Soda', price: 50.00, category: 'Beverages' },
            { name: 'Chicken 65', price: 280.00, category: 'Starters' },
            { name: 'Paneer 65', price: 240.00, category: 'Starters' },
        ]);
    }
}

export default db;
