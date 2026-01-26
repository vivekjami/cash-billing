/**
 * MADHURAM POS - Main Application
 * 
 * Restaurant point-of-sale system with:
 * - Order management and bill printing
 * - Item CRUD operations
 * - Excel backup/restore functionality
 * - Bill history tracking
 * - Server-based storage (accessible across network)
 */

import React, { useState } from 'react';
import {
  ShoppingCart,
  Package,
  History,
  Settings,
  Menu,
  X
} from 'lucide-react';
import OrderPanel from './components/OrderPanel';
import ItemManager from './components/ItemManager';
import BillHistory from './components/BillHistory';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('order');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'order', label: 'New Order', icon: ShoppingCart },
    { id: 'items', label: 'Menu Items', icon: Package },
    { id: 'history', label: 'Bill History', icon: History },
    { id: 'settings', label: 'Admin', icon: Settings },
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h1>MADHURAM</h1>
            <span>POS System</span>
          </div>
          <button
            className="sidebar-toggle mobile"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>MADHURAM</p>
          <p className="small">CAFÉ AND TIFFINS</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
          <div className="header-time">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'order' && <OrderPanel />}
          {activeTab === 'items' && <ItemManager />}
          {activeTab === 'history' && <BillHistory />}
          {activeTab === 'settings' && <AdminPanel />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
