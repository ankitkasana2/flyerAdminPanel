
import { NextResponse } from 'next/server';
import { sendOrderReadyEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, customerName, customerEmail, flyerName, downloadUrl, imageUrl } = body;

        if (!customerEmail || !orderId) {
            return NextResponse.json({ error: "Email and Order ID are required" }, { status: 400 });
        }

        const result = await sendOrderReadyEmail({
            orderId,
            customerName: customerName || "Valued Customer",
            customerEmail,
            flyerName: flyerName || "Flyer",
            downloadUrl,
            imageUrl
        });

        return NextResponse.json({
            success: true,
            messageId: result.MessageId
        });

    } catch (error: any) {
        console.error("Email send error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}
