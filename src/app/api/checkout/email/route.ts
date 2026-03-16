import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'hosamalshebani990@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, city, address, total, items } = body;

    const itemsHtml = (items || [])
      .map(
        (item: { name: string; quantity: number; price: number }) =>
          `<tr>
            <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0;">${item.name}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; text-align:right;">$${item.price.toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #1a1a1a; padding: 32px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; letter-spacing: 4px; margin: 0;">GLOSSY</h1>
          <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0;">NEW ORDER NOTIFICATION</p>
        </div>
        
        <div style="padding: 32px; background: #fff;">
          <h2 style="font-size: 18px; margin: 0 0 24px;">New Order Received</h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
            <h3 style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin: 0 0 16px;">Customer Details</h3>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${customerName || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> ${customerPhone || 'N/A'}</p>
            ${customerEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${customerEmail}</p>` : ''}
            <p style="margin: 4px 0;"><strong>City:</strong> ${city || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Address:</strong> ${address || 'N/A'}</p>
          </div>
          
          <h3 style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin: 0 0 16px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #1a1a1a;">
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Product</th>
                <th style="padding: 8px 12px; text-align: center; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Qty</th>
                <th style="padding: 8px 12px; text-align: right; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="border-top: 2px solid #1a1a1a; padding-top: 16px; text-align: right;">
            <p style="font-size: 18px; font-weight: bold; margin: 0;">Total: $${Number(total).toFixed(2)}</p>
          </div>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #888; margin: 0;">Please log in to the admin dashboard to manage this order.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Glossy Store <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `🛍️ New Order — ${customerName || 'Customer'} — $${Number(total).toFixed(2)}`,
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
