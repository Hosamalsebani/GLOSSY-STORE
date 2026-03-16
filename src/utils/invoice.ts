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
  coupon_code?: string | null;
  discount_amount?: number | null;
  shipping_cost?: number;
};

/**
 * Generates and opens a print-friendly HTML invoice with full Arabic/RTL support.
 */
export const generateInvoicePDF = (order: Order) => {
  const subtotal = order.cart_items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const discount = order.discount_amount || 0;
  const shipping = order.shipping_cost || 0;
  const total = order.total_amount;

  const invoiceHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة رقم #${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;700&display=swap');
        
        :root {
          --gold: #b76e79;
          --dark: #1a1a1a;
          --beige: #fefcfb;
          --gray: #646464;
          --light-gray: #f5f5f5;
        }

        body {
          font-family: 'Amiri', serif;
          margin: 0;
          padding: 0;
          color: var(--dark);
          background: white;
        }

        .container {
          width: 210mm;
          min-height: 297mm;
          margin: auto;
          padding: 20mm;
          box-sizing: border-box;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--beige);
          margin-bottom: 40px;
        }

        .logo-section h1 {
          font-family: 'Times New Roman', serif;
          font-size: 42px;
          margin: 0;
          color: var(--gold);
          letter-spacing: 2px;
        }

        .logo-section p {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          margin: 0;
          color: var(--gray);
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .invoice-info {
          text-align: left;
        }

        .invoice-info h2 {
          font-size: 32px;
          margin: 0;
          color: var(--dark);
        }

        .invoice-info p {
          margin: 5px 0;
          font-size: 14px;
          color: var(--gray);
        }

        .billing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 50px;
        }

        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: var(--gold);
          text-transform: uppercase;
          border-bottom: 1px solid var(--beige);
          margin-bottom: 15px;
          padding-bottom: 5px;
        }

        .info-box p {
          margin: 5px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .info-box strong {
          display: block;
          font-size: 16px;
          margin-bottom: 5px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        th {
          background: var(--dark);
          color: white;
          padding: 12px;
          font-size: 13px;
          text-align: center;
        }

        th:first-child { text-align: right; }
        
        td {
          padding: 12px;
          border-bottom: 1px solid var(--light-gray);
          font-size: 14px;
          text-align: center;
        }

        td:first-child { text-align: right; }

        .summary-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .summary-table {
          width: 300px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .summary-row.total {
          background: var(--gold);
          color: white;
          padding: 15px;
          margin-top: 10px;
          font-weight: bold;
          font-size: 18px;
        }

        .footer {
          margin-top: 100px;
          text-align: center;
          font-size: 12px;
          color: #bbb;
        }

        .footer p { margin: 5px 0; }
        .footer .highlight { color: var(--gold); }

        @media print {
          body { background: none; }
          .container { box-shadow: none; padding: 0m; width: 100%; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-section">
            <h1>GLOSSY</h1>
            <p>L U X U R Y   B E A U T Y</p>
          </div>
          <div class="invoice-info">
            <h2>فاتورة ضريبية</h2>
            <p>رقم الفاتورة: #${order.id.slice(0, 8).toUpperCase()}</p>
            <p>التاريخ: ${new Date(order.created_at).toLocaleDateString('ar-LY')}</p>
          </div>
        </div>

        <div class="billing-grid">
          <div class="info-box">
            <div class="section-title">من:</div>
            <strong>متجر GLOSSY Beauty</strong>
            <p>طرابلس، ليبيا</p>
            <p>واتساب: 218910000000+</p>
            <p>www.glossy.ly</p>
          </div>
          <div class="info-box">
            <div class="section-title">إلى:</div>
            <strong>${order.customer_name || 'عميلنا العزيز'}</strong>
            <p>${order.customer_phone || ''}</p>
            <p>${order.region || ''}</p>
            <p>${order.address || ''}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: right;">المنتج</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${order.cart_items?.map(item => `
              <tr>
                <td style="text-align: right;">${item.name}</td>
                <td>${item.quantity}</td>
                <td>${Number(item.price).toFixed(2)} د.ل</td>
                <td>${(item.price * item.quantity).toFixed(2)} د.ل</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="summary-table">
            <div class="summary-row">
              <span>المجموع الفرعي:</span>
              <span>${subtotal.toFixed(2)} د.ل</span>
            </div>
            ${discount > 0 ? `
              <div class="summary-row" style="color: #c00;">
                <span>الخصم (${order.coupon_code || 'كوبون'}):</span>
                <span>- ${discount.toFixed(2)} د.ل</span>
              </div>
            ` : ''}
            <div class="summary-row">
              <span>رسوم التوصيل:</span>
              <span>${shipping.toFixed(2)} د.ل</span>
            </div>
            <div class="summary-row total">
              <span>المجموع الكلي:</span>
              <span>${Number(total).toFixed(2)} د.ل</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>شكراً لتسوقكم من GLOSSY Luxury Store.</p>
          <p class="highlight">تطبق الشروط والأحكام | www.glossy.ly</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
            // window.close(); // Optional: close window after printing
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  // Create a new window and write the content
  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  } else {
    alert('Please allow popups to print the invoice.');
  }
};
