import {
    findEnabledProfileLink,
    getEnabledProfileLinkIds,
    getEnabledProfileLinks,
} from './profileLinks.js';

export const ANALYTICS_RANGES = {
    '24h': { label: 'Past 24 Hours', ms: 24 * 60 * 60 * 1000 },
    week: { label: 'Past 7 Days', ms: 7 * 24 * 60 * 60 * 1000 },
    month: { label: 'Past 30 Days', ms: 30 * 24 * 60 * 60 * 1000 },
    all: { label: 'All Time', ms: null },
};

export function parseAnalyticsRange(value) {
    const key = String(value || '24h').trim().toLowerCase();
    return ANALYTICS_RANGES[key] ? key : '24h';
}

export function rangeStartDate(rangeKey) {
    const range = ANALYTICS_RANGES[rangeKey];
    if (!range || range.ms === null) return null;
    return new Date(Date.now() - range.ms);
}

export function slugVariants(profile, slugParam) {
    return [...new Set([
        profile.slug,
        slugParam,
        profile.email?.trim().toLowerCase(),
        profile.ownerEmail?.trim().toLowerCase(),
    ].filter(Boolean))];
}

function createdAtMatch(since) {
    if (!since) return {};
    return {
        $or: [
            { createdAt: { $gte: since } },
            { createdAt: { $gte: since.toISOString() } },
        ],
    };
}

function clickRatePercent(views, clicks) {
    if (!views) return 0;
    return Math.round((clicks / views) * 1000) / 10;
}

/** Profile URL open (/p/:slug). */
export async function recordProfileLinkVisit(db, slug) {
    await db.collection('events').insertOne({
        slug,
        type: 'view',
        createdAt: new Date().toISOString(),
    });
    return { ok: true };
}

/** WhatsApp / Facebook / other tiles on the public profile page. */
export async function recordProfileLinkClick(db, slug, payload, profile) {
    const linkId = String(payload?.linkId || '').trim();
    if (!linkId) {
        return { error: 'linkId is required' };
    }

    const profileLink = findEnabledProfileLink(profile, linkId);
    if (!profileLink) {
        return { ok: true, ignored: true };
    }

    const linkLabel = String(payload?.linkLabel || '').trim() || profileLink.label || linkId;

    await db.collection('events').insertOne({
        slug,
        type: 'click',
        linkId,
        linkLabel,
        createdAt: new Date().toISOString(),
    });

    return { ok: true };
}

export async function getProfileAnalytics(db, profile, slugParam, rangeKey) {
    const range = parseAnalyticsRange(rangeKey);
    const since = rangeStartDate(range);
    const slugs = slugVariants(profile, slugParam);
    const profileLinkIds = getEnabledProfileLinkIds(profile);

    const baseMatch = { slug: { $in: slugs }, ...createdAtMatch(since) };
    const viewMatch = { ...baseMatch, type: 'view' };
    const clickMatch = profileLinkIds.length
        ? { ...baseMatch, type: 'click', linkId: { $in: profileLinkIds } }
        : { ...baseMatch, type: 'click', linkId: '__none__' };
    const contactMatch = { slug: { $in: slugs }, ...createdAtMatch(since) };

    const [views, clicks, linkRows, viewDailyRows, clickDailyRows, contactDailyRows, contactsCount] =
        await Promise.all([
            db.collection('events').countDocuments(viewMatch),
            db.collection('events').countDocuments(clickMatch),
            db.collection('events').aggregate([
                { $match: clickMatch },
                {
                    $group: {
                        _id: '$linkId',
                        label: { $last: '$linkLabel' },
                        clicks: { $sum: 1 },
                    },
                },
                { $sort: { clicks: -1 } },
            ]).toArray(),
            db.collection('events').aggregate([
                { $match: viewMatch },
                {
                    $group: {
                        _id: { $substr: ['$createdAt', 0, 10] },
                        views: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]).toArray(),
            db.collection('events').aggregate([
                { $match: clickMatch },
                {
                    $group: {
                        _id: { $substr: ['$createdAt', 0, 10] },
                        clicks: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]).toArray(),
            db.collection('contacts').aggregate([
                { $match: contactMatch },
                {
                    $group: {
                        _id: { $substr: ['$createdAt', 0, 10] },
                        contacts: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]).toArray(),
            db.collection('contacts').countDocuments(contactMatch),
        ]);

    const profileLinks = getEnabledProfileLinks(profile);
    const linkMetaById = new Map(
        profileLinks.map((link) => [link.id, { label: link.label || link.id }]),
    );

    const links = linkRows.map((row) => ({
        linkId: row._id,
        label: row.label || linkMetaById.get(row._id)?.label || row._id,
        clicks: row.clicks,
    }));

    for (const link of profileLinks) {
        if (links.some((entry) => entry.linkId === link.id)) continue;
        links.push({
            linkId: link.id,
            label: link.label || link.id,
            clicks: 0,
        });
    }

    const dailyMap = new Map();
    for (const row of viewDailyRows) {
        dailyMap.set(row._id, {
            date: row._id,
            views: row.views,
            clicks: 0,
            contactModals: 0,
            contacts: 0,
        });
    }
    for (const row of clickDailyRows) {
        const existing = dailyMap.get(row._id) ?? {
            date: row._id,
            views: 0,
            clicks: 0,
            contactModals: 0,
            contacts: 0,
        };
        existing.clicks = row.clicks;
        dailyMap.set(row._id, existing);
    }
    for (const row of contactDailyRows) {
        const existing = dailyMap.get(row._id) ?? {
            date: row._id,
            views: 0,
            clicks: 0,
            contactModals: 0,
            contacts: 0,
        };
        existing.contacts = row.contacts;
        dailyMap.set(row._id, existing);
    }

    const daily = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));

    return {
        range,
        rangeLabel: ANALYTICS_RANGES[range].label,
        views,
        clicks,
        contacts: contactsCount,
        contactModals: 0,
        clickRate: clickRatePercent(views, clicks),
        links,
        daily,
    };
}

export async function ensureAnalyticsIndexes(db) {
    await db.collection('events').createIndex({ slug: 1, createdAt: -1 });
    await db.collection('events').createIndex({ slug: 1, type: 1, createdAt: -1 });
    await db.collection('contacts').createIndex({ slug: 1, createdAt: -1 });
}
