import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to handle sending SMS notifications.
 * This can be integrated with any SMS provider API.
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message, orderId, invoiceUrl } = await req.json();

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 });
    }

    console.log(`[SMS Notification] Sending to: ${phoneNumber}`);
    console.log(`[SMS Notification] Message: ${message}`);
    if (invoiceUrl) {
      console.log(`[SMS Notification] Invoice URL: ${invoiceUrl}`);
    }

    // --- INTEGRATION POINT ---
    // You can replace this with your actual SMS provider logic (e.g., Twilio, Infobip, local Libyan provider)
    
    /* Example Twilio Implementation:
    const twilio = require('twilio');
    const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `${message}${invoiceUrl ? `\n\nView Invoice: ${invoiceUrl}` : ''}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    */

    // For now, we simulate success and log to the console
    // In a production environment, you would use a real API call here.
    const provider = 'Simulated';
    const status = 'sent';

    // Log to DB
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from('notification_logs').insert({
      order_id: orderId,
      phone_number: phoneNumber,
      message: message,
      invoice_url: invoiceUrl,
      status: status,
      provider: provider
    });
    
    return NextResponse.json({ 
      success: true, 
      messageId: `simulated_${Math.random().toString(36).slice(2)}`,
      provider: provider
    });
  } catch (err: any) {
    console.error('SMS notification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
