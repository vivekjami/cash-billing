/**
 * AdminPanel Component
 * 
 * Secure admin panel with password protection.
 * Features:
 * - Admin login with strong password
 * - Excel backup functionality
 * - Backup & Restore (clear database and reset)
 */

import React, { useState } from 'react';
import {
    Download,
    RefreshCcw,
    FileSpreadsheet,
    AlertTriangle,
    Lock,
    Shield,
    Eye,
    EyeOff,
    LogOut
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAllBills, clearAllBills, resetBillNumber } from '../db/db';
import './AdminPanel.css';

// Admin credentials - In production, this should be stored securely
const ADMIN_PASSWORD = 'Madhuram@2024#Admin';

function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Handle login
    function handleLogin(e) {
        e.preventDefault();

        if (isLocked) {
            setLoginError(`Too many attempts. Try again in ${lockTimer} seconds.`);
            return;
        }

        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setPassword('');
            setLoginError('');
            setLoginAttempts(0);
        } else {
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            setPassword('');

            if (newAttempts >= 5) {
                // Lock for 60 seconds after 5 failed attempts
                setIsLocked(true);
                let timeLeft = 60;
                setLockTimer(timeLeft);

                const interval = setInterval(() => {
                    timeLeft -= 1;
                    setLockTimer(timeLeft);

                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        setIsLocked(false);
                        setLoginAttempts(0);
                        setLoginError('');
                    }
                }, 1000);

                setLoginError('Account locked for 60 seconds due to too many failed attempts.');
            } else {
                setLoginError(`Invalid password. ${5 - newAttempts} attempts remaining.`);
            }
        }
    }

    // Handle logout
    function handleLogout() {
        setIsAuthenticated(false);
        setPassword('');
    }

    /**
     * Export bills to Excel file
     */
    async function exportToExcel() {
        const bills = await getAllBills();

        if (bills.length === 0) {
            alert('No bills to backup!');
            return null;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Bills Summary Sheet
        const summaryData = bills.map(bill => ({
            'Bill No': bill.billNumber,
            'Date': bill.date,
            'Time': bill.time,
            'Table': bill.dineIn,
            'Cashier': bill.cashier,
            'Customer': bill.customerName || '-',
            'Items Count': bill.items.length,
            'Subtotal': bill.subtotal,
            'CGST': bill.cgst,
            'SGST': bill.sgst,
            'Round Off': bill.roundOff,
            'Grand Total': bill.grandTotal
        }));

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Bills Summary');

        // Detailed Items Sheet
        const itemsData = [];
        bills.forEach(bill => {
            bill.items.forEach(item => {
                itemsData.push({
                    'Bill No': bill.billNumber,
                    'Date': bill.date,
                    'Item Name': item.name,
                    'Quantity': item.quantity,
                    'Unit Price': item.price,
                    'Amount': item.amount
                });
            });
        });

        const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
        XLSX.utils.book_append_sheet(wb, itemsSheet, 'Bill Items');

        // Generate filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 10);
        const filename = `MADHURAM_Bills_Backup_${timestamp}.xlsx`;

        // Download file
        XLSX.writeFile(wb, filename);

        return filename;
    }

    /**
     * Backup only - download Excel
     */
    async function handleBackup() {
        setIsLoading(true);
        try {
            const filename = await exportToExcel();
            if (filename) {
                alert(`Backup saved as ${filename}`);
            }
        } catch (error) {
            console.error('Backup error:', error);
            alert('Failed to create backup. Please try again.');
        }
        setIsLoading(false);
    }

    /**
     * Backup & Restore - download Excel, clear data, reset bill number
     */
    async function handleBackupAndRestore() {
        setIsLoading(true);
        try {
            const filename = await exportToExcel();

            if (filename) {
                // Clear all bills
                await clearAllBills();

                // Reset bill number
                await resetBillNumber();

                alert(`Backup saved as ${filename}\n\nDatabase cleared and bill number reset to 0001.`);
            }
        } catch (error) {
            console.error('Backup & Restore error:', error);
            alert('Failed to complete backup & restore. Please try again.');
        }
        setIsLoading(false);
        setShowConfirm(false);
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="admin-panel">
                <div className="admin-login-container">
                    <div className="admin-login-card">
                        <div className="admin-login-header">
                            <div className="admin-icon">
                                <Shield size={48} />
                            </div>
                            <h2>Admin Access</h2>
                            <p>Enter admin password to access backup and restore features</p>
                        </div>

                        <form onSubmit={handleLogin} className="admin-login-form">
                            <div className="password-input-wrapper">
                                <Lock size={20} className="password-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    disabled={isLocked}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {loginError && (
                                <div className="login-error">
                                    <AlertTriangle size={16} />
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary login-btn"
                                disabled={isLocked || !password}
                            >
                                <Lock size={18} />
                                {isLocked ? `Locked (${lockTimer}s)` : 'Login'}
                            </button>
                        </form>

                        <div className="admin-login-footer">
                            <p>🔒 Protected Admin Area</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Panel (after login)
    return (
        <div className="admin-panel">
            <div className="admin-header">
                <div className="admin-title">
                    <Shield size={24} />
                    <div>
                        <h3>Admin Panel</h3>
                        <p>Backup and restore management</p>
                    </div>
                </div>
                <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            <div className="backup-section">
                <div className="backup-header">
                    <FileSpreadsheet size={24} />
                    <div>
                        <h4>Backup & Restore</h4>
                        <p>Export bills to Excel and manage data</p>
                    </div>
                </div>

                <div className="backup-actions">
                    <button
                        className="btn btn-outline"
                        onClick={handleBackup}
                        disabled={isLoading}
                    >
                        <Download size={18} />
                        {isLoading ? 'Processing...' : 'Backup'}
                    </button>

                    <button
                        className="btn btn-warning"
                        onClick={() => setShowConfirm(true)}
                        disabled={isLoading}
                    >
                        <RefreshCcw size={18} />
                        Backup & Restore
                    </button>
                </div>

                <div className="backup-info">
                    <p><strong>Backup:</strong> Downloads bills as Excel file</p>
                    <p><strong>Backup & Restore:</strong> Downloads bills, clears database, resets bill numbering to 0001</p>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <AlertTriangle size={48} color="#f59e0b" />
                        </div>
                        <h3>Confirm Backup & Restore</h3>
                        <p>This will:</p>
                        <ul>
                            <li>Download all bills as an Excel file</li>
                            <li>Clear all bill history from the database</li>
                            <li>Reset bill numbering to start from 0001</li>
                        </ul>
                        <p className="warning-text">This action cannot be undone!</p>
                        <div className="confirm-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-warning"
                                onClick={handleBackupAndRestore}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
