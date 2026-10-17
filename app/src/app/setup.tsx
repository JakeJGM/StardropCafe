import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkApiUrl, suggestedApiUrl } from '@/api/api';
import { Text } from '@/components/text';
import { normalizeApiUrl, useApiUrl } from '@/hooks/use-api-url';

export default function SetupScreen() {
  const { saveApiUrl } = useApiUrl();
  const [input, setInput] = useState(suggestedApiUrl);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const connect = async () => {
    const url = normalizeApiUrl(input);
    if (url === null) {
      setError('Enter a URL like http://192.168.1.10:8080');
      return;
    }

    setError(null);
    setIsChecking(true);
    try {
      await checkApiUrl(url);
    } catch {
      setError(`Could not reach a recipe server at ${url}`);
      setIsChecking(false);
      return;
    }

    try {
      // Unmounts this screen on success, so isChecking is left as is.
      await saveApiUrl(url);
    } catch {
      setError('Could not save the URL. Please try again.');
      setIsChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}
      >
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.innerPageBorder}>
              <View style={styles.note}>
                <Text style={styles.title}>Welcome to Stardrop Cafe!</Text>
                <Text style={styles.body}>
                  Enter the address of your recipe server to get started.
                </Text>
                <TextInput
                  accessibilityLabel="Recipe server URL"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isChecking}
                  inputMode="url"
                  keyboardType="url"
                  onChangeText={setInput}
                  onSubmitEditing={connect}
                  placeholder="http://192.168.1.10:8080"
                  placeholderTextColor="#B08B6A"
                  returnKeyType="go"
                  style={styles.input}
                  value={input}
                />
                {error !== null && <Text style={styles.error}>{error}</Text>}
                <Pressable
                  accessibilityRole="button"
                  disabled={isChecking}
                  onPress={connect}
                  style={({ pressed }) => [styles.connectButton, pressed && styles.connectButtonPressed]}
                >
                  {isChecking
                    ? <ActivityIndicator color="#853605" />
                    : <Text style={styles.connectText}>Connect</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Same framed note as the recipe page.
  outerBorder: {
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
    backgroundColor: '#b14e05',
    padding: 10,
    borderRadius: 10,
  },
  innerBorder: {
    backgroundColor: '#dc7b05',
    padding: 10,
  },
  innerPageBorder: {
    backgroundColor: '#853605',
    padding: 10,
  },
  note: {
    backgroundColor: '#ffe6b7',
    padding: 20,
  },
  title: {
    fontFamily: 'StardewFontBold',
    fontSize: 32,
    lineHeight: 40,
  },
  body: {
    fontSize: 20,
    lineHeight: 28,
    marginTop: 8,
  },
  input: {
    borderColor: '#853605',
    borderWidth: 2,
    color: '#3C3C43',
    fontFamily: 'StardewFont',
    fontSize: 20,
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    color: '#B3261E',
    fontSize: 18,
    lineHeight: 24,
    marginTop: 12,
  },
  connectButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  connectButtonPressed: {
    opacity: 0.65,
  },
  connectText: {
    color: '#853605',
    fontFamily: 'StardewFontBold',
    fontSize: 22,
  },
});
