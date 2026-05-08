export const FEATURE_FLAGS = {
    SHOW_BETA_FEATURES: process.env.NEXT_PUBLIC_SHOW_BETA === 'true' || process.env.NODE_ENV === 'development',
    // Individual feature flags can be added here
    MODULE_ALUMNI: false,
    MODULE_REPORTS: false, // Only Inventory is ready
    MODULE_BULK_COMMS: false,
    MODULE_LIBRARY: false,
    MODULE_QR_ATTENDANCE: false,
    MODULE_SETTINGS_ADVANCED: false,
};

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    return FEATURE_FLAGS[flag] || FEATURE_FLAGS.SHOW_BETA_FEATURES;
};
