/**
 * Database Module for MADHURAM POS
 * 
 * Uses better-sqlite3 for synchronous SQLite operations.
 * All data is stored in madhuram.db file.
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database file in server directory
const dbPath = join(__dirname, 'madhuram.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');

/**
 * Initialize database tables
 */
export function initializeDatabase() {
    // Items table (menu items)
    db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Bills table
    db.exec(`
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_number TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            dine_in TEXT,
            cashier TEXT,
            customer_name TEXT,
            subtotal REAL NOT NULL,
            cgst REAL DEFAULT 0,
            sgst REAL DEFAULT 0,
            round_off REAL DEFAULT 0,
            grand_total REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Bill items table (items in each bill)
    db.exec(`
        CREATE TABLE IF NOT EXISTS bill_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            amount REAL NOT NULL,
            FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
        )
    `);

    // Settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `);

    console.log('✅ Database initialized at:', dbPath);

    // Initialize with sample menu items if empty
    initializeSampleItems();
}

/**
 * Initialize sample menu items if table is empty
 */
function initializeSampleItems() {
    const count = db.prepare('SELECT COUNT(*) as count FROM items').get();

    if (count.count === 0) {
        const insert = db.prepare('INSERT INTO items (name, price, category) VALUES (?, ?, ?)');

        const items = [
            // Tiffins
            ['Idli', 30.00, 'Tiffins'],
            ['Sambar Idli', 50.00, 'Tiffins'],
            ['Gheepodi Idli', 60.00, 'Tiffins'],
            ['Vada', 50.00, 'Tiffins'],
            ['Perugu Vada', 60.00, 'Tiffins'],
            ['Mysore Bonda', 40.00, 'Tiffins'],
            ['Upma', 40.00, 'Tiffins'],
            ['Ghee Upma', 50.00, 'Tiffins'],
            ['Ghee Pongal', 60.00, 'Tiffins'],
            ['Poori', 55.00, 'Tiffins'],
            ['Plain Dosa', 55.00, 'Tiffins'],
            ['Onion Dosa', 65.00, 'Tiffins'],
            ['Masala Dosa', 70.00, 'Tiffins'],
            ['Upma Dosa', 65.00, 'Tiffins'],
            ['Onion Masala Dosa', 75.00, 'Tiffins'],
            ['Ghee Karam Dosa', 80.00, 'Tiffins'],
            ['Ghee Karam Onion Dosa', 90.00, 'Tiffins'],
            ['Ghee Karam Masala Dosa', 95.00, 'Tiffins'],
            ['Ghee Karam Upma Dosa', 95.00, 'Tiffins'],
            ['Ravva Dosa', 50.00, 'Tiffins'],
            ['Onion Ravva Dosa', 60.00, 'Tiffins'],
            ['Ravva Upma Dosa', 60.00, 'Tiffins'],
            ['Onion Masala Ravva', 75.00, 'Tiffins'],
            ['Uthappam', 55.00, 'Tiffins'],
            ['Plain Pesarattu', 60.00, 'Tiffins'],
            ['Chitti Pesarattu Upma', 65.00, 'Tiffins'],
            ['Chitti Pesarattu', 60.00, 'Tiffins'],
            ['Pesarattu Upma', 60.00, 'Tiffins'],
            ['Onion Pesarattu', 70.00, 'Tiffins'],
            ['Onion Pesarattu Upma', 80.00, 'Tiffins'],
            ['Chapathi', 50.00, 'Tiffins'],
            ['Parotta', 50.00, 'Tiffins'],
            ['Single Poori Upma', 40.00, 'Tiffins'],
            ['Pottikkallu', 40.00, 'Tiffins'],
            ['Single Idli', 20.00, 'Tiffins'],
            ['Single Vada', 30.00, 'Tiffins'],
            ['Single Poori', 30.00, 'Tiffins'],
            ['Single Perugu Vada', 30.00, 'Tiffins'],
            // Combos
            ['2 Idli & 1 Bonda', 45.00, 'Combos'],
            ['1 Idli & 2 Bonda', 40.00, 'Combos'],
            ['1 Idli & 1 Bonda', 30.00, 'Combos'],
            // Fresh Juices
            ['ABC Juice', 80.00, 'Fresh Juices'],
            ['Carrot Juice', 70.00, 'Fresh Juices'],
            ['Beetroot Juice', 70.00, 'Fresh Juices'],
            ['Watermelon Juice', 60.00, 'Fresh Juices'],
            ['Banana Juice', 50.00, 'Fresh Juices'],
            ['Grapes Juice', 50.00, 'Fresh Juices'],
            ['Karbujua Juice', 50.00, 'Fresh Juices'],
            ['Pineapple Juice', 60.00, 'Fresh Juices'],
            ['Papaya Juice', 50.00, 'Fresh Juices'],
            // Milkshakes
            ['Chocolate Milkshake', 70.00, 'Milkshakes'],
            ['Vanilla Milkshake', 60.00, 'Milkshakes'],
            ['Strawberry Milkshake', 70.00, 'Milkshakes'],
            ['Butterscotch Milkshake', 80.00, 'Milkshakes'],
            // Tea & Coffee
            ['Tea', 10.00, 'Tea & Coffee'],
            ['Green Tea', 20.00, 'Tea & Coffee'],
            ['Lemon Tea', 20.00, 'Tea & Coffee'],
            ['Ginger Tea', 20.00, 'Tea & Coffee'],
            ['Filter Coffee', 30.00, 'Tea & Coffee'],
            ['Coffee (Extra Strong)', 25.00, 'Tea & Coffee'],
            ['Black Coffee', 20.00, 'Tea & Coffee'],
            ['Hot Milk', 25.00, 'Tea & Coffee'],
            ['Boost', 30.00, 'Tea & Coffee'],
            ['Horlicks', 30.00, 'Tea & Coffee'],
            ['Bournvita', 30.00, 'Tea & Coffee'],
        ];

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                insert.run(item[0], item[1], item[2]);
            }
        });

        insertMany(items);
        console.log('✅ Sample menu items initialized');
    }
}

// ============== ITEMS ==============

/**
 * Get all menu items
 */
export function getAllItems() {
    return db.prepare('SELECT * FROM items ORDER BY category, name').all();
}

/**
 * Add a new menu item
 */
export function addItem(name, price, category) {
    const result = db.prepare('INSERT INTO items (name, price, category) VALUES (?, ?, ?)').run(name, price, category);
    return result.lastInsertRowid;
}

/**
 * Update a menu item
 */
export function updateItem(id, name, price, category) {
    return db.prepare('UPDATE items SET name = ?, price = ?, category = ? WHERE id = ?').run(name, price, category, id);
}

/**
 * Delete a menu item
 */
export function deleteItem(id) {
    return db.prepare('DELETE FROM items WHERE id = ?').run(id);
}

// ============== BILLS ==============

/**
 * Get all bills with their items
 */
export function getAllBills() {
    const bills = db.prepare('SELECT * FROM bills ORDER BY id DESC').all();

    // Get items for each bill
    const getBillItems = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?');

    return bills.map(bill => ({
        id: bill.id,
        billNumber: bill.bill_number,
        date: bill.date,
        time: bill.time,
        dineIn: bill.dine_in,
        cashier: bill.cashier,
        customerName: bill.customer_name,
        subtotal: bill.subtotal,
        cgst: bill.cgst,
        sgst: bill.sgst,
        roundOff: bill.round_off,
        grandTotal: bill.grand_total,
        items: getBillItems.all(bill.id).map(item => ({
            name: item.item_name,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount
        }))
    }));
}

/**
 * Save a new bill
 */
export function saveBill(billData) {
    const insertBill = db.prepare(`
        INSERT INTO bills (bill_number, date, time, dine_in, cashier, customer_name, subtotal, cgst, sgst, round_off, grand_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
        INSERT INTO bill_items (bill_id, item_name, quantity, price, amount)
        VALUES (?, ?, ?, ?, ?)
    `);

    const saveBillTransaction = db.transaction((data) => {
        const result = insertBill.run(
            data.billNumber,
            data.date,
            data.time,
            data.dineIn,
            data.cashier,
            data.customerName || '',
            data.subtotal,
            data.cgst || 0,
            data.sgst || 0,
            data.roundOff || 0,
            data.grandTotal
        );

        const billId = result.lastInsertRowid;

        for (const item of data.items) {
            insertItem.run(billId, item.name, item.quantity, item.price, item.amount);
        }

        return billId;
    });

    return saveBillTransaction(billData);
}

/**
 * Clear all bills
 */
export function clearAllBills() {
    db.prepare('DELETE FROM bill_items').run();
    db.prepare('DELETE FROM bills').run();
    console.log('✅ All bills cleared');
}

// ============== SETTINGS ==============

/**
 * Get a setting value
 */
export function getSetting(key) {
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
}

/**
 * Set a setting value
 */
export function setSetting(key, value) {
    return db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
}

/**
 * Get today's date string
 */
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get next bill number (resets daily)
 */
export function getNextBillNumber() {
    const today = getTodayDateString();
    const lastDate = getSetting('lastBillDate');
    let nextNumber;

    if (lastDate !== today) {
        // New day, reset to 1
        nextNumber = 1;
        setSetting('lastBillDate', today);
    } else {
        const lastNumber = parseInt(getSetting('lastBillNumber') || '0');
        nextNumber = lastNumber + 1;
    }

    setSetting('lastBillNumber', nextNumber);
    return nextNumber.toString().padStart(5, '0');
}

/**
 * Reset bill number to 0
 */
export function resetBillNumber() {
    setSetting('lastBillNumber', 0);
    console.log('✅ Bill number reset to 0');
}

/**
 * Close database connection
 */
export function closeDatabase() {
    db.close();
}

export default db;
