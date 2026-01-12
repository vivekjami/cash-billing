/**
 * BackupRestore Component
 * 
 * Handles Excel backup and restore functionality:
 * - Backup: Export all bills to Excel file
 * - Backup & Restore: Export bills, clear database, reset bill number
 */

import React, { useState } from 'react';
import { Download, RefreshCcw, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAllBills, clearAllBills, resetBillNumber } from '../db/db';
import './BackupRestore.css';

function BackupRestore() {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
        const filename = `DAKSHIN_Bills_Backup_${timestamp}.xlsx`;

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

    return (
        <div className="backup-restore">
            <div className="backup-header">
                <FileSpreadsheet size={24} />
                <div>
                    <h3>Backup & Restore</h3>
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

export default BackupRestore;
