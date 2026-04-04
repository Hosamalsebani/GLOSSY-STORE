import * as XLSX from 'xlsx';

export type ReportData = {
  startDate: string;
  endDate: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  ordersCount: number;
  itemsCount: number;
  averageOrderValue: number;
  profitMargin: number;
  topSellingProducts: { name: string; quantity: number; revenue: number; profit: number }[];
  dailyMetrics: { date: string; revenue: number; profit: number }[];
  categoryPerformance: { category: string; revenue: number; profit: number }[];
};

/**
 * Generates a professional P&L Report PDF using high-fidelity HTML-to-Print.
 */
export const generateFinancialReportPDF = (data: ReportData) => {
  const reportHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقرير الأرباح والخسائر - GLOSSY</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;700&display=swap');
        
        :root {
          --gold: #b76e79;
          --dark: #1a1a1a;
          --beige: #fefcfb;
          --gray: #646464;
          --success: #10b981;
          --danger: #ef4444;
          --light-gray: #f9fafb;
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
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--gold);
          margin-bottom: 40px;
        }

        .logo-section h1 {
          font-family: 'Times New Roman', serif;
          font-size: 32px;
          margin: 0;
          color: var(--dark);
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

        .report-title {
          text-align: left;
        }

        .report-title h2 {
          font-size: 28px;
          margin: 0;
          color: var(--gold);
        }

        .report-title p {
          margin: 5px 0;
          font-size: 14px;
          color: var(--gray);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .summary-card {
          padding: 20px;
          background: var(--light-gray);
          border-radius: 8px;
          text-align: center;
          border: 1px solid #eee;
        }

        .summary-card .label {
          font-size: 14px;
          color: var(--gray);
          margin-bottom: 10px;
          display: block;
        }

        .summary-card .value {
          font-size: 20px;
          font-weight: bold;
          color: var(--dark);
          font-family: 'Inter', sans-serif;
        }

        .summary-card .value.profit { color: var(--success); }

        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: var(--dark);
          border-right: 4px solid var(--gold);
          padding-right: 10px;
          margin: 40px 0 20px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        th {
          background: #f3f4f6;
          color: var(--dark);
          padding: 12px;
          font-size: 13px;
          text-align: right;
          border-bottom: 2px solid #ddd;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          text-align: right;
        }

        .positive { color: var(--success); font-weight: bold; }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #aaa;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }

        @media print {
          body { background: none; }
          .container { box-shadow: none; padding: 0; width: 100%; }
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
          <div class="report-title">
            <h2>تقرير الأداء المالي</h2>
            <p>الفترة: ${data.startDate} إلى ${data.endDate}</p>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <span class="label">إجمالي الإيرادات</span>
            <span class="value">${data.revenue.toLocaleString('ar-LY')} د.ل</span>
          </div>
          <div class="summary-card">
            <span class="label">تكلفة المبيعات</span>
            <span class="value">${data.cogs.toLocaleString('ar-LY')} د.ل</span>
          </div>
          <div class="summary-card">
            <span class="label">إجمالي الربح</span>
            <span class="value profit">${data.grossProfit.toLocaleString('ar-LY')} د.ل</span>
          </div>
          <div class="summary-card">
            <span class="label">هامش الربح</span>
            <span class="value">${data.profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        <div class="section-title">أداء الفئات</div>
        <table>
          <thead>
            <tr>
              <th>الفئة</th>
              <th>الإيرادات</th>
              <th>الربح</th>
              <th>الهامش</th>
            </tr>
          </thead>
          <tbody>
            ${data.categoryPerformance.map(cat => `
              <tr>
                <td>${cat.category}</td>
                <td>${cat.revenue.toLocaleString('ar-LY')} د.ل</td>
                <td class="positive">${cat.profit.toLocaleString('ar-LY')} د.ل</td>
                <td>${((cat.profit / cat.revenue) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">الأكثر مبيعاً</div>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>الإيرادات</th>
              <th>الربح الكلي</th>
            </tr>
          </thead>
          <tbody>
            ${data.topSellingProducts.map(prod => `
              <tr>
                <td>${prod.name}</td>
                <td>${prod.quantity}</td>
                <td>${prod.revenue.toLocaleString('ar-LY')} د.ل</td>
                <td class="positive">${prod.profit.toLocaleString('ar-LY')} د.ل</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>تم استخراج هذا التقرير آلياً من نظام GLOSSY الإداري في ${new Date().toLocaleDateString('ar-LY')}</p>
          <p>جميع حقوق الطبع محفوظة © GLOSSY Luxury Store</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (printWindow) {
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  } else {
    alert('Please allow popups to generic the report PDF.');
  }
};

/**
 * Generates an Excel spreadsheet with P&L details.
 */
export const generateFinancialReportExcel = (data: ReportData) => {
  try {
    // 1. Summary Sheet
    const summarySheetData: (string | number)[][] = [
      ["GLOSSY Financial Report", ""],
      ["Period", `${data.startDate} to ${data.endDate}`],
      ["", ""],
      ["Metric", "Value"],
      ["Total Revenue", data.revenue],
      ["Cost of Goods Sold (COGS)", data.cogs],
      ["Gross Profit", data.grossProfit],
      ["Profit Margin (%)", data.profitMargin / 100],
      ["Total Orders", data.ordersCount],
      ["Total Items Sold", data.itemsCount],
      ["Average Order Value", data.averageOrderValue]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);

    // 2. Product Performance Sheet
    const productData: (string | number)[][] = [
      ["Product Name", "Quantity Sold", "Revenue", "Gross Profit", "Margin (%)"]
    ];
    data.topSellingProducts.forEach(p => {
      productData.push([
        p.name,
        p.quantity,
        p.revenue,
        p.profit,
        p.profit / p.revenue
      ]);
    });
    const wsProducts = XLSX.utils.aoa_to_sheet(productData);

    // 3. Category Performance Sheet
    const categoryData: (string | number)[][] = [
        ["Category", "Revenue", "Gross Profit", "Margin (%)"]
    ];
    data.categoryPerformance.forEach(c => {
        categoryData.push([
            c.category,
            c.revenue,
            c.profit,
            c.profit / c.revenue
        ]);
    });
    const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);

    // Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsProducts, "Product Performance");
    XLSX.utils.book_append_sheet(wb, wsCategories, "Category Performance");

    // Write file
    XLSX.writeFile(wb, `GLOSSY_Financial_Report_${data.startDate}_to_${data.endDate}.xlsx`);
  } catch (error) {
    console.error('Error generating Excel:', error);
    alert('Failed to generate Excel report. Please ensure xlsx library is installed.');
  }
};
