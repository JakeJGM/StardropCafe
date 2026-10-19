import { SourceCodePro_400Regular } from '@expo-google-fonts/source-code-pro/400Regular';
import { SourceCodePro_700Bold } from '@expo-google-fonts/source-code-pro/700Bold';
import { useFonts } from '@expo-google-fonts/source-code-pro/useFonts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60,
      retry: 2,
    },
  },
});

import { ApiUrlProvider, useApiUrl } from '@/hooks/use-api-url';
import { useTheme } from '@/hooks/use-theme';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiUrlProvider>
        <RootStack />
      </ApiUrlProvider>
    </QueryClientProvider>
  );
}

function RootStack() {
  const theme = useTheme();
  const { isLoading, apiUrl } = useApiUrl();
  const [fontsLoaded] = useFonts({
    SourceCodePro: SourceCodePro_400Regular,
    SourceCodeProBold: SourceCodePro_700Bold,
    StardewFont: require('../../assets/fonts/svthin.otf'),
    StardewFontBold: require('../../assets/fonts/svbold.otf'),
  });

  if (!fontsLoaded || isLoading) {
    return null;
  }

  const hasApiUrl = apiUrl !== null;

  // Until an API URL is saved, setup is the only reachable screen. Saving it
  // flips the guards, which sends the user on to the index screen. Afterwards
  // the URL is changed from change-server-url, the same screen pushed on top.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={hasApiUrl}>
        <Stack.Screen name="index" />
        <Stack.Screen name="recipe/[uuid]" />
        <Stack.Screen name="change-server-url" />
      </Stack.Protected>
      <Stack.Protected guard={!hasApiUrl}>
        <Stack.Screen name="setup" />
      </Stack.Protected>
    </Stack>
  );
}
