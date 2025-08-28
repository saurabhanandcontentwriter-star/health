import React, { useState } from 'react';
import { MedicineOrder, LabTestBooking } from '../types';
import { MedicineOrderTracker, LabTestBookingTracker } from './OrderTrackers';
import { ArchiveIcon, TestTubeIcon, ShoppingBagIcon, FileTextIcon } from './IconComponents';

interface OrderHistoryViewProps {
    medicineOrders: MedicineOrder[];
    labTestBookings: LabTestBooking[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ medicineOrders, labTestBookings }) => {
    const [activeTab, setActiveTab] = useState<'medicines' | 'labTests'>('medicines');
    
    const sortedMedicineOrders = [...medicineOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    const sortedLabTestBookings = [...labTestBookings].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    const handleDownloadMedicineReceipt = (order: MedicineOrder) => {
      const { deliveryAddress: addr } = order;
      const itemsHtml = order.items.map(item => `
        <tr>
          <td>${item.quantity} x ${item.medicineName}</td>
          <td class="text-right">${formatCurrency(item.price)}</td>
          <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `).join('');

      const receiptContent = `
        <html>
          <head>
            <title>Order Receipt #${order.id}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; background-color: #f9fafb; }
              .container { max-width: 800px; margin: auto; background: white; border: 1px solid #e5e7eb; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
              h1 { text-align: center; color: #0d9488; margin-bottom: 0.5rem; }
              .header-sub { text-align: center; color: #6b7280; margin-top:0; margin-bottom: 2rem; }
              .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
              .details-grid > div > strong { display: block; margin-bottom: 0.5rem; color: #374151; }
              .details-grid p { margin: 0; }
              .pricing div { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6; }
              .pricing strong { color: #111827; }
              .address { line-height: 1.6; color: #4b5563; }
              table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
              th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #f3f4f6; }
              th { background-color: #f9fafb; font-weight: 600; color: #374151; }
              td { color: #4b5563; }
              .text-right { text-align: right; }
              .total { font-weight: bold; font-size: 1.2rem; color: #0d9488; border-top: 2px solid #0d9488; margin-top: 0.5rem; }
              .paid-stamp { text-align: center; font-size: 2rem; font-weight: bold; color: #16a34a; border: 5px solid #16a34a; padding: 0.5rem 1rem; margin-top: 2.5rem; transform: rotate(-10deg); opacity: 0.7; border-radius: 0.5rem; display: inline-block; }
              .stamp-container { text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Order Receipt</h1>
              <p class="header-sub">Bihar Health Connect</p>
              
              <div class="details-grid">
                <div>
                    <strong>Billed To:</strong>
                    <p class="address">
                        ${addr.fullName}<br>
                        ${addr.addressLine1}<br>
                        ${addr.addressLine2 ? addr.addressLine2 + '<br>' : ''}
                        ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                        Phone: ${addr.phone}
                    </p>
                </div>
                <div>
                    <strong>Order Details:</strong>
                    <p class="address">
                        <strong>Order ID:</strong> #${order.id}<br>
                        <strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}<br>
                        <strong>Status:</strong> ${order.status}
                    </p>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="pricing">
                <div><span>Subtotal:</span> <span>${formatCurrency(order.subtotal)}</span></div>
                ${order.savings > 0 ? `<div><span style="color: #16a34a;">Savings:</span> <span style="color: #16a34a;">- ${formatCurrency(order.savings)}</span></div>` : ''}
                <div><span>GST:</span> <span>+ ${formatCurrency(order.gst)}</span></div>
                <div><span>Delivery Fee:</span> <span>+ ${formatCurrency(order.deliveryFee)}</span></div>
                <div class="total"><strong>Total Paid:</strong> <strong>${formatCurrency(order.totalAmount)}</strong></div>
              </div>

              <div class="stamp-container">
                 <div class="paid-stamp">PAID</div>
              </div>
            </div>
            <script>setTimeout(() => window.print(), 500);</script>
          </body>
        </html>
      `;

      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(receiptContent);
        receiptWindow.document.close();
      }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Order History</h1>

            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border dark:border-gray-700 self-start">
                <nav className="flex items-center space-x-2">
                    <button onClick={() => setActiveTab('medicines')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'medicines' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                        <ShoppingBagIcon className="w-5 h-5 mr-2" /> Medicine Orders
                    </button>
                    <button onClick={() => setActiveTab('labTests')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'labTests' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                       <TestTubeIcon className="w-5 h-5 mr-2" /> Lab Test Bookings
                    </button>
                </nav>
            </div>

            {activeTab === 'medicines' && (
                <div className="space-y-6">
                    {sortedMedicineOrders.length > 0 ? (
                        sortedMedicineOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col md:items-end mt-4 md:mt-0 space-y-2">
                                        <div className="text-lg md:text-xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(order.totalAmount)}</div>
                                        <button
                                            onClick={() => handleDownloadMedicineReceipt(order)}
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
                                        >
                                            <FileTextIcon className="w-4 h-4 mr-2" />
                                            Download Receipt
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Items</h4>
                                         <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                            {order.items.map(item => <li key={item.medicineId}>{item.quantity} x {item.medicineName}</li>)}
                                        </ul>
                                    </div>
                                    <div className="md:border-l md:pl-6 dark:border-gray-700">
                                         <MedicineOrderTracker order={order} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Medicine Orders Found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't placed any medicine orders yet.</p>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'labTests' && (
                 <div className="space-y-6">
                    {sortedLabTestBookings.length > 0 ? (
                        sortedLabTestBookings.map(booking => (
                            <div key={booking.id} className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all ${booking.status === 'Cancelled' ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                                <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{booking.testName}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Booked on {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`text-lg md:text-xl font-bold mt-2 md:mt-0 ${booking.status === 'Cancelled' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-teal-600 dark:text-teal-400'}`}>
                                        {formatCurrency(booking.totalAmount)}
                                    </div>
                                </div>
                                
                                {booking.status === 'Cancelled' ? (
                                    <div className="text-center py-4">
                                        <p className="text-red-600 font-bold text-lg">Booking Cancelled</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">Booking Status</h4>
                                        <LabTestBookingTracker booking={booking} />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Lab Test Bookings Found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't booked any lab tests yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryView;