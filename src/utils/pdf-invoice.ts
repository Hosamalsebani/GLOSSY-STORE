import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  brand?: string;
};

type Order = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  region: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  cart_items: CartItem[] | null;
  discount_amount?: number | null;
  shipping_cost?: number;
};

/**
 * Generates a PDF invoice as a Uint8Array for browser use.
 */
export async function generateInvoicePDFUint8Array(order: Order): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Add Logo / Header
  doc.setFontSize(22);
  doc.setTextColor(183, 110, 121); // Rose Gold color
  doc.text('GLOSSY', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('PREMIUM LUXURY STORE', 105, 27, { align: 'center' });

  // Invoice Info
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  doc.text('INVOICE', 20, 45);
  
  doc.setFontSize(10);
  doc.text(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`, 20, 52);
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  doc.text(`Date: ${orderDate}`, 20, 57);

  // Customer Details
  doc.setFontSize(12);
  doc.text('Billed To:', 20, 70);
  doc.setFontSize(10);
  doc.text(order.customer_name || 'Valued Customer', 20, 77);
  doc.text(order.customer_phone || 'N/A', 20, 82);
  doc.text(order.address || 'N/A', 20, 87);
  doc.text(`${order.region || ''}`, 20, 92);

  // Table Items
  const tableData = (order.cart_items || []).map((item: CartItem) => [
    item.name,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.price * item.quantity).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [26, 26, 26] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  const subtotal = order.cart_items?.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0) || 0;
  const shipping = order.shipping_cost || 0;
  const discount = order.discount_amount || 0;

  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`$${subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });

  doc.text(`Shipping:`, 140, finalY + 7);
  doc.text(`$${shipping.toFixed(2)}`, 180, finalY + 7, { align: 'right' });

  if (discount > 0) {
    doc.setTextColor(220, 38, 38); // Red for discount
    doc.text(`Discount:`, 140, finalY + 14);
    doc.text(`-$${discount.toFixed(2)}`, 180, finalY + 14, { align: 'right' });
    doc.setTextColor(26, 26, 26);
  }

  const netTotalPostY = finalY + (discount > 0 ? 25 : 18);
  doc.setFontSize(14);
  doc.text(`Total:`, 140, netTotalPostY);
  doc.text(`$${order.total_amount.toFixed(2)}`, 180, netTotalPostY, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing GLOSSY.', 105, 280, { align: 'center' });

  const buffer = doc.output('arraybuffer');
  return new Uint8Array(buffer);
}
