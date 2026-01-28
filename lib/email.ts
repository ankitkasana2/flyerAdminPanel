
import AWS from 'aws-sdk';
import { orderReadyTemplate } from "./templates/orderReady";
import fs from 'fs';
import path from 'path';

const ses = new AWS.SES({
    apiVersion: '2010-12-01',
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new Error("AWS SES credentials not configured");
    }

    if (!process.env.AWS_SES_FROM_EMAIL) {
        throw new Error("AWS_SES_FROM_EMAIL not configured");
    }

    const params = {
        Source: `Grodify <${process.env.AWS_SES_FROM_EMAIL}>`,
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: html,
                    Charset: 'UTF-8',
                },
            },
        },
    };

    try {
        const result = await ses.sendEmail(params).promise();
        return result;
    } catch (error: any) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
};

interface SendOrderReadyParams {
    orderId: string;
    customerName: string;
    customerEmail: string;
    flyerName: string;
    downloadUrl: string;
    imageUrl?: string;
}

export const sendOrderReadyEmail = async (params: SendOrderReadyParams) => {
    const { customerEmail, customerName, orderId, flyerName, downloadUrl, imageUrl } = params;

    const html = orderReadyTemplate({
        name: customerName,
        orderId,
        downloadUrl,
        imageUrl,
        customerEmail,
    });

    try {
        return await sendEmail({
            to: customerEmail,
            subject: `Your Flyer is Ready! – #${orderId}`,
            html,
        });
    } catch (error) {
        console.error('📧 ❌ sendOrderReadyEmail failed:', error);
        throw error;
    }
};
