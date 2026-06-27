import path from 'path';
import { fileURLToPath } from 'url';
import { getPlan, listPlans } from './plans.js';
import {
    getRazorpayClient,
    getRazorpayKeyId,
    isRazorpayConfigured,
    verifyPaymentSignature,
    verifyWebhookSignature,
} from './razorpay.js';
import {
    activateSubscription,
    isSubscriptionActive,
    publicSubscription,
} from './subscription.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function ownerEmailFromRequest(req) {
    return req.headers['x-owner-email']?.trim().toLowerCase() ?? '';
}

async function findUserByEmail(db, email) {
    if (!email) return null;
    return db.collection('users').findOne({ email: email.trim().toLowerCase() });
}

async function findPaymentByOrderId(db, orderId) {
    return db.collection('payments').findOne({ orderId });
}

async function markPaymentCaptured(db, orderId, paymentId) {
    await db.collection('payments').updateOne(
        { orderId },
        {
            $set: {
                paymentId,
                status: 'captured',
                verifiedAt: new Date().toISOString(),
            },
        },
    );
}

async function processVerifiedPayment(db, { orderId, paymentId, source }) {
    const payment = await findPaymentByOrderId(db, orderId);
    if (!payment) {
        return { error: 'Order not found', status: 404 };
    }

    if (payment.status === 'captured' && payment.paymentId === paymentId) {
        const user = await findUserByEmail(db, payment.userEmail);
        return {
            ok: true,
            alreadyProcessed: true,
            subscription: publicSubscription(user),
            profileSlug: user?.profileSlug ?? '',
        };
    }

    const result = await activateSubscription(db, payment.userEmail, {
        planId: payment.planId,
        paymentId,
        orderId,
        source,
    });

    await markPaymentCaptured(db, orderId, paymentId);

    return {
        ok: true,
        subscription: result.subscription,
        profileSlug: result.profileSlug,
    };
}

export function registerPaymentRoutes(app, getDb) {
    app.get('/pay/checkout', (req, res) => {
        res.sendFile(path.join(PUBLIC_DIR, 'pay', 'checkout.html'));
    });

    app.get('/api/plans', (req, res) => {
        res.json({ plans: listPlans() });
    });

    app.get('/api/me/subscription', async (req, res) => {
        try {
            const email = ownerEmailFromRequest(req);
            if (!email) {
                return res.status(400).json({ error: 'X-Owner-Email header is required' });
            }

            const db = getDb();
            const user = await findUserByEmail(db, email);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                ok: true,
                subscription: publicSubscription(user),
                profileSlug: user.profileSlug ?? '',
            });
        } catch (error) {
            console.error('Fetch subscription failed:', error);
            res.status(500).json({ error: 'Failed to fetch subscription' });
        }
    });

    app.get('/api/payments/razorpay/checkout-config', async (req, res) => {
        try {
            if (!isRazorpayConfigured()) {
                return res.status(503).json({ error: 'Payment service is not configured' });
            }

            const orderId = String(req.query.order_id ?? '').trim();
            const email = String(req.query.email ?? '').trim().toLowerCase();
            if (!orderId || !email) {
                return res.status(400).json({ error: 'order_id and email are required' });
            }

            const db = getDb();
            const payment = await findPaymentByOrderId(db, orderId);
            if (!payment) {
                return res.status(404).json({ error: 'Order not found' });
            }
            if (payment.userEmail !== email) {
                return res.status(403).json({ error: 'Not authorized for this order' });
            }

            const user = await findUserByEmail(db, email);
            const plan = getPlan(payment.planId);

            res.json({
                keyId: getRazorpayKeyId(),
                orderId: payment.orderId,
                amount: payment.amount,
                currency: payment.currency,
                planName: plan?.name ?? 'Justagg',
                prefill: {
                    email,
                    contact: user?.mobile ?? '',
                    name: user?.fullName ?? '',
                },
            });
        } catch (error) {
            console.error('Checkout config failed:', error);
            res.status(500).json({ error: 'Failed to load checkout' });
        }
    });

    app.post('/api/payments/razorpay/create-order', async (req, res) => {
        try {
            if (!isRazorpayConfigured()) {
                return res.status(503).json({ error: 'Payment service is not configured' });
            }

            const email = ownerEmailFromRequest(req);
            if (!email) {
                return res.status(400).json({ error: 'X-Owner-Email header is required' });
            }

            const planId = String(req.body?.planId ?? 'annual').trim();
            const plan = getPlan(planId);
            if (!plan) {
                return res.status(400).json({ error: 'Invalid plan' });
            }

            const db = getDb();
            const user = await findUserByEmail(db, email);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (isSubscriptionActive(user)) {
                return res.status(409).json({
                    error: 'Subscription is already active',
                    subscription: publicSubscription(user),
                });
            }

            const razorpay = getRazorpayClient();
            const order = await razorpay.orders.create({
                amount: plan.amountPaise,
                currency: plan.currency,
                receipt: `justagg_${email.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`,
                notes: {
                    userEmail: email,
                    planId: plan.id,
                    profileSlug: user.profileSlug ?? '',
                },
            });

            await db.collection('payments').insertOne({
                orderId: order.id,
                userEmail: email,
                planId: plan.id,
                amount: plan.amountPaise,
                currency: plan.currency,
                status: 'created',
                createdAt: new Date().toISOString(),
            });

            res.json({
                ok: true,
                orderId: order.id,
                amount: plan.amountPaise,
                currency: plan.currency,
                keyId: getRazorpayKeyId(),
                planId: plan.id,
                planName: plan.name,
            });
        } catch (error) {
            console.error('Create Razorpay order failed:', error);
            res.status(500).json({ error: 'Failed to create payment order' });
        }
    });

    app.post('/api/payments/razorpay/verify', async (req, res) => {
        try {
            const email = ownerEmailFromRequest(req);
            if (!email) {
                return res.status(400).json({ error: 'X-Owner-Email header is required' });
            }

            const orderId = String(req.body?.razorpay_order_id ?? '').trim();
            const paymentId = String(req.body?.razorpay_payment_id ?? '').trim();
            const signature = String(req.body?.razorpay_signature ?? '').trim();

            if (!orderId || !paymentId || !signature) {
                return res.status(400).json({ error: 'Payment verification fields are required' });
            }

            if (!verifyPaymentSignature(orderId, paymentId, signature)) {
                return res.status(400).json({ error: 'Invalid payment signature' });
            }

            const db = getDb();
            const payment = await findPaymentByOrderId(db, orderId);
            if (!payment) {
                return res.status(404).json({ error: 'Order not found' });
            }
            if (payment.userEmail !== email) {
                return res.status(403).json({ error: 'Not authorized for this order' });
            }

            const result = await processVerifiedPayment(db, {
                orderId,
                paymentId,
                source: 'razorpay',
            });

            if (result.error) {
                return res.status(result.status ?? 400).json({ error: result.error });
            }

            res.json({
                ok: true,
                subscription: result.subscription,
                profileSlug: result.profileSlug,
            });
        } catch (error) {
            console.error('Verify Razorpay payment failed:', error);
            res.status(500).json({ error: 'Failed to verify payment' });
        }
    });
}

export async function handleRazorpayWebhook(req, res, getDb) {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.body;

        if (!Buffer.isBuffer(rawBody)) {
            return res.status(400).json({ error: 'Invalid webhook body' });
        }

        if (!verifyWebhookSignature(rawBody, signature)) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = JSON.parse(rawBody.toString('utf8'));
        const eventName = event?.event ?? '';
        const paymentEntity = event?.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id;

        if (eventName === 'payment.captured' && orderId && paymentId) {
            const db = getDb();
            await processVerifiedPayment(db, {
                orderId,
                paymentId,
                source: 'razorpay_webhook',
            });
        }

        res.json({ ok: true });
    } catch (error) {
        console.error('Razorpay webhook failed:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}

export async function requireActiveSubscription(db, ownerEmail) {
    const user = await findUserByEmail(db, ownerEmail);
    if (!user) {
        return { ok: false, status: 404, error: 'User not found' };
    }
    if (!isSubscriptionActive(user)) {
        return { ok: false, status: 403, error: 'Active subscription required' };
    }
    return { ok: true, user };
}
