import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { confirmDestructive } from '@/lib/confirm';
import { fetchDayGospel, gospelExcerpt, DayGospel } from '@/lib/lectionary';
import { Card } from '@/components/ui/Card';
import { useSession } from '@/lib/auth';
import { useDemoMode } from '@/lib/demo';
import { DrawerMenuButton } from '@/components/ui/DrawerMenuButton';
import { HeaderActions, fitTitle } from '@/components/ui/HeaderActions';
import {
  JournalEntry, getJournalEntries, saveJournalEntries, JournalUnavailableError,
  Blessing, getBlessings, saveBlessings, migrateBlessingFlags,
  UNTITLED,
} from '@/lib/journal';
import { PrivacyNote } from '@/components/ui/PrivacyNote';
import { PRIVACY_COPY } from '@/lib/privacy-copy';
import { S, fmt, fmtDate as fmtLocalDate, GLYPH, isRTL, ltrText } from '@/lib/i18n';

const T = S.journal;

// What an entry saved without a title is stored as. Kept in English in every
// language (lib/journal.ts compares against it); entryTitleText shows it
// translated.
const entryTitleText = (entry: JournalEntry) => (entry.title === UNTITLED ? T.untitled : entry.title);

// Scripture typed or quoted in Latin script reads left-to-right even while
// the app is in Arabic; a verse the member typed in Arabic keeps its own
// direction.
const scriptureDirection = (text: string) => (/[\u0600-\u06FF]/.test(text) ? null : ltrText);

// Spiritual practices/disciplines were removed from this tab — daily practices
// live on the Canon tab (assigned canon + personal rule). This tab is now
// purely the written journal: today's entry, past entries, and the prompt.

const DEMO_ENTRIES: JournalEntry[] = [
  { id: 'e1', created_at: '2026-06-04', title: T.demo.fastTitle, reflection: T.demo.fastReflection, scripture: 'Psalm 62:1 — O God, my God, I rise early to be with You', prayer_intention: T.demo.fastIntention },
  { id: 'e2', created_at: '2026-05-30', title: T.demo.gratitudeTitle, reflection: T.demo.gratitudeReflection, scripture: 'Psalm 116:7 — Return to your rest, O my soul' },
  { id: 'e3', created_at: '2026-05-22', title: T.demo.confessionTitle, reflection: T.demo.confessionReflection },
];

const DEMO_BLESSINGS: Blessing[] = [
  { id: 'b1', created_at: '2026-06-02', text: T.demo.blessingSleep },
  { id: 'b2', created_at: '2026-05-18', text: T.demo.blessingCall },
  { id: 'b3', created_at: '2026-04-27', text: T.demo.blessingJob },
];

// Kept short on the page; the full list unfolds on request.
const BLESSINGS_PREVIEW = 5;

function fmtDate(iso: string, long = false): string {
  // Date-only strings ("2026-06-04") parse as UTC midnight and can display as
  // the previous day locally — anchor them to local noon so the calendar day
  // survives any timezone. Full ISO timestamps parse as-is.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T12:00:00') : new Date(iso);
  return fmtLocalDate(d, long
    ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Entry row — tap to open the entry (delete lives in the detail view) ──
function EntryRow({ entry, onPress }: {
  entry: JournalEntry; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.entryItem} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.entryDate}>{fmtDate(entry.created_at)}</Text>
        <Text style={styles.entryTitle}>{entryTitleText(entry)}</Text>
        <Text style={styles.entryPreview} numberOfLines={2}>{entry.reflection}</Text>
        {entry.flaggedForConfession && (
          <Text style={styles.entryFlagBadge}>{T.past.flagBadge}</Text>
        )}
      </View>
      <Text style={styles.entryChevron}>{GLYPH.forward}</Text>
    </TouchableOpacity>
  );
}

// ── Screen ───────────────────────────────────────────────────
export default function JournalScreen() {
  const { user } = useSession();
  const { demoMode } = useDemoMode();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(!demoMode);
  const [savingEntry, setSavingEntry] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);

  // Today's Gospel from the Coptic lectionary (null = unavailable → static
  // fallback prompt). Fetched once per mount; cached per-date on device.
  const [gospel, setGospel] = useState<DayGospel | null>(null);
  const [showFullGospel, setShowFullGospel] = useState(false);
  useEffect(() => { fetchDayGospel().then(setGospel); }, []);

  // New entry form
  const [entryTitle, setEntryTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const [scripture, setScripture] = useState('');
  const [prayerIntention, setPrayerIntention] = useState('');
  const [flagForConfession, setFlagForConfession] = useState(false);

  // Blessings — their own dated list, kept in their own row so the entries
  // payload is untouched by them.
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [blessingText, setBlessingText] = useState('');
  const [savingBlessing, setSavingBlessing] = useState(false);
  // Set when the journal couldn't be opened. Saving is off until it can be:
  // writing on top of a journal we couldn't read would replace it.
  const [unavailable, setUnavailable] = useState<'locked' | 'offline' | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [showAllBlessings, setShowAllBlessings] = useState(false);

  useEffect(() => {
    if (demoMode) {
      setEntries(DEMO_ENTRIES);
      setBlessings(DEMO_BLESSINGS);
    } else {
      load();
    }
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    setUnavailable(null);
    try {
      // Anything still carrying the old per-entry blessing flag is moved into
      // the list first, so nobody opens this tab to find their blessings gone.
      const carried = await migrateBlessingFlags(user.id);
      const [entryList, blessingList] = await Promise.all([
        getJournalEntries(user.id),
        carried ? Promise.resolve(carried) : getBlessings(user.id),
      ]);
      setEntries(entryList);
      setBlessings(blessingList);
    } catch (e) {
      setUnavailable(e instanceof JournalUnavailableError ? e.reason : 'offline');
    }
    setLoading(false);
  }

  async function persistBlessings(next: Blessing[]) {
    if (!user || demoMode || unavailable) return;
    try { await saveBlessings(user.id, next); setSaveError(false); } catch { setSaveError(true); }
  }

  async function addBlessing() {
    const text = blessingText.trim();
    if (!text || savingBlessing) return;
    setSavingBlessing(true);
    const updated = [{ id: Date.now().toString(), created_at: new Date().toISOString(), text }, ...blessings];
    setBlessings(updated);
    await persistBlessings(updated);
    setBlessingText('');
    setSavingBlessing(false);
  }

  function deleteBlessing(id: string) {
    confirmDestructive(T.blessings.removeTitle, T.blessings.removeBody, S.common.remove, () => {
      const updated = blessings.filter(b => b.id !== id);
      setBlessings(updated);
      persistBlessings(updated);
    });
  }

  async function saveEntries(newEntries: JournalEntry[]) {
    if (!user || demoMode || unavailable) return;
    try { await saveJournalEntries(user.id, newEntries); setSaveError(false); } catch { setSaveError(true); }
  }

  async function saveEntry() {
    if (!reflection.trim()) return;
    setSavingEntry(true);
    const entry: JournalEntry = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      title: entryTitle.trim() || UNTITLED,
      reflection: reflection.trim(),
      scripture: scripture.trim(),
      prayer_intention: prayerIntention.trim(),
      flaggedForConfession: flagForConfession,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    await saveEntries(updated);
    setEntryTitle(''); setReflection(''); setScripture(''); setPrayerIntention(''); setFlagForConfession(false);
    setSavingEntry(false);
  }

  function deleteEntry(id: string) {
    confirmDestructive(T.detail.deleteTitle, T.detail.deleteBody, S.common.delete, () => {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      saveEntries(updated);
      setViewEntry(null);
    });
  }

  function toggleConfessionFlag(id: string) {
    const updated = entries.map(e => e.id === id ? { ...e, flaggedForConfession: !e.flaggedForConfession } : e);
    setEntries(updated);
    saveEntries(updated);
    setViewEntry(v => v && v.id === id ? updated.find(e => e.id === id) ?? v : v);
  }

  const todayStr = fmtLocalDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' });

  // ── Entry detail ───────────────────────────────────────────
  if (viewEntry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setViewEntry(null)} hitSlop={10}>
            <Text style={styles.detailBack}>{GLYPH.back} {T.detail.back}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteEntry(viewEntry.id)} hitSlop={10}>
            <Text style={styles.detailDelete}>{S.common.delete}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <Text style={styles.detailDate}>{fmtDate(viewEntry.created_at, true)}</Text>
          <Text style={styles.detailTitle}>{entryTitleText(viewEntry)}</Text>

          <TouchableOpacity
            style={[styles.confessionFlagChip, viewEntry.flaggedForConfession && styles.confessionFlagChipActive]}
            onPress={() => toggleConfessionFlag(viewEntry.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.confessionFlagChipText, viewEntry.flaggedForConfession && styles.confessionFlagChipTextActive]}>
              {viewEntry.flaggedForConfession ? T.detail.flagged : T.detail.flag}
            </Text>
          </TouchableOpacity>

          <Text style={styles.detailLabel}>{T.labels.reflection}</Text>
          <Text style={styles.detailBody}>{viewEntry.reflection}</Text>

          {!!viewEntry.scripture && (
            <>
              <Text style={styles.detailLabel}>{T.labels.scripture}</Text>
              <View style={styles.detailScriptureCard}>
                <Text style={[styles.detailScripture, scriptureDirection(viewEntry.scripture)]}>{viewEntry.scripture}</Text>
              </View>
            </>
          )}

          {!!viewEntry.prayer_intention && (
            <>
              <Text style={styles.detailLabel}>{T.labels.prayerIntention}</Text>
              <Text style={styles.detailBody}>{viewEntry.prayer_intention}</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Journal home ───────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        <View style={styles.titleRow}>
          <DrawerMenuButton />
          <Text style={[styles.pageTitle, styles.titleFill]} {...fitTitle}>{T.title}</Text>
          <HeaderActions />
        </View>
        <Text style={styles.pageSubtitle}>{T.subtitle}</Text>

        {unavailable && (
          <Card title={unavailable === 'locked' ? T.unavailable.lockedTitle : T.unavailable.offlineTitle} titleIcon="🔒">
            <Text style={styles.emptyBody}>
              {unavailable === 'locked'
                ? T.unavailable.lockedBody
                : T.unavailable.offlineBody}
            </Text>
            <TouchableOpacity style={[styles.btnGoldFull, { marginTop: 12 }]} onPress={load}>
              <Text style={styles.btnGoldFullText}>{T.unavailable.tryAgain}</Text>
            </TouchableOpacity>
          </Card>
        )}
        {saveError && !unavailable && (
          <Text style={[styles.emptyBody, { color: colors.red, marginBottom: 8 }]}>
            {T.unavailable.saveError}
          </Text>
        )}

        {/* Today's Entry */}
        <Card title={T.today.title} titleIcon="✦" action={<Text style={styles.dateLabel}>{todayStr}</Text>}>
          <Text style={styles.formLabel}>{T.labels.titleOptional}</Text>
          <TextInput style={styles.input} placeholder={T.today.titlePlaceholder} placeholderTextColor={colors.faint} value={entryTitle} onChangeText={setEntryTitle} />
          <Text style={[styles.formLabel, { marginTop: 14 }]}>{T.labels.reflection}</Text>
          <TextInput style={[styles.textarea, { minHeight: 110 }]} multiline placeholder={T.today.reflectionPlaceholder} placeholderTextColor={colors.faint} value={reflection} onChangeText={setReflection} />
          <Text style={[styles.formLabel, { marginTop: 14 }]}>{T.labels.scripture}</Text>
          <TextInput style={styles.input} placeholder={T.today.scripturePlaceholder} placeholderTextColor={colors.faint} value={scripture} onChangeText={setScripture} />
          <Text style={[styles.formLabel, { marginTop: 14 }]}>{T.labels.prayerIntention}</Text>
          <TextInput style={[styles.textarea, { minHeight: 56 }]} multiline placeholder={T.today.intentionPlaceholder} placeholderTextColor={colors.faint} value={prayerIntention} onChangeText={setPrayerIntention} />
          <TouchableOpacity
            style={[styles.checkboxRow, { marginTop: 14 }]}
            onPress={() => setFlagForConfession(v => !v)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, flagForConfession && styles.checkboxChecked]}>
              {flagForConfession && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{T.today.flagForConfession}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnGoldFull, (!reflection.trim() || savingEntry || !!unavailable) && styles.btnDisabled]}
            onPress={saveEntry}
            disabled={!reflection.trim() || savingEntry || !!unavailable}
          >
            {savingEntry ? <ActivityIndicator color={colors.navy} /> : <Text style={styles.btnGoldFullText}>{T.today.save}</Text>}
          </TouchableOpacity>
          <PrivacyNote text={PRIVACY_COPY.journal} />
        </Card>

        {/* Past Entries */}
        <Card title={fmt(T.past.title, { n: entries.length })} flat>
          {loading ? (
            <ActivityIndicator color={colors.gold} style={{ paddingVertical: 20 }} />
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>◎</Text>
              <Text style={styles.emptyTitle}>{T.past.emptyTitle}</Text>
              <Text style={styles.emptyBody}>{T.past.emptyBody}</Text>
            </View>
          ) : (
            entries.map(entry => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onPress={() => setViewEntry(entry)}
              />
            ))
          )}
        </Card>

        {/* Blessings — a running record of what God has done, to be read back
            later. Newest first; only the latest few show until unfolded. */}
        <Card title={blessings.length ? fmt(T.blessings.titleCount, { n: blessings.length }) : T.blessings.title} titleIcon="✧">
          <Text style={styles.blessingIntro}>
            {T.blessings.intro}
          </Text>
          <TextInput
            style={[styles.textarea, { minHeight: 64 }]}
            multiline
            placeholder={T.blessings.placeholder}
            placeholderTextColor={colors.faint}
            value={blessingText}
            onChangeText={setBlessingText}
          />
          <TouchableOpacity
            style={[styles.btnGoldFull, (!blessingText.trim() || savingBlessing || !!unavailable) && styles.btnDisabled]}
            onPress={addBlessing}
            disabled={!blessingText.trim() || savingBlessing || !!unavailable}
          >
            {savingBlessing ? <ActivityIndicator color={colors.navy} /> : <Text style={styles.btnGoldFullText}>{T.blessings.add}</Text>}
          </TouchableOpacity>

          {loading ? null : blessings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✧</Text>
              <Text style={styles.emptyTitle}>{T.blessings.emptyTitle}</Text>
              <Text style={styles.emptyBody}>{T.blessings.emptyBody}</Text>
            </View>
          ) : (
            <View style={{ marginTop: 16 }}>
              {(showAllBlessings ? blessings : blessings.slice(0, BLESSINGS_PREVIEW)).map(b => (
                <View key={b.id} style={styles.blessingRow}>
                  <Text style={styles.blessingMark}>✧</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.blessingDate}>{fmtDate(b.created_at)}</Text>
                    <Text style={styles.blessingText}>{b.text}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteBlessing(b.id)} hitSlop={10}>
                    <Text style={styles.blessingRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {blessings.length > BLESSINGS_PREVIEW && (
                <TouchableOpacity onPress={() => setShowAllBlessings(v => !v)} hitSlop={6}>
                  <Text style={styles.promptExpand}>
                    {showAllBlessings ? T.blessings.showFewer : fmt(T.blessings.showAll, { n: blessings.length })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* Today's Prompt — the Gospel of the day from the Coptic lectionary
            (Katameros), with a static fallback when the reading can't load. */}
        <Card title={T.prompt.title} titleIcon="◇">
          {gospel ? (() => {
            const excerpt = gospelExcerpt(gospel);
            return (
              <>
                <Text style={styles.promptFast}>{T.prompt.fromGospel}</Text>
                {/* In Arabic the lectionary serves the reading in Arabic (Van
                    Dyck), so it is shown as it arrives, right-to-left. */}
                <Text style={styles.promptQuote}>{isRTL ? `«${excerpt.text}»` : `"${excerpt.text}"`}</Text>
                <Text style={styles.promptRef}>{excerpt.ref}</Text>
                <TouchableOpacity onPress={() => setShowFullGospel(v => !v)} hitSlop={6}>
                  <Text style={styles.promptExpand}>
                    {showFullGospel ? T.prompt.hideFull : fmt(T.prompt.readFull, { reference: gospel.reference })}
                  </Text>
                </TouchableOpacity>
                {showFullGospel && gospel.passages.map(p => (
                  <View key={`${p.book}-${p.ref}`} style={styles.fullPassage}>
                    <Text style={styles.fullPassageRef}>{p.book} {p.ref}</Text>
                    <Text style={styles.fullPassageText}>
                      {p.verses.map(v => (
                        <Text key={v.number}>
                          <Text style={styles.verseNum}>{v.number} </Text>{v.text}{' '}
                        </Text>
                      ))}
                    </Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <Text style={styles.promptReflection}>
                  {T.prompt.gospelReflection}
                </Text>
              </>
            );
          })() : (
            <>
              {isRTL && <Text style={styles.scriptureNote}>{S.common.scriptureInEnglish}</Text>}
              <Text style={[styles.promptQuote, ltrText]}>"Watch and pray that you may not enter into temptation. The spirit indeed is willing, but the flesh is weak."</Text>
              <Text style={styles.promptRef}>{T.prompt.fallbackRef}</Text>
              <View style={styles.divider} />
              <Text style={styles.promptReflection}>
                {T.prompt.fallbackReflection}
              </Text>
            </>
          )}
        </Card>

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

  formLabel: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.8, marginBottom: 8 },
  textarea: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 13, padding: 12, textAlignVertical: 'top', lineHeight: 20 },
  input: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 13, padding: 12 },
  dateLabel: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },

  btnGoldFull: { backgroundColor: colors.gold, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 14 },
  btnDisabled: { opacity: 0.35 },
  btnGoldFullText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.navy, letterSpacing: 0.8 },

  entryItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: 8 },
  entryDate: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.7, marginBottom: 3 },
  entryTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 2 },
  entryPreview: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 18 },
  entryChevron: { fontSize: 18, color: colors.gold, paddingHorizontal: 4 },
  entryFlagBadge: { fontFamily: fonts.latoBold, fontSize: 10, color: colors.gold, marginTop: 4 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkboxTick: { color: colors.navy, fontSize: 12, fontFamily: fonts.latoBold },
  checkboxLabel: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.cream, flex: 1 },


  divider: { height: 1, backgroundColor: colors.border },

  // Blessings
  blessingIntro: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 12 },
  blessingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  blessingMark: { fontSize: 14, color: colors.gold, marginTop: 2 },
  blessingDate: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.7, marginBottom: 3 },
  blessingText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.cream, lineHeight: 19 },
  blessingRemove: { fontSize: 15, color: colors.muted, paddingHorizontal: 2 },

  emptyState: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyIcon: { fontSize: 28, color: colors.muted, opacity: 0.4 },
  emptyTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.muted },
  emptyBody: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 17, opacity: 0.7 },

  promptFast: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.75, marginBottom: 8 },
  // Shown above scripture while the app is in another language.
  scriptureNote: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 6 },
  promptQuote: { fontFamily: fonts.cormorantItalic, fontSize: 17, color: colors.cream, lineHeight: 26, marginBottom: 8 },
  promptRef: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 10 },
  promptReflection: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 20 },
  promptExpand: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.gold, marginBottom: 10 },
  fullPassage: { marginBottom: 10 },
  fullPassageRef: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, marginBottom: 4 },
  fullPassageText: { fontFamily: fonts.cormorant, fontSize: 16, color: colors.cream, lineHeight: 25 },
  verseNum: { fontFamily: fonts.latoBold, fontSize: 9, color: colors.gold },

  // Entry detail
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailBack: { fontFamily: fonts.latoBold, fontSize: 14, color: colors.gold },
  detailDelete: { fontFamily: fonts.lato, fontSize: 13, color: colors.red },
  detailDate: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.7, marginBottom: 6 },
  detailTitle: { fontFamily: fonts.cormorantMedium, fontSize: 26, color: colors.cream, marginBottom: 14 },
  confessionFlagChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 20 },
  confessionFlagChipActive: { borderColor: colors.gold, backgroundColor: colors.goldDim },
  confessionFlagChipText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.muted },
  confessionFlagChipTextActive: { color: colors.goldLight },
  detailLabel: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.8, marginBottom: 8, marginTop: 4 },
  detailBody: { fontFamily: fonts.latoLight, fontSize: 15, color: colors.cream, lineHeight: 24, marginBottom: 20 },
  detailScriptureCard: { backgroundColor: 'rgba(201,168,76,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: 10, padding: 14, marginBottom: 20 },
  detailScripture: { fontFamily: fonts.cormorantItalic, fontSize: 16, color: colors.goldLight, lineHeight: 24 },
}));
