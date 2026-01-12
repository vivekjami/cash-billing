/**
 * ItemManager Component
 * 
 * CRUD interface for managing menu items.
 * Features: Add, Edit, Delete, Search items
 */

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';
import db from '../db/db';
import './ItemManager.css';

function ItemManager() {
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', price: '', category: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Biryani' });

    // Categories for dropdown
    const categories = ['Biryani', 'Starters', 'Sweets', 'Beverages', 'Main Course', 'Desserts'];

    // Load items from database
    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        const allItems = await db.items.toArray();
        setItems(allItems);
    }

    // Filter items based on search
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add new item
    async function handleAddItem(e) {
        e.preventDefault();
        if (!newItem.name || !newItem.price) return;

        await db.items.add({
            name: newItem.name,
            price: parseFloat(newItem.price),
            category: newItem.category
        });

        setNewItem({ name: '', price: '', category: 'Biryani' });
        setShowAddForm(false);
        loadItems();
    }

    // Start editing
    function startEdit(item) {
        setEditingId(item.id);
        setEditForm({
            name: item.name,
            price: item.price.toString(),
            category: item.category
        });
    }

    // Save edit
    async function saveEdit() {
        if (!editForm.name || !editForm.price) return;

        await db.items.update(editingId, {
            name: editForm.name,
            price: parseFloat(editForm.price),
            category: editForm.category
        });

        setEditingId(null);
        loadItems();
    }

    // Cancel edit
    function cancelEdit() {
        setEditingId(null);
        setEditForm({ name: '', price: '', category: '' });
    }

    // Delete item
    async function deleteItem(id) {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await db.items.delete(id);
            loadItems();
        }
    }

    return (
        <div className="item-manager">
            <div className="item-manager-header">
                <h2>Menu Items</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus size={18} />
                    Add Item
                </button>
            </div>

            {/* Add New Item Form */}
            {showAddForm && (
                <form className="add-item-form" onSubmit={handleAddItem}>
                    <input
                        type="text"
                        placeholder="Item name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        required
                    />
                    <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-success">
                            <Check size={16} /> Add
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowAddForm(false)}
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Search */}
            <div className="search-box">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Items List */}
            <div className="items-table">
                <div className="table-header">
                    <span>Name</span>
                    <span>Category</span>
                    <span>Price (₹)</span>
                    <span>Actions</span>
                </div>

                {filteredItems.map(item => (
                    <div key={item.id} className="table-row">
                        {editingId === item.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                />
                                <div className="row-actions">
                                    <button className="btn-icon success" onClick={saveEdit}>
                                        <Check size={16} />
                                    </button>
                                    <button className="btn-icon" onClick={cancelEdit}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span>{item.name}</span>
                                <span className="category-badge">{item.category}</span>
                                <span>₹{item.price.toFixed(2)}</span>
                                <div className="row-actions">
                                    <button className="btn-icon" onClick={() => startEdit(item)}>
                                        <Pencil size={16} />
                                    </button>
                                    <button className="btn-icon danger" onClick={() => deleteItem(item.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="no-items">
                        {searchQuery ? 'No items match your search' : 'No menu items yet. Add your first item!'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ItemManager;
