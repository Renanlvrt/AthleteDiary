// ============================================================
// components/SessionCard.tsx — Recent session summary card
// Expandable: tap to see notes + modify/revert button.
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  COLORS,
  MOOD_COLOURS,
  MOOD_LABELS,
  PERFORMANCE_LABELS,
  RADIUS,
  SPACING,
  SPORT_FULL_NAMES,
  SPORT_LABELS,
  TYPOGRAPHY,
} from '../lib/constants';
import { format } from '../lib/dates';
import { Session } from '../lib/types';

interface SessionCardProps {
  session: Session;
  /** Called when the user saves an edited note */
  onUpdateNote?: (sessionId: string, newNote: string) => Promise<void>;
}

function formatSessionDate(dateStr: string): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return format(new Date(dateStr + 'T12:00:00'), 'MMM d');
}

export function SessionCard({ session, onUpdateNote }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(session.notes ?? '');
  const [saving, setSaving] = useState(false);
  // Track original note so we can revert
  const [originalNote] = useState(session.notes ?? '');
  const [displayedNote, setDisplayedNote] = useState(session.notes ?? '');

  const chevronRotation = useSharedValue(0);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  function handleCardPress() {
    void Haptics.selectionAsync();
    const next = !expanded;
    setExpanded(next);
    chevronRotation.value = withTiming(next ? 90 : 0, { duration: 200 });
    if (!next) {
      setEditing(false);
    }
  }

  function handleEditPress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditText(displayedNote);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!onUpdateNote) return;
    setSaving(true);
    try {
      await onUpdateNote(session.id, editText.trim());
      setDisplayedNote(editText.trim());
      setEditing(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Error', 'Could not save note. Please try again.');
    }
    setSaving(false);
  }

  function handleRevert() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Revert note?',
      originalNote
        ? `Restore original note:\n"${originalNote}"`
        : 'Clear note and restore original (empty)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revert',
          style: 'destructive',
          onPress: async () => {
            if (!onUpdateNote) return;
            await onUpdateNote(session.id, originalNote);
            setDisplayedNote(originalNote);
            setEditText(originalNote);
            setEditing(false);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  }

  const hasNote = displayedNote.length > 0;
  const noteChanged = displayedNote !== originalNote;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleCardPress}
      accessible={true}
      accessibilityLabel={`${SPORT_FULL_NAMES[session.sport]} session, ${formatSessionDate(session.date)}`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <View style={styles.card}>
        {/* Left mood color bar */}
        <View style={[styles.accentBar, { backgroundColor: MOOD_COLOURS[session.mood] }]} />

        <View style={styles.innerContent}>
          {/* ── Summary row ── */}
          <View style={styles.summaryRow}>
            {/* Left: sport + meta */}
            <View style={styles.left}>
              <Text style={styles.sportName}>{SPORT_FULL_NAMES[session.sport]}</Text>
              <Text style={styles.meta}>
                {formatSessionDate(session.date)} · {PERFORMANCE_LABELS[session.performance]}
                {hasNote ? ' · 📝' : ''}
              </Text>
            </View>

            {/* Right: mood pill + chevron */}
            <View style={styles.right}>
              <View style={styles.moodPill}>
                <View style={[styles.moodDot, { backgroundColor: MOOD_COLOURS[session.mood] }]} />
                <Text style={styles.perfLabel}>{MOOD_LABELS[session.mood]}</Text>
              </View>
              <Animated.View style={chevronStyle}>
                <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
              </Animated.View>
            </View>
          </View>

          {/* ── Expanded panel ── */}
          {expanded && (
            <View style={styles.expandedPanel}>
              {/* Divider */}
              <View style={styles.divider} />

              {/* Notes section */}
              <View style={styles.notesBlock}>
                <Text style={styles.notesLabel}>NOTES</Text>

                {editing ? (
                  /* Edit mode */
                  <View>
                    <TextInput
                      style={styles.notesInput}
                      value={editText}
                      onChangeText={setEditText}
                      placeholder="Add a note about this session..."
                      placeholderTextColor="#CCCCCC"
                      multiline
                      autoFocus
                      accessible={true}
                      accessibilityLabel="Edit session notes"
                    />
                    <View style={styles.editActions}>
                      <Pressable
                        style={styles.cancelBtn}
                        onPress={() => setEditing(false)}
                        accessible={true}
                        accessibilityLabel="Cancel editing"
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSaveEdit}
                        disabled={saving}
                        accessible={true}
                        accessibilityLabel="Save note"
                      >
                        <Text style={styles.saveBtnText}>
                          {saving ? 'SAVING...' : 'SAVE NOTE'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  /* Display mode */
                  <View>
                    <Text style={hasNote ? styles.notesText : styles.notesEmpty}>
                      {hasNote ? displayedNote : 'No notes for this session.'}
                    </Text>

                    <View style={styles.noteActions}>
                      {/* Modify button — always shown */}
                      <Pressable
                        style={styles.modifyBtn}
                        onPress={handleEditPress}
                        accessible={true}
                        accessibilityLabel="Edit note"
                        accessibilityRole="button"
                      >
                        <Ionicons name="pencil-outline" size={12} color={COLORS.textOnYellow} />
                        <Text style={styles.modifyText}>
                          {hasNote ? 'MODIFY' : 'ADD NOTE'}
                        </Text>
                      </Pressable>

                      {/* Revert — only if note was changed from original */}
                      {noteChanged && (
                        <Pressable
                          style={styles.revertBtn}
                          onPress={handleRevert}
                          accessible={true}
                          accessibilityLabel="Revert to original note"
                          accessibilityRole="button"
                        >
                          <Ionicons name="arrow-undo-outline" size={12} color="#999999" />
                          <Text style={styles.revertText}>REVERT</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  sportName: {
    ...TYPOGRAPHY.cardName,
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  meta: {
    ...TYPOGRAPHY.cardMeta,
    fontSize: 11,
    color: '#888888',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFDE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  perfLabel: {
    ...TYPOGRAPHY.perfLabel,
    color: '#000000',
    fontSize: 10,
  },

  // Expanded panel
  expandedPanel: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },

  // Notes block
  notesBlock: {
    gap: 8,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#BBBBBB',
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 20,
  },
  notesEmpty: {
    fontSize: 12,
    color: '#CCCCCC',
    fontStyle: 'italic',
  },
  notesInput: {
    fontSize: 13,
    color: '#111111',          // Dark text on light input
    backgroundColor: '#F7F7F7',
    borderRadius: RADIUS.md,
    padding: 12,
    minHeight: 72,
    lineHeight: 20,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  // Note action buttons row
  noteActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  modifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modifyText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  revertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  revertText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Edit mode action row
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    backgroundColor: '#F0F0F0',
  },
  cancelText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.black,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
