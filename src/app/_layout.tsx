import { SourceCodePro_400Regular } from '@expo-google-fonts/source-code-pro/400Regular';
import { SourceCodePro_700Bold } from '@expo-google-fonts/source-code-pro/700Bold';
import { useFonts } from '@expo-google-fonts/source-code-pro/useFonts';
import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function RootLayout() {
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    SourceCodePro: SourceCodePro_400Regular,
    SourceCodeProBold: SourceCodePro_700Bold,
    StardewFont: require('../../assets/fonts/svthin.otf'),
    StardewFontBold: require('../../assets/fonts/svbold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
