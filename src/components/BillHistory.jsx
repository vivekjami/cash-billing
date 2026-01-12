/**
 * BillHistory Component
 * 
 * Displays list of all past bills with ability to view details.
 */

import React, { useState, useEffect, useRef } from 'react';
import { History, Eye, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { getAllBills } from '../db/db';
import BillPreview from './BillPreview';
import './BillHistory.css';

function BillHistory() {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const billRef = useRef();

    useEffect(() => {
        loadBills();
    }, []);

    async function loadBills() {
        const allBills = await getAllBills();
        // Sort by bill number descending (most recent first)
        allBills.sort((a, b) => parseInt(b.billNumber) - parseInt(a.billNumber));
        setBills(allBills);
    }

    const handlePrint = useReactToPrint({
        contentRef: billRef,
    });

    return (
        <div className="bill-history">
            <div className="history-header">
                <History size={24} />
                <div>
                    <h3>Bill History</h3>
                    <p>{bills.length} bills in database</p>
                </div>
            </div>

            <div className="bills-list">
                {bills.length > 0 ? (
                    bills.map(bill => (
                        <div key={bill.id} className="bill-row">
                            <div className="bill-info">
                                <span className="bill-number">#{bill.billNumber}</span>
                                <span className="bill-date">{bill.date} {bill.time}</span>
                            </div>
                            <div className="bill-amount">
                                ₹{bill.grandTotal.toFixed(2)}
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => setSelectedBill(bill)}
                            >
                                <Eye size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-bills">
                        No bills yet. Start taking orders!
                    </div>
                )}
            </div>

            {/* Bill Detail Modal */}
            {selectedBill && (
                <div className="bill-modal-overlay" onClick={() => setSelectedBill(null)}>
                    <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bill-modal-header">
                            <h3>Bill #{selectedBill.billNumber}</h3>
                            <button onClick={() => setSelectedBill(null)}>×</button>
                        </div>
                        <div className="bill-modal-content">
                            <BillPreview
                                ref={billRef}
                                billNumber={selectedBill.billNumber}
                                items={selectedBill.items}
                                subtotal={selectedBill.subtotal}
                                cgst={selectedBill.cgst}
                                sgst={selectedBill.sgst}
                                roundOff={selectedBill.roundOff}
                                grandTotal={selectedBill.grandTotal}
                                cashier={selectedBill.cashier}
                                dineIn={selectedBill.dineIn}
                                customerName={selectedBill.customerName}
                            />
                        </div>
                        <div className="bill-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setSelectedBill(null)}>
                                Close
                            </button>
                            <button className="btn btn-primary" onClick={handlePrint}>
                                <Printer size={18} />
                                Reprint
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BillHistory;
