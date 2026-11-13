import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { confirmDestructive } from '@/lib/confirm';
import { Card } from '@/components/ui/Card';
import { useSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { useDemoMode } from '@/lib/demo';
import { encryptForSelf, encryptForRecipient, decryptSelf } from '@/lib/crypto';
import { DrawerMenuButton } from '@/components/ui/DrawerMenuButton';
import { HeaderActions, fitTitle } from '@/components/ui/HeaderActions';
import { PrivacyNote } from '@/components/ui/PrivacyNote';
import { PRIVACY_COPY } from '@/lib/privacy-copy';
import { S, fmt, fmtDate } from '@/lib/i18n';

const T = S.prayer;

type Visibility = 'private' | 'foc_only' | 'foc_and_servant' | 'servant_only';
type Category = 'health' | 'family' | 'relationships' | 'work' | 'faith' | 'gratitude' | 'other';

const CATEGORY_OPTS: { value: Category; label: string; icon: string }[] = [
  { value: 'health', label: T.categories.health, icon: '✦' },
  { value: 'family', label: T.categories.family, icon: '◉' },
  { value: 'relationships', label: T.categories.relationships, icon: '◎' },
  { value: 'work', label: T.categories.work, icon: '◇' },
  { value: 'faith', label: T.categories.faith, icon: '✝︎' },
  { value: 'gratitude', label: T.categories.gratitude, icon: '◈' },
  { value: 'other', label: T.categories.other, icon: '⊕' },
];

const VISIBILITY_OPTS: { value: Visibility; chipLabel: string; icon: string }[] = [
  { value: 'private', chipLabel: T.visibilityChips.private, icon: '🔒' },
  { value: 'foc_only', chipLabel: T.visibilityChips.focOnly, icon: '✝︎' },
  { value: 'foc_and_servant', chipLabel: T.visibilityChips.focAndServant, icon: '◉' },
  { value: 'servant_only', chipLabel: T.visibilityChips.servantOnly, icon: '◎' },
];

const VIS_DISPLAY: Record<Visibility, { icon: string; label: string }> = {
  private: { icon: '🔒', label: T.visibility.private },
  foc_only: { icon: '✝︎', label: T.visibility.focOnly },
  foc_and_servant: { icon: '◉', label: T.visibility.focAndServant },
  servant_only: { icon: '◎', label: T.visibility.servantOnly },
};

const DEMO_ACTIVE = [
  { id: 'd1', topic: T.demo.motherTopic, created_at: '2026-06-03', body: T.demo.motherBody, visibility: 'foc_only' as Visibility, answered: false },
  { id: 'd2', topic: T.demo.fastTopic, created_at: '2026-05-31', body: T.demo.fastBody, visibility: 'private' as Visibility, answered: false },
  { id: 'd3', topic: T.demo.jobTopic, created_at: '2026-05-15', body: T.demo.jobBody, visibility: 'private' as Visibility, answered: false },
];

const DEMO_ANSWERED = [
  { id: 'da1', topic: T.demo.daughterTopic, created_at: '2026-05-02', answered_note: T.demo.daughterNote, answered: true },
];

// Date-only strings parse as UTC midnight and can display as the previous day
// locally — anchor them to local noon. Full ISO timestamps parse as-is.
function fmtShortDate(iso: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T12:00:00') : new Date(iso);
  return fmtDate(d, { month: 'short', day: 'numeric' });
}

// ── Request row — tap to reveal actions ──────────────────────
function ExpandableRequest({ item, onDelete, onMarkAnswered }: {
  item: any;
  onDelete: () => void;
  onMarkAnswered?: () => void;   // omitted for answered prayers → only Delete shows
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.reqItem}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setOpen(o => !o)}>
        <View style={styles.reqTop}>
          <Text style={styles.reqTitle}>
            {CATEGORY_OPTS.find(c => c.value === item.category)?.icon ?? '⊕'}{' '}
            {CATEGORY_OPTS.find(c => c.value === item.category)?.label ?? item.topic ?? item.category ?? T.requestFallback}
          </Text>
          <Text style={styles.reqDate}>{fmtShortDate(item.created_at)}</Text>
        </View>
        {item.body ? <Text style={styles.reqBody}>{item.body}</Text> : null}
        <View style={styles.reqVis}>
          <Text style={styles.reqVisText}>{VIS_DISPLAY[item.visibility as Visibility].icon} {VIS_DISPLAY[item.visibility as Visibility].label}</Text>
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.actionRow}>
          {onMarkAnswered && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionAnswer]}
              onPress={() => { setOpen(false); onMarkAnswered(); }}
            >
              <Text style={styles.actionAnswerText}>{T.markAnswered}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionDelete]}
            onPress={() => { setOpen(false); onDelete(); }}
          >
            <Text style={styles.actionDeleteText}>{T.delete}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────
export default function PrayerScreen() {
  const { user, profile } = useSession();
  const { demoMode } = useDemoMode();
  const [active, setActive] = useState<any[]>([]);
  const [answered, setAnswered] = useState<any[]>([]);
  const [loading, setLoading] = useState(!demoMode);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [category, setCategory] = useState<Category>('other');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (demoMode) {
      setActive(DEMO_ACTIVE);
      setAnswered(DEMO_ANSWERED);
    } else {
      load();
    }
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const data = await db.getPrayerRequests(user.id);
    if (data) {
      const decrypted = await Promise.all(data.map(async r => ({
        ...r,
        body: r.body_self ? await decryptSelf(r.body_self) : null,
      })));
      setActive(decrypted.filter(r => !r.answered));
      setAnswered(decrypted.filter(r => r.answered));
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (demoMode) {
      const newReq = { id: Date.now().toString(), category, created_at: new Date().toISOString(), visibility, answered: false, body: body || null };
      setActive(prev => [newReq, ...prev]);
      setCategory('other'); setVisibility('private'); setBody('');
      return;
    }
    setSubmitting(true);
    setSubmitError('');

    const row: Record<string, any> = { user_id: user!.id, category, visibility };

    if (body.trim()) {
      // Always encrypt for self so the congregant can read their own requests.
      row.body_self = await encryptForSelf(body.trim());

      // Encrypt for FOC if visibility includes priest.
      const includesFoc = visibility === 'foc_only' || visibility === 'foc_and_servant';
      if (includesFoc && profile?.foc_id) {
        const focPubKey = await db.getPublicKey(profile.foc_id);
        if (focPubKey) row.body_foc = await encryptForRecipient(body.trim(), focPubKey);
      }

      // Encrypt for servant if visibility includes servant.
      const includesServant = visibility === 'servant_only' || visibility === 'foc_and_servant';
      if (includesServant && profile?.servant_id) {
        const servantPubKey = await db.getPublicKey(profile.servant_id);
        if (servantPubKey) row.body_servant = await encryptForRecipient(body.trim(), servantPubKey);
      }
    }

    const { data, error } = await db.insertPrayerRequest(row);
    setSubmitting(false);
    if (error || !data) {
      setSubmitError(T.submitError);
      return;
    }
    setActive(prev => [{ ...data, body: body.trim() || null }, ...prev]);
    setCategory('other');
    setVisibility('private');
    setBody('');
  }

  async function handleDelete(id: string) {
    confirmDestructive(T.deleteRequestTitle, T.deleteRequestBody, S.common.delete, async () => {
      setActive(prev => prev.filter(r => r.id !== id));
      if (!demoMode) await db.deletePrayerRequest(id);
    });
  }

  async function handleMarkAnswered(id: string) {
    const req = active.find(r => r.id === id);
    if (!req) return;
    const updated = { ...req, answered: true };
    setActive(prev => prev.filter(r => r.id !== id));
    setAnswered(prev => [updated, ...prev]);
    if (!demoMode) {
      await db.markPrayerAnswered(id);
    }
  }

  async function handleDeleteAnswered(id: string) {
    confirmDestructive(T.deleteAnsweredTitle, T.deleteAnsweredBody, S.common.delete, async () => {
      setAnswered(prev => prev.filter(r => r.id !== id));
      if (!demoMode) await db.deletePrayerRequest(id);
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        <View style={styles.titleRow}>
          <DrawerMenuButton />
          <Text style={[styles.pageTitle, styles.titleFill]} {...fitTitle}>{T.title}</Text>
          <HeaderActions />
        </View>
        <Text style={styles.pageSubtitle}>{T.subtitle}</Text>

        {/* Active Requests */}
        <Card title={fmt(T.activeTitle, { n: active.length })} flat>
          {loading ? (
            <ActivityIndicator color={colors.gold} style={{ paddingVertical: 20 }} />
          ) : active.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>◇</Text>
              <Text style={styles.emptyTitle}>{T.emptyTitle}</Text>
              <Text style={styles.emptyBody}>{T.emptyBody}</Text>
            </View>
          ) : (
            active.map(req => (
              <ExpandableRequest
                key={req.id}
                item={req}
                onDelete={() => handleDelete(req.id)}
                onMarkAnswered={() => handleMarkAnswered(req.id)}
              />
            ))
          )}
        </Card>

        {/* New Request */}
        <Card title={T.newRequest} titleIcon="✦">
          <View style={styles.privacyBanner}>
            <Text style={styles.privacyBannerText}>
              {T.encryptionNote}
            </Text>
          </View>
          <Text style={styles.formLabel}>{T.categoryLabel}</Text>
          <View style={styles.categoryGrid}>
            {CATEGORY_OPTS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.categoryPill, category === opt.value && styles.categoryPillActive]}
                onPress={() => setCategory(opt.value)}
              >
                <Text style={[styles.categoryPillText, category === opt.value && styles.categoryPillTextActive]}>
                  {opt.icon} {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.formLabel, { marginTop: 14 }]}>{T.visibilityLabel}</Text>
          <View style={styles.visChipRow}>
            {VISIBILITY_OPTS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.visChip, visibility === opt.value && styles.visChipActive]}
                onPress={() => setVisibility(opt.value)}
              >
                <Text style={styles.visChipIcon}>{opt.icon}</Text>
                <Text style={[styles.visChipText, visibility === opt.value && styles.visChipTextActive]}>
                  {opt.chipLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {visibility !== 'private' && (
            <Text style={styles.visDescription}>{VIS_DISPLAY[visibility].label}</Text>
          )}
          <Text style={[styles.formLabel, { marginTop: 14 }]}>{T.detailsLabel}</Text>
          <TextInput
            style={styles.bodyInput}
            multiline
            placeholder={T.detailsPlaceholder}
            placeholderTextColor={colors.faint}
            value={body}
            onChangeText={setBody}
          />
          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          <TouchableOpacity
            style={[styles.btnGoldFull, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color={colors.navy} />
              : <Text style={styles.btnGoldText}>{T.submit}</Text>
            }
          </TouchableOpacity>
          <PrivacyNote text={PRIVACY_COPY.prayer} />
        </Card>

        {/* Answered Prayers */}
        {answered.length > 0 && (
          <Card title={fmt(T.answeredTitle, { n: answered.length })} flat>
            {answered.map(req => (
              <ExpandableRequest
                key={req.id}
                item={{ ...req, visibility: req.visibility ?? 'private' }}
                onDelete={() => handleDeleteAnswered(req.id)}
              />
            ))}
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleFill: { flex: 1, marginEnd: 12 },
  pageTitle: { fontFamily: fonts.cormorantMedium, fontSize: 28, color: colors.cream, marginBottom: 4 },
  pageSubtitle: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, marginBottom: 20 },

  reqItem: { padding: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: 8 },
  reqTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 5 },
  reqTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, flex: 1 },
  reqDate: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, flexShrink: 0 },
  reqBody: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 6 },
  reqVis: { flexDirection: 'row', alignItems: 'center' },
  reqVisText: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted },

  // Action buttons revealed by tapping a request row.
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  actionAnswer: { backgroundColor: colors.greenBg, borderColor: colors.green },
  actionDelete: { backgroundColor: 'rgba(192,57,43,0.15)', borderColor: colors.red },
  actionAnswerText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.green, letterSpacing: 0.3 },
  actionDeleteText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.red, letterSpacing: 0.3 },

  divider: { height: 1, backgroundColor: colors.border },

  emptyState: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyIcon: { fontSize: 28, color: colors.muted, opacity: 0.4 },
  emptyTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.muted },
  emptyBody: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 17, opacity: 0.7 },

  formLabel: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.8, marginBottom: 8 },
  privacyBanner: { backgroundColor: 'rgba(201,168,76,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', borderRadius: 8, padding: 10, marginBottom: 14 },
  privacyBannerText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  categoryPillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  categoryPillText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.muted },
  categoryPillTextActive: { color: colors.goldLight },

  visChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  visChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  visChipActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  visChipIcon: { fontSize: 12 },
  visChipText: { fontFamily: fonts.latoBold, fontSize: 10, color: colors.muted, letterSpacing: 0.4 },
  visChipTextActive: { color: colors.goldLight },
  visDescription: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 6, paddingLeft: 2, lineHeight: 16 },

  bodyInput: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 13, padding: 12, minHeight: 80, textAlignVertical: 'top', lineHeight: 20, marginBottom: 4 },
  submitError: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.red, marginTop: 8 },
  btnGoldFull: { backgroundColor: colors.gold, borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 14 },
  btnDisabled: { opacity: 0.35 },
  btnGoldText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.navy, letterSpacing: 0.8 },
}));
