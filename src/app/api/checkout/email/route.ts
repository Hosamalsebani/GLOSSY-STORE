import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy');
const ADMIN_EMAIL = 'hosamalshebani990@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received email notification request:', body);
    const { customerName, customerPhone, customerEmail, city, address, total, items } = body;

    const itemsHtml = (items || [])
      .map(
        (item: { name: string; quantity: number; price: number }) =>
          `<tr>
            <td style="padding:12px; border-bottom:1px solid #eee; font-size:14px;">
              <div style="font-weight:bold; color:#1a1a1a;">${item.name}</div>
            </td>
            <td style="padding:12px; border-bottom:1px solid #eee; text-align:center; font-size:14px; color:#666;">${item.quantity}</td>
            <td style="padding:12px; border-bottom:1px solid #eee; text-align:right; font-size:14px; font-weight:bold; color:#1a1a1a;">${item.price.toFixed(2)} د.ل</td>
          </tr>`
      )
      .join('');

    const emailHtml = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfcfc; border: 1px solid #eee;">
        <!-- Header -->
        <div style="background-color: #1a1a1a; padding: 40px 20px; text-align: center;">
          <h1 style="color: #d4af37; font-size: 28px; letter-spacing: 5px; margin: 0; font-family: serif;">GLOSSY</h1>
          <p style="color: #999; font-size: 11px; letter-spacing: 3px; margin: 10px 0 0; text-transform: uppercase;">إشعار طلب جديد | NEW ORDER NOTIFICATION</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0;">تم استلام طلب جديد بنجاح</h2>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0;">A new order has been successfully received</p>
          </div>

          <!-- Customer Info -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-right: 4px solid #d4af37;">
            <h3 style="font-size: 14px; color: #999; text-transform: uppercase; margin: 0 0 15px; letter-spacing: 1px;">بيانات العميل | Customer Details</h3>
            <table style="width: 100%; font-size: 14px; line-height: 1.6;">
              <tr>
                <td style="color: #666; width: 100px;">الاسم:</td>
                <td style="font-weight: bold; color: #1a1a1a;">${customerName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="color: #666;">الهاتف:</td>
                <td style="font-weight: bold; color: #1a1a1a;">${customerPhone || 'N/A'}</td>
              </tr>
              ${customerEmail ? `
              <tr>
                <td style="color: #666;">الإيميل:</td>
                <td style="font-weight: bold; color: #1a1a1a;">${customerEmail}</td>
              </tr>` : ''}
              <tr>
                <td style="color: #666;">المدينة:</td>
                <td style="font-weight: bold; color: #1a1a1a;">${city || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <!-- Order Items -->
          <h3 style="font-size: 14px; color: #999; text-transform: uppercase; margin: 0 0 15px; letter-spacing: 1px; text-align: center;">المنتجات | Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #1a1a1a; color: #fff;">
                <th style="padding: 12px; text-align: right; font-size: 12px;">المنتج</th>
                <th style="padding: 12px; text-align: center; font-size: 12px;">الكمية</th>
                <th style="padding: 12px; text-align: left; font-size: 12px;">السعر</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Total -->
          <div style="border-top: 2px solid #1a1a1a; padding-top: 20px; text-align: left;">
            <p style="margin: 0; font-size: 14px; color: #666;">الإجمالي الكلي | Grand Total</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1a1a1a;">${Number(total).toFixed(2)} د.ل</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888; margin: 0;">هذا إشعار تلقائي من نظام متجر جلوسي.</p>
          <p style="font-size: 11px; color: #aaa; margin: 5px 0 0;">Automatic notification from GLOSSY Store System.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Glossy Store <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `🛍️ طلب جديد من ${customerName || 'عميل'} — بقيمة ${Number(total).toFixed(2)} د.ل`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
