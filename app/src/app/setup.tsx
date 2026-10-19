import { router } from 'expo-router';
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
  const { apiUrl, saveApiUrl } = useApiUrl();
  // Read once, so the copy doesn't change while first-time setup fades out.
  const [isChanging] = useState(apiUrl !== null);
  const [input, setInput] = useState(apiUrl ?? suggestedApiUrl);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // On first-time setup, saving flips the layout's guards instead.
  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Opened directly, as by reloading the page on web.
      router.replace('/');
    }
  };

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
      if (isChanging) {
        leave();
      }
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
                <Text style={styles.title}>
                  {isChanging ? 'Change server URL' : 'Welcome to Stardrop Cafe!'}
                </Text>
                <Text style={styles.body}>
                  {isChanging
                    ? 'Enter the address of your recipe server.'
                    : 'Enter the address of your recipe server to get started.'}
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
                <View style={styles.actions}>
                  {isChanging && (
                    <Pressable
                      accessibilityRole="button"
                      disabled={isChecking}
                      onPress={leave}
                      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    disabled={isChecking}
                    onPress={connect}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                  >
                    {isChecking
                      ? <ActivityIndicator color="#853605" />
                      : <Text style={styles.connectText}>Connect</Text>}
                  </Pressable>
                </View>
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
  actions: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionButtonPressed: {
    opacity: 0.65,
  },
  cancelText: {
    color: '#853605',
    fontSize: 22,
  },
  connectText: {
    color: '#853605',
    fontFamily: 'StardewFontBold',
    fontSize: 22,
  },
});
