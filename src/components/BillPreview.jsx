/**
 * BillPreview Component
 * 
 * Displays the bill in a print-ready format matching the thermal printer output.
 * Uses monospace font and fixed widths for proper alignment.
 */

import React, { forwardRef } from 'react';
import './BillPreview.css';

const BillPreview = forwardRef(({
    billNumber,
    items,
    subtotal,
    cgst,
    sgst,
    roundOff,
    grandTotal,
    cashier,
    dineIn,
    customerName
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
        <div className="bill-preview" ref={ref}>
            <div className="bill-content">
                {/* Header */}
                <div className="bill-header">
                    <h1 className="restaurant-name">MADHURAM</h1>
                    <div className="bill-divider"></div>
                    <p className="restaurant-desc">CAFÉ AND TIFFINS</p>
                    <p className="gstin">GSTIN – 37AAWPI8183N1ZL</p>
                </div>

                {/* Customer Info */}
                <div className="bill-info">
                    <div className="info-row">
                        <span>Name: {customerName || ''}</span>
                    </div>
                    <div className="info-row two-col">
                        <span>Date: {date}</span>
                        <span>Order Type: {dineIn}</span>
                    </div>
                    <div className="info-row two-col">
                        <span>{time}</span>
                    </div>
                    <div className="info-row two-col">
                        <span>Cashier: {cashier}</span>
                        <span>Bill No.: {billNumber}</span>
                    </div>
                </div>

                {/* Items Header */}
                <div className="bill-divider"></div>
                <div className="items-header">
                    <span className="col-item">Item</span>
                    <span className="col-qty">Qty.</span>
                    <span className="col-price">Price</span>
                    <span className="col-amount">Amount</span>
                </div>
                <div className="bill-divider"></div>

                {/* Items */}
                <div className="items-list">
                    {items.map((item, index) => (
                        <div key={index} className="item-row">
                            <span className="col-item">{item.name}</span>
                            <span className="col-qty">{item.quantity}</span>
                            <span className="col-price">{item.price.toFixed(2)}</span>
                            <span className="col-amount">{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="bill-divider"></div>

                {/* Summary */}
                <div className="bill-summary">
                    <div className="summary-row">
                        <span>Total Qty: {totalQty}</span>
                        <span>Sub {subtotal.toFixed(2)}</span>
                    </div>
                    {/* Commented out taxes for now
                    <div className="summary-row">
                        <span></span>
                        <span>CGST 2.5% {cgst.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span></span>
                        <span>SGST 2.5% {sgst.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span></span>
                        <span>Round off {roundOff >= 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
                    </div>
                    */}
                </div>

                <div className="bill-divider bold"></div>

                {/* Grand Total */}
                <div className="grand-total">
                    <span>Grand Total</span>
                    <span>₹ {grandTotal.toFixed(2)}</span>
                </div>

                <div className="bill-divider bold"></div>

                {/* Footer */}
                <div className="bill-footer">
                    <p>THANK YOU !</p>
                </div>
            </div>
        </div>
    );
});

BillPreview.displayName = 'BillPreview';

export default BillPreview;
