/**
 * MADHURAM POS Server
 * 
 * Express.js backend server for the POS system.
 * Provides REST API for menu items, bills, and settings.
 * Accessible across local network.
 */

import express from 'express';
import cors from 'cors';
import { networkInterfaces } from 'os';
import {
    initializeDatabase,
    getAllItems,
    addItem,
    updateItem,
    deleteItem,
    getAllBills,
    saveBill,
    clearAllBills,
    getNextBillNumber,
    resetBillNumber,
    getSetting,
    setSetting
} from './database.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase();

// ============== UTILITY ==============

/**
 * Get local IP addresses
 */
function getLocalIPs() {
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results;
}

// ============== MENU ITEMS API ==============

/**
 * GET /api/items - Get all menu items
 */
app.get('/api/items', (req, res) => {
    try {
        const items = getAllItems();
        res.json(items);
    } catch (error) {
        console.error('Error getting items:', error);
        res.status(500).json({ error: 'Failed to get items' });
    }
});

/**
 * POST /api/items - Add a new menu item
 */
app.post('/api/items', (req, res) => {
    try {
        const { name, price, category } = req.body;
        const id = addItem(name, price, category);
        res.json({ id, name, price, category });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

/**
 * PUT /api/items/:id - Update a menu item
 */
app.put('/api/items/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category } = req.body;
        updateItem(parseInt(id), name, price, category);
        res.json({ id: parseInt(id), name, price, category });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

/**
 * DELETE /api/items/:id - Delete a menu item
 */
app.delete('/api/items/:id', (req, res) => {
    try {
        const { id } = req.params;
        deleteItem(parseInt(id));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// ============== BILLS API ==============

/**
 * GET /api/bills - Get all bills
 */
app.get('/api/bills', (req, res) => {
    try {
        const bills = getAllBills();
        res.json(bills);
    } catch (error) {
        console.error('Error getting bills:', error);
        res.status(500).json({ error: 'Failed to get bills' });
    }
});

/**
 * POST /api/bills - Save a new bill
 */
app.post('/api/bills', (req, res) => {
    try {
        const billId = saveBill(req.body);
        res.json({ id: billId, success: true });
    } catch (error) {
        console.error('Error saving bill:', error);
        res.status(500).json({ error: 'Failed to save bill' });
    }
});

/**
 * DELETE /api/bills - Clear all bills
 */
app.delete('/api/bills', (req, res) => {
    try {
        clearAllBills();
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing bills:', error);
        res.status(500).json({ error: 'Failed to clear bills' });
    }
});

// ============== SETTINGS API ==============

/**
 * GET /api/settings/bill-number - Get next bill number
 */
app.get('/api/settings/bill-number', (req, res) => {
    try {
        const billNumber = getNextBillNumber();
        res.json({ billNumber });
    } catch (error) {
        console.error('Error getting bill number:', error);
        res.status(500).json({ error: 'Failed to get bill number' });
    }
});

/**
 * POST /api/settings/reset-bill-number - Reset bill number to 0
 */
app.post('/api/settings/reset-bill-number', (req, res) => {
    try {
        resetBillNumber();
        res.json({ success: true });
    } catch (error) {
        console.error('Error resetting bill number:', error);
        res.status(500).json({ error: 'Failed to reset bill number' });
    }
});

/**
 * GET /api/settings/:key - Get a setting
 */
app.get('/api/settings/:key', (req, res) => {
    try {
        const value = getSetting(req.params.key);
        res.json({ key: req.params.key, value });
    } catch (error) {
        console.error('Error getting setting:', error);
        res.status(500).json({ error: 'Failed to get setting' });
    }
});

/**
 * POST /api/settings/:key - Set a setting
 */
app.post('/api/settings/:key', (req, res) => {
    try {
        const { value } = req.body;
        setSetting(req.params.key, value);
        res.json({ key: req.params.key, value, success: true });
    } catch (error) {
        console.error('Error setting:', error);
        res.status(500).json({ error: 'Failed to set setting' });
    }
});

// ============== HEALTH CHECK ==============

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// ============== START SERVER ==============

app.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalIPs();

    console.log('\n========================================');
    console.log('  🍽️  MADHURAM POS Server Started!');
    console.log('========================================\n');
    console.log(`  Local:    http://localhost:${PORT}`);

    if (ips.length > 0) {
        console.log('\n  Network Access (for other devices):');
        ips.forEach(ip => {
            console.log(`            http://${ip}:${PORT}`);
        });
    }

    console.log('\n  API Endpoints:');
    console.log('    GET  /api/items          - List menu items');
    console.log('    POST /api/items          - Add menu item');
    console.log('    GET  /api/bills          - List all bills');
    console.log('    POST /api/bills          - Save a bill');
    console.log('    GET  /api/health         - Health check');
    console.log('\n========================================\n');
});
