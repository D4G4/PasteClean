import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { sanitizeForGmail } from '@pasteclean/gmail-sanitizer';
import {
  RichText,
  Toolbar,
  useEditorBridge,
  DEFAULT_TOOLBAR_ITEMS,
} from '@10play/tentap-editor';

export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: '',
  });

  React.useEffect(() => {
    editor.setPlaceholder('Start writing your email here...');
  }, [editor]);

  const handleCopyForGmail = useCallback(async () => {
    try {
      const html = await editor.getHTML();

      if (!html || html === '<p></p>' || html === '<p><br></p>') {
        Alert.alert('Nothing to copy', 'Write something first!');
        return;
      }

      const sanitized = sanitizeForGmail(html);
      await Clipboard.setStringAsync(sanitized);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Copy failed', 'Something went wrong. Please try again.');
      console.error('Copy error:', error);
    }
  }, [editor]);

  const handlePreview = useCallback(async () => {
    const html = await editor.getHTML();
    router.push({
      pathname: '/preview',
      params: { html },
    });
  }, [editor, router]);

  return (
    <>
      {/* Put actions in the header bar — like Apple Notes */}
      <Stack.Screen
        options={{
          headerTitle: 'PasteClean',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handlePreview}
                style={styles.headerButton}
                hitSlop={8}>
                <FontAwesome name="eye" size={20} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCopyForGmail}
                style={[
                  styles.copyPill,
                  { backgroundColor: copied ? colors.success : colors.tint },
                ]}
                activeOpacity={0.7}
                hitSlop={4}>
                <FontAwesome
                  name={copied ? 'check' : 'clipboard'}
                  size={14}
                  color="#fff"
                />
                <Text style={styles.copyPillText}>
                  {copied ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={88}>
        {/* Editor fills the entire screen */}
        <RichText editor={editor} style={styles.richText} />

        {/* Compact toolbar — sticks right above keyboard */}
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  richText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerButton: {
    padding: 4,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  copyPillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
