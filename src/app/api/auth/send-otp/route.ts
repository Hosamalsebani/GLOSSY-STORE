import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, customerName } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const emailHtml = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfcfc; border: 1px solid #eee;">
        <!-- Header -->
        <div style="background-color: #1a1a1a; padding: 40px 20px; text-align: center;">
          <h1 style="color: #d4af37; font-size: 28px; letter-spacing: 5px; margin: 0; font-family: serif;">GLOSSY</h1>
          <p style="color: #999; font-size: 11px; letter-spacing: 3px; margin: 10px 0 0; text-transform: uppercase;">تأكيد البريد الإلكتروني | EMAIL VERIFICATION</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
          <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 15px;">مرحباً بك في عالم جلوسي الفاخر</h2>
          <p style="color: #666; font-size: 15px; margin: 0 0 5px;">${customerName ? `أهلاً بك يا ${customerName}،` : 'أهلاً بك،'}</p>
          <p style="color: #666; font-size: 15px; margin: 0 0 30px; line-height: 1.6;">شكراً لانضمامك إلينا. لإكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:</p>

          <!-- OTP Code Display -->
          <div style="background-color: #f9f9f9; padding: 25px; border-radius: 12px; margin: 0 auto 30px; border: 2px dashed #d4af37; max-width: 250px;">
            <p style="font-size: 36px; font-weight: bold; color: #1a1a1a; margin: 0; letter-spacing: 8px;">${otp}</p>
          </div>

          <p style="color: #999; font-size: 13px; margin: 0 0 5px;">هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
          <p style="color: #999; font-size: 13px; margin: 0;">إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذا البريد.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888; margin: 0;">متجر جلوسي | أرقى التشكيلات العطرية ومستحضرات التجميل</p>
          <p style="font-size: 11px; color: #aaa; margin: 5px 0 0;">© ${new Date().getFullYear()} GLOSSY Store. All rights reserved.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Glossy Store <onboarding@resend.dev>', // Update this when you have a custom domain on Resend
      to: [email],
      subject: `رمز التحقق الخاص بك من جلوسي: ${otp}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend verification email error:', error);
      return NextResponse.json({ error: 'Failed to send verification email', details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Verification email route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
