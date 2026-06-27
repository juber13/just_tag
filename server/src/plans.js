export const PLANS = {
    annual: {
        id: 'annual',
        name: 'Justagg Annual',
        amountPaise: 99900,
        currency: 'INR',
        durationDays: 365,
    },
};

export function getPlan(planId) {
    return PLANS[planId] ?? null;
}

export function listPlans() {
    return Object.values(PLANS).map((plan) => ({
        id: plan.id,
        name: plan.name,
        amountPaise: plan.amountPaise,
        currency: plan.currency,
        priceLabel: `₹${(plan.amountPaise / 100).toLocaleString('en-IN')} / year`,
    }));
}
