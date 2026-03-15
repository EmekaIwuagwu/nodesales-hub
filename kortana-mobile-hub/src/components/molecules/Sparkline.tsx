import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../../theme';

interface Props {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

export const Sparkline: React.FC<Props> = ({
    data,
    width = 300,
    height = 50,
    color = theme.colors.primary
}) => {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
        <View style={{ width, height, overflow: 'hidden' }}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.3" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>
                <Path
                    d={areaData}
                    fill="url(#gradient)"
                />
                <Path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                />
            </Svg>
        </View>
    );
};
