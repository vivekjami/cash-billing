/**
 * KOTPreview Component
 * 
 * Kitchen Order Ticket for thermal printers.
 * Displays order details for kitchen staff.
 */

import React, { forwardRef } from 'react';
import './KOTPreview.css';

const KOTPreview = forwardRef(({
    kotNumber,
    items,
    tableNumber,
    orderType
}, ref) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    }).replace(/\//g, '/');
    const time = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="kot-preview" ref={ref}>
            <div className="kot-content">
                {/* Header DateTime */}
                <div className="kot-datetime">
                    {date} {time}
                </div>

                {/* KOT Number */}
                <div className="kot-number">
                    KOT - {kotNumber}
                </div>

                {/* Table Number */}
                <div className="kot-table">
                    Order Type: {tableNumber || orderType}
                </div>

                {/* Divider */}
                <div className="kot-divider">
                    ------------------------------
                </div>

                {/* Column Header */}
                <div className="kot-column-header">
                    <span className="col-qty">Qty.</span>
                    <span className="col-item">Item</span>
                </div>

                {/* Divider */}
                <div className="kot-divider">
                    ------------------------------
                </div>

                {/* Item Rows */}
                <div className="kot-items">
                    {items.map((item, index) => (
                        <div key={index} className="kot-item-row">
                            <span className="col-qty">{item.quantity}</span>
                            <span className="col-item">{item.name}</span>
                        </div>
                    ))}
                </div>

                {/* Footer - Total Items */}
                <div className="kot-divider">
                    ------------------------------
                </div>
                <div className="kot-footer">
                    <span className="total-items">Total Items: {totalQty}</span>
                </div>
            </div>
        </div>
    );
});

KOTPreview.displayName = 'KOTPreview';

export default KOTPreview;
