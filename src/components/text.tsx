import { StyleSheet, Text as ReactNativeText, type TextProps } from 'react-native';

export function Text({ style, ...props }: TextProps) {
  return <ReactNativeText {...props} style={[styles.default, style]} />;
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'StardewFont',
  },
});
