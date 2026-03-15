import React from 'react';
import { Svg, Path, Circle, Rect, G } from 'react-native-svg';
import { theme } from '../../theme';

export type IconName =
    | 'send'
    | 'receive'
    | 'swap'
    | 'buy'
    | 'scan'
    | 'bell'
    | 'chevron-down'
    | 'eye'
    | 'eye-off'
    | 'copy'
    | 'share'
    | 'external-link'
    | 'check-circle'
    | 'alert-circle'
    | 'lock'
    | 'plus';

interface Props {
    name: IconName;
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export const Icon: React.FC<Props> = ({
    name,
    size = 24,
    color = theme.colors.white,
    strokeWidth = 2
}) => {
    const renderIcon = () => {
        switch (name) {
            case 'send':
                return <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'receive':
                return <Path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'swap':
                return <Path d="M16 3L21 8M21 8L16 13M21 8H3M8 21L3 16M3 16L8 11M3 16H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'buy':
                return (
                    <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <Path d="M1 10H23" />
                    </G>
                );
            case 'scan':
                return <Path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'bell':
                return <Path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8ZM13.73 21C13.591 21.238 13.3923 21.4347 13.1539 21.5704C12.9154 21.7061 12.6455 21.7766 12.3712 21.7751C12.0968 21.7735 11.8287 21.6999 11.5937 21.5616C11.3586 21.4233 11.1652 21.2255 11.033 20.9875" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'chevron-down':
                return <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'eye':
                return (
                    <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <Path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <Circle cx="12" cy="12" r="3" />
                    </G>
                );
            case 'eye-off':
                return <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22M12 12a3 3 0 01-3-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'copy':
                return (
                    <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </G>
                );
            case 'share':
                return (
                    <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                    </G>
                );
            case 'external-link':
                return <Path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            case 'check-circle':
                return (
                    <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <Path d="M22 4L12 14.01l-3-3" />
                    </G>
                );
            case 'alert-circle':
                return (
                    <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <Circle cx="12" cy="12" r="10" />
                        <Path d="M12 8v4M12 16h.01" />
                    </G>
                );
            case 'lock':
                return (
                    <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <Path d="M7 11V7a5 5 0 0110 0v4" />
                    </G>
                );
            case 'plus':
                return <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            default:
                return null;
        }
    };

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            {renderIcon()}
        </Svg>
    );
};
