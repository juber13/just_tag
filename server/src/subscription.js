import { getPlan } from './plans.js';

export function publicSubscription(user) {
    const sub = user?.subscription;
    return {
        status: sub?.status === 'active' ? 'active' : 'inactive',
        planId: sub?.planId ?? null,
        activatedAt: sub?.activatedAt ?? null,
        expiresAt: sub?.expiresAt ?? null,
    };
}

export function isSubscriptionActive(user) {
    if (user?.subscription?.status !== 'active') return false;

    const expiresAt = user.subscription.expiresAt;
    if (!expiresAt) return true;

    return new Date(expiresAt).getTime() > Date.now();
}

export function isProfilePubliclyVisible(profile) {
    return profile?.isPublished === true;
}

export async function activateSubscription(db, email, { planId, paymentId, orderId, source }) {
    const normalizedEmail = email.trim().toLowerCase();
    const plan = getPlan(planId);
    if (!plan) {
        throw new Error('Invalid plan');
    }

    const now = new Date();
    const activatedAt = now.toISOString();
    const expiresAt = plan.durationDays
        ? new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const subscription = {
        status: 'active',
        planId,
        activatedAt,
        expiresAt,
        source,
        razorpayPaymentId: paymentId ?? null,
        razorpayOrderId: orderId ?? null,
    };

    await db.collection('users').updateOne(
        { email: normalizedEmail },
        { $set: { subscription } },
    );

    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (user?.profileSlug) {
        await db.collection('profiles').updateOne(
            { slug: user.profileSlug },
            { $set: { isPublished: true, updatedAt: activatedAt } },
        );
    } else {
        await db.collection('profiles').updateOne(
            { ownerEmail: normalizedEmail },
            { $set: { isPublished: true, updatedAt: activatedAt } },
        );
    }

    return {
        subscription: publicSubscription({ subscription }),
        profileSlug: user?.profileSlug ?? '',
    };
}
