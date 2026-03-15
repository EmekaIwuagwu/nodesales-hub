import React from 'react';
import { Text as RNText, TextStyle, TextProps } from 'react-native';
import { theme } from '../../theme';

interface Props extends TextProps {
    variant?: keyof typeof theme.typography;
    color?: string;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    style?: TextStyle | TextStyle[];
}

export const Text: React.FC<Props> = ({
    variant = 'bodyMd',
    color = theme.colors.white,
    align = 'left',
    style,
    children,
    ...props
}) => {
    const baseStyle = theme.typography[variant];

    return (
        <RNText
            style={[
                baseStyle as any,
                { color, textAlign: align },
                style
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
};
