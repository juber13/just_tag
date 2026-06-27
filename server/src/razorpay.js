import crypto from 'crypto';
import Razorpay from 'razorpay';

export function getRazorpayKeyId() {
    return process.env.RAZORPAY_KEY_ID?.trim() ?? '';
}

export function isRazorpayConfigured() {
    return Boolean(getRazorpayKeyId() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

export function getRazorpayClient() {
    const keyId = getRazorpayKeyId();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
        throw new Error('Razorpay is not configured on the server');
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret || !orderId || !paymentId || !signature) return false;

    const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
        return false;
    }
}

export function verifyWebhookSignature(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    if (!secret || !signature) return false;

    const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
        return false;
    }
}
