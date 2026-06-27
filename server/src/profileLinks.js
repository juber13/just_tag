export const PAYMENT_LINK_IDS = new Set(['google-pay', 'paytm', 'phonepe']);

export function getEnabledProfileLinks(profile) {
    if (!Array.isArray(profile?.links)) return [];

    return profile.links.filter(
        (link) =>
            link.id &&
            !PAYMENT_LINK_IDS.has(link.id) &&
            link.enabled !== false &&
            String(link.value || '').trim(),
    );
}

export function getEnabledProfileLinkIds(profile) {
    return getEnabledProfileLinks(profile).map((link) => link.id);
}

export function findEnabledProfileLink(profile, linkId) {
    const normalizedId = String(linkId || '').trim();
    if (!normalizedId || PAYMENT_LINK_IDS.has(normalizedId)) return null;

    return getEnabledProfileLinks(profile).find((link) => link.id === normalizedId) ?? null;
}
