/**
 * API Client for MADHURAM POS
 * 
 * Communicates with the backend server.
 * Automatically detects server URL based on current location.
 */

// Determine API base URL
// In development, server runs on port 3001
// The frontend will connect to the same host but port 3001
const API_BASE = (() => {
    // If running locally, use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }
    // If running on network, use the same IP but port 3001
    return `http://${window.location.hostname}:3001/api`;
})();

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request failed: ${endpoint}`, error);
        throw error;
    }
}

// ============== MENU ITEMS ==============

/**
 * Get all menu items
 */
export async function getItems() {
    return await apiRequest('/items');
}

/**
 * Add a new menu item
 */
export async function addItem(name, price, category) {
    return await apiRequest('/items', {
        method: 'POST',
        body: { name, price, category }
    });
}

/**
 * Update a menu item
 */
export async function updateItem(id, name, price, category) {
    return await apiRequest(`/items/${id}`, {
        method: 'PUT',
        body: { name, price, category }
    });
}

/**
 * Delete a menu item
 */
export async function deleteItem(id) {
    return await apiRequest(`/items/${id}`, {
        method: 'DELETE'
    });
}

// ============== BILLS ==============

/**
 * Get all bills
 */
export async function getBills() {
    return await apiRequest('/bills');
}

/**
 * Save a new bill
 */
export async function saveBillApi(billData) {
    return await apiRequest('/bills', {
        method: 'POST',
        body: billData
    });
}

/**
 * Clear all bills
 */
export async function clearBills() {
    return await apiRequest('/bills', {
        method: 'DELETE'
    });
}

// ============== SETTINGS ==============

/**
 * Get next bill number
 */
export async function getNextBillNumberApi() {
    const result = await apiRequest('/settings/bill-number');
    return result.billNumber;
}

/**
 * Reset bill number
 */
export async function resetBillNumberApi() {
    return await apiRequest('/settings/reset-bill-number', {
        method: 'POST'
    });
}

// ============== HEALTH CHECK ==============

/**
 * Check if server is running
 */
export async function checkServerHealth() {
    try {
        const result = await apiRequest('/health');
        return result.status === 'ok';
    } catch {
        return false;
    }
}

export default {
    getItems,
    addItem,
    updateItem,
    deleteItem,
    getBills,
    saveBillApi,
    clearBills,
    getNextBillNumberApi,
    resetBillNumberApi,
    checkServerHealth
};
