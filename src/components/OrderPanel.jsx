/**
 * OrderPanel Component
 * 
 * Main order entry interface for creating bills.
 * Features:
 * - Search and select items from menu
 * - Adjust quantities
 * - Real-time bill calculation
 * - Print bill functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, Printer, RotateCcw, ChefHat } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import db, { getNextBillNumber, getNextKOTNumber, saveBill } from '../db/db';
import BillPreview from './BillPreview';
import KOTPreview from './KOTPreview';
import './OrderPanel.css';

function OrderPanel() {
    // State
    const [menuItems, setMenuItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [cashier, setCashier] = useState('Sunil');
    const [dineIn, setDineIn] = useState('Dine-in');
    const [customerName, setCustomerName] = useState('');
    const [billNumber, setBillNumber] = useState('00001');
    const [kotNumber, setKotNumber] = useState('00001');
    const [showBillPreview, setShowBillPreview] = useState(false);
    const [showKOTPreview, setShowKOTPreview] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Biryani');

    // Refs
    const billRef = useRef();
    const kotRef = useRef();

    // Load menu items
    useEffect(() => {
        loadMenuItems();
    }, []);

    async function loadMenuItems() {
        const items = await db.items.toArray();
        setMenuItems(items);
    }

    // Calculate bill totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Commented out taxes for now
    // const cgst = subtotal * 0.025; // 2.5%
    // const sgst = subtotal * 0.025; // 2.5%
    // const beforeRound = subtotal + cgst + sgst;
    // const roundOff = grandTotal - beforeRound;
    const cgst = 0;
    const sgst = 0;
    const roundOff = 0;
    const grandTotal = Math.round(subtotal);

    // Filter menu items based on search
    const filteredMenuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add item to order
    function addToOrder(item) {
        const existing = orderItems.find(o => o.id === item.id);
        if (existing) {
            setOrderItems(orderItems.map(o =>
                o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
            ));
        } else {
            setOrderItems([...orderItems, { ...item, quantity: 1 }]);
        }
        setSearchQuery('');
    }

    // Add new item to menu and order
    async function handleAddNewItem(e) {
        e.preventDefault();
        if (!newItemName || !newItemPrice) return;

        // Add to database
        const id = await db.items.add({
            name: newItemName,
            price: parseFloat(newItemPrice),
            category: newItemCategory
        });

        // Add to order immediately
        setOrderItems([...orderItems, {
            id,
            name: newItemName,
            price: parseFloat(newItemPrice),
            category: newItemCategory,
            quantity: 1
        }]);

        // Reset
        setSearchQuery('');
        setNewItemName('');
        setNewItemPrice('');
        setNewItemCategory('Biryani');
        setShowAddItem(false);

        // Reload menu items
        loadMenuItems();
    }

    // Categories for dropdown
    const categories = ['Tiffins', 'Combos', 'Fresh Juices', 'Milkshakes', 'Tea & Coffee'];

    // Update quantity
    function updateQuantity(id, delta) {
        setOrderItems(orderItems.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    }

    // Remove item
    function removeItem(id) {
        setOrderItems(orderItems.filter(item => item.id !== id));
    }

    // Clear order
    function clearOrder() {
        if (orderItems.length === 0 || window.confirm('Clear current order?')) {
            setOrderItems([]);
            setCustomerName('');
        }
    }

    // Print bill
    const handlePrint = useReactToPrint({
        contentRef: billRef,
        onAfterPrint: async () => {
            // Save bill to history
            const nextBillNumber = await getNextBillNumber();
            await saveBill({
                billNumber: billNumber,
                date: new Date().toLocaleDateString('en-IN'),
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                dineIn,
                cashier,
                customerName,
                items: orderItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    amount: item.price * item.quantity
                })),
                subtotal,
                cgst,
                sgst,
                roundOff,
                grandTotal
            });

            // Reset for next order
            setBillNumber(nextBillNumber);
            setOrderItems([]);
            setCustomerName('');
            setShowBillPreview(false);
        }
    });

    // Prepare print
    async function preparePrint() {
        if (orderItems.length === 0) {
            alert('Add items to order first!');
            return;
        }

        // Get current bill number if first print
        if (billNumber === '00001') {
            const next = await getNextBillNumber();
            setBillNumber(next);
        }

        setShowBillPreview(true);
    }

    // KOT print handler
    const handleKOTPrint = useReactToPrint({
        contentRef: kotRef,
        onAfterPrint: async () => {
            // Save bill to history when KOT is printed
            const nextBillNumber = await getNextBillNumber();
            await saveBill({
                billNumber: kotNumber,
                date: new Date().toLocaleDateString('en-IN'),
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                dineIn,
                cashier,
                customerName,
                items: orderItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    amount: item.price * item.quantity
                })),
                subtotal,
                cgst,
                sgst,
                roundOff,
                grandTotal
            });

            // Reset for next order
            setBillNumber(nextBillNumber);
            setKotNumber(nextBillNumber);
            setOrderItems([]);
            setCustomerName('');
            setShowKOTPreview(false);
        }
    });

    // Prepare KOT print
    async function prepareKOTPrint() {
        if (orderItems.length === 0) {
            alert('Add items to order first!');
            return;
        }

        // Get current bill number (synced with KOT)
        if (billNumber === '00001') {
            const next = await getNextBillNumber();
            setBillNumber(next);
            setKotNumber(next);
        } else {
            setKotNumber(billNumber);
        }

        setShowKOTPreview(true);
    }

    return (
        <div className="order-panel">
            {/* Order Info Header */}
            <div className="order-header">
                <div className="order-info-row">
                    <div className="info-field">
                        <label>Cashier</label>
                        <input
                            type="text"
                            value={cashier}
                            onChange={(e) => setCashier(e.target.value)}
                        />
                    </div>
                    <div className="info-field">
                        <label>Order Type</label>
                        <select
                            value={dineIn}
                            onChange={(e) => setDineIn(e.target.value)}
                        >
                            <option value="Dine-in">Dine-in</option>
                            <option value="Parcel">Parcel</option>
                        </select>
                    </div>
                    <div className="info-field">
                        <label>Customer Name</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                </div>
            </div>

            {/* Item Search */}
            <div className="item-search">
                <div className="search-input-wrapper">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Search Results Dropdown */}
                {searchQuery && (
                    <div className="search-results">
                        {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.slice(0, 8).map(item => (
                                <div
                                    key={item.id}
                                    className="search-result-item"
                                    onClick={() => addToOrder(item)}
                                >
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-price">₹{item.price.toFixed(2)}</span>
                                </div>
                            ))
                        ) : showAddItem ? (
                            <form className="add-item-inline" onSubmit={handleAddNewItem}>
                                <div className="add-item-header">
                                    <span>Add new item to menu</span>
                                </div>
                                <div className="add-item-fields-full">
                                    <input
                                        type="text"
                                        placeholder="Item name"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div className="add-item-fields">
                                    <input
                                        type="number"
                                        placeholder="Price (₹)"
                                        step="0.01"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        required
                                    />
                                    <select
                                        value={newItemCategory}
                                        onChange={(e) => setNewItemCategory(e.target.value)}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="add-item-actions">
                                    <button type="submit" className="btn btn-success btn-sm">
                                        <Plus size={16} /> Add & Order
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                            setShowAddItem(false);
                                            setSearchQuery('');
                                            setNewItemName('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="no-results-action">
                                <p>"{searchQuery}" not found in menu</p>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setNewItemName(searchQuery);
                                        setShowAddItem(true);
                                    }}
                                >
                                    <Plus size={16} /> Add to Menu
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Order Items List */}
            <div className="order-items">
                <div className="order-items-header">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Amount</span>
                    <span></span>
                </div>

                <div className="order-items-list">
                    {orderItems.map(item => (
                        <div key={item.id} className="order-item">
                            <span className="item-name">{item.name}</span>
                            <div className="qty-controls">
                                <button onClick={() => updateQuantity(item.id, -1)}>
                                    <Minus size={14} />
                                </button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)}>
                                    <Plus size={14} />
                                </button>
                            </div>
                            <span>₹{item.price.toFixed(2)}</span>
                            <span className="item-amount">₹{(item.price * item.quantity).toFixed(2)}</span>
                            <button className="remove-btn" onClick={() => removeItem(item.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {orderItems.length === 0 && (
                        <div className="empty-order">
                            Search and select items to add to order
                        </div>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
                <div className="summary-line">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {/* Commented out taxes for now
                <div className="summary-line tax">
                    <span>CGST (2.5%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="summary-line tax">
                    <span>SGST (2.5%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                    <span>Round off</span>
                    <span>{roundOff >= 0 ? '+' : ''}₹{roundOff.toFixed(2)}</span>
                </div>
                */}
                <div className="summary-line total">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
                <button className="btn btn-secondary" onClick={clearOrder}>
                    <RotateCcw size={18} />
                    Clear
                </button>
                <button className="btn btn-warning" onClick={prepareKOTPrint}>
                    <ChefHat size={18} />
                    KOT
                </button>
                <button className="btn btn-primary" onClick={preparePrint}>
                    <Printer size={18} />
                    Print Bill
                </button>
            </div>

            {/* Bill Preview Modal */}
            {showBillPreview && (
                <div className="bill-modal-overlay" onClick={() => setShowBillPreview(false)}>
                    <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bill-modal-header">
                            <h3>Bill Preview</h3>
                            <button onClick={() => setShowBillPreview(false)}>×</button>
                        </div>
                        <div className="bill-modal-content">
                            <BillPreview
                                ref={billRef}
                                billNumber={billNumber}
                                items={orderItems}
                                subtotal={subtotal}
                                cgst={cgst}
                                sgst={sgst}
                                roundOff={roundOff}
                                grandTotal={grandTotal}
                                cashier={cashier}
                                dineIn={dineIn}
                                customerName={customerName}
                            />
                        </div>
                        <div className="bill-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowBillPreview(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handlePrint}>
                                <Printer size={18} />
                                Print Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KOT Preview Modal */}
            {showKOTPreview && (
                <div className="bill-modal-overlay" onClick={() => setShowKOTPreview(false)}>
                    <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bill-modal-header">
                            <h3>KOT Preview</h3>
                            <button onClick={() => setShowKOTPreview(false)}>×</button>
                        </div>
                        <div className="bill-modal-content">
                            <KOTPreview
                                ref={kotRef}
                                kotNumber={kotNumber}
                                items={orderItems}
                                tableNumber={dineIn}
                                orderType={dineIn}
                            />
                        </div>
                        <div className="bill-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowKOTPreview(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-warning" onClick={handleKOTPrint}>
                                <ChefHat size={18} />
                                Print KOT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderPanel;
