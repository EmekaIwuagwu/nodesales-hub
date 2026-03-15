export const FONTS = {
    display: 'Clash Display',
    body: 'Plus Jakarta Sans',
    mono: 'JetBrains Mono',
};

export const SIZES = {
    'display-2xl': 48,
    'display-xl': 36,
    'display-lg': 28,
    'heading-xl': 24,
    'heading-lg': 20,
    'heading-md': 18,
    'heading-sm': 16,
    'body-lg': 16,
    'body-md': 14,
    'body-sm': 12,
    'mono-md': 14,
    'mono-sm': 12,
};

export const WEIGHTS = {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
};

export const LINE_HEIGHTS = {
    'display-2xl': 56,
    'display-xl': 44,
    'display-lg': 36,
    'heading-xl': 32,
    'heading-lg': 28,
    'heading-md': 26,
    'heading-sm': 24,
    'body-lg': 24,
    'body-md': 22,
    'body-sm': 18,
    'mono-md': 22,
    'mono-sm': 18,
};

export const TYPE_SYSTEM = {
    display2xl: {
        fontFamily: FONTS.display,
        fontSize: SIZES['display-2xl'],
        lineHeight: LINE_HEIGHTS['display-2xl'],
        fontWeight: WEIGHTS.extraBold,
    },
    displayXl: {
        fontFamily: FONTS.display,
        fontSize: SIZES['display-xl'],
        lineHeight: LINE_HEIGHTS['display-xl'],
        fontWeight: WEIGHTS.bold,
    },
    displayLg: {
        fontFamily: FONTS.display,
        fontSize: SIZES['display-lg'],
        lineHeight: LINE_HEIGHTS['display-lg'],
        fontWeight: WEIGHTS.bold,
    },
    headingXl: {
        fontFamily: FONTS.body,
        fontSize: SIZES['heading-xl'],
        lineHeight: LINE_HEIGHTS['heading-xl'],
        fontWeight: WEIGHTS.semiBold,
    },
    headingLg: {
        fontFamily: FONTS.body,
        fontSize: SIZES['heading-lg'],
        lineHeight: LINE_HEIGHTS['heading-lg'],
        fontWeight: WEIGHTS.semiBold,
    },
    headingMd: {
        fontFamily: FONTS.body,
        fontSize: SIZES['heading-md'],
        lineHeight: LINE_HEIGHTS['heading-md'],
        fontWeight: WEIGHTS.semiBold,
    },
    headingSm: {
        fontFamily: FONTS.body,
        fontSize: SIZES['heading-sm'],
        lineHeight: LINE_HEIGHTS['heading-sm'],
        fontWeight: WEIGHTS.semiBold,
    },
    bodyLg: {
        fontFamily: FONTS.body,
        fontSize: SIZES['body-lg'],
        lineHeight: LINE_HEIGHTS['body-lg'],
        fontWeight: WEIGHTS.medium,
    },
    bodyMd: {
        fontFamily: FONTS.body,
        fontSize: SIZES['body-md'],
        lineHeight: LINE_HEIGHTS['body-md'],
        fontWeight: WEIGHTS.regular,
    },
    bodySm: {
        fontFamily: FONTS.body,
        fontSize: SIZES['body-sm'],
        lineHeight: LINE_HEIGHTS['body-sm'],
        fontWeight: WEIGHTS.regular,
    },
    monoMd: {
        fontFamily: FONTS.mono,
        fontSize: SIZES['mono-md'],
        lineHeight: LINE_HEIGHTS['mono-md'],
        fontWeight: WEIGHTS.medium,
    },
    monoSm: {
        fontFamily: FONTS.mono,
        fontSize: SIZES['mono-sm'],
        lineHeight: LINE_HEIGHTS['mono-sm'],
        fontWeight: WEIGHTS.regular,
    },
};
