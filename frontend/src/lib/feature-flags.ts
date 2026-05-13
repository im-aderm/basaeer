export const FEATURE_FLAGS = {
    SHOW_BETA_FEATURES: process.env.NEXT_PUBLIC_SHOW_BETA === 'true' || process.env.NODE_ENV === 'development',
    MODULE_ALUMNI: true,
    MODULE_REPORTS: true,
    MODULE_BULK_COMMS: true,
    MODULE_LIBRARY: true,
    MODULE_QR_ATTENDANCE: true,
    MODULE_SETTINGS_ADVANCED: true,
};

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    return FEATURE_FLAGS[flag] || FEATURE_FLAGS.SHOW_BETA_FEATURES;
};
