import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { CandleIcon, PencilIcon, PrayingHandsIcon } from '@/components/ui/TabIcons';
import Harp from '@/components/ui/Harp';
import { useSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { useDemoMode } from '@/lib/demo';
import { decryptFromSender } from '@/lib/crypto';
import { confirmDestructive } from '@/lib/confirm';
import { pickPhoto, uploadAvatarImage, removeAvatarImage, newFlockPhotoPath, pathFromAvatarUrl, cameraAvailable, PhotoSource } from '@/lib/avatar';
import { S, fmt, plural, fmtDate, GLYPH, isRTL } from '@/lib/i18n';
import { describeAssigned } from '@/lib/canon/describe';

const T = S.servant.student;
const D = S.demo.servant;

// `frequency` and a request's category are stored values: these give the
// words shown for them, and anything else (a frequency typed by hand) is
// shown as stored.
const frequencyLabel = (v: string) => (S.canonEditor.servant.freq as Record<string, string>)[v] ?? v;
const categoryLabel = (v: string) => (T.prayer.categories as Record<string, string>)[v] ?? v;
const demoDate = (y: number, m: number, d: number) => fmtDate(new Date(y, m, d), { month: 'short', day: 'numeric', year: 'numeric' });
// `start_date` is stored as YYYY-MM-DD. It is read as a calendar day in the
// device's own time zone (new Date('2026-06-08') would be the evening before
// in the Americas); anything in another form is shown as stored.
const startDateLabel = (v: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v ?? '');
  return m ? demoDate(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : v;
};

// ── Demo data ─────────────────────────────────────────────────
const DEMO_DB: Record<string, {
  canons: any[]; note: string; prayer: string[];
  psalm: { streak: number; longestStreak: number; masteredItems: number } | null;
}> = {
  'demo-s1': {
    canons: [
      { id: 'ds1', component: D.johnMark.canonMorningAgpeya, frequency: 'Daily', startDate: demoDate(2026, 5, 1), completions: 5, totalDays: 7 },
      { id: 'ds2', component: D.johnMark.canonGospel, frequency: 'Daily', startDate: demoDate(2026, 5, 1), completions: 4, totalDays: 7 },
    ],
    note: D.johnMark.note,
    prayer: [...D.johnMark.prayer],
    psalm: { streak: 4, longestStreak: 10, masteredItems: 2 },
  },
  'demo-s2': {
    canons: [
      { id: 'ds3', component: D.esther.canonCompline, frequency: 'Daily', startDate: demoDate(2026, 4, 20), completions: 6, totalDays: 7 },
    ],
    note: D.esther.note,
    prayer: [...D.esther.prayer],
    psalm: null,
  },
};

function getDemoData(id: string) {
  return DEMO_DB[id] ?? DEMO_DB['demo-s1'];
}

type TabType = 'canons' | 'psalms' | 'notes' | 'prayer';

export default function StudentScreen() {
  const router = useRouter();
  const { id: studentId, name: studentName } = useLocalSearchParams<{ id: string; name: string }>();
  const { user } = useSession();
  const { demoMode } = useDemoMode();
  const [tab, setTab] = useState<TabType>('canons');
  const [loading, setLoading] = useState(!demoMode);

  const demo = getDemoData(studentId ?? '');
  const [canons, setCanons] = useState<any[]>(demo.canons);
  const [notes, setNotes] = useState<db.PastoralNote[]>(
    demo.note ? [{ id: 'demo-note-1', author_id: 'demo-servant', member_id: studentId ?? '', body: demo.note, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_at: new Date(Date.now() - 86400000 * 5).toISOString() }] : []
  );
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [addNoteError, setAddNoteError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [prayer, setPrayer] = useState<{ topic: string; date: string; body?: string | null }[]>(
    demo.prayer.map(p => ({ topic: p, date: '' }))
  );
  const [psalmStats, setPsalmStats] = useState<{ streak: number; longestStreak: number; masteredItems: number } | null>(demoMode ? demo.psalm : null);

  const displayName = studentName ?? T.nameFallback;
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  // Photos: the student's own picture wins; otherwise this servant's roster
  // photo (member_photos, visible only to them).
  const [studentAvatarUrl, setStudentAvatarUrl] = useState<string | null>(null);
  const [myPhotoUrl, setMyPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');

  async function addStudentPhoto(source: PhotoSource) {
    if (!user || !studentId || photoBusy) return;
    setPhotoError('');
    setPhotoBusy(true);   // before the picker, so a double-tap can't open two
    try {
      const base64 = await pickPhoto(source);
      if (!base64) return;
      // Fresh random path per upload (see newFlockPhotoPath); drop the old object.
      const oldPath = myPhotoUrl ? pathFromAvatarUrl(myPhotoUrl) : null;
      const { url, error } = await uploadAvatarImage(newFlockPhotoPath(user.id, studentId), base64);
      if (!url) { setPhotoError(fmt(T.photo.uploadFailed, { error: String(error) })); return; }
      const { error: dbErr } = await db.upsertMemberPhoto(user.id, studentId, url);
      if (dbErr) { setPhotoError(fmt(T.photo.saveFailed, { error: String(dbErr) })); return; }
      if (oldPath) removeAvatarImage(oldPath);
      setMyPhotoUrl(url);
    } finally {
      setPhotoBusy(false);
    }
  }

  function removeStudentPhoto() {
    if (!user || !studentId || !myPhotoUrl) return;
    confirmDestructive(T.photo.removeTitle, T.photo.removeBody, S.common.remove, async () => {
      setPhotoBusy(true);
      const path = pathFromAvatarUrl(myPhotoUrl);
      const { error } = await db.deleteMemberPhoto(user.id, studentId);
      if (error) { setPhotoError(fmt(T.photo.removeFailed, { error: String(error) })); setPhotoBusy(false); return; }
      if (path) removeAvatarImage(path);
      setMyPhotoUrl(null);
      setPhotoBusy(false);
    });
  }

  useEffect(() => {
    if (demoMode) {
      const d = getDemoData(studentId ?? '');
      setStudentAvatarUrl(null);
      setMyPhotoUrl(null);
      setCanons(d.canons);
      setNotes(d.note ? [{ id: 'demo-note-1', author_id: 'demo-servant', member_id: studentId ?? '', body: d.note, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_at: new Date(Date.now() - 86400000 * 5).toISOString() }] : []);
      setPrayer(d.prayer.map(p => ({ topic: p, date: '' })));
      setPsalmStats(d.psalm);
      setNewNoteText('');
    } else if (studentId) {
      loadStudentData();
    }
  }, [studentId, demoMode]);

  async function loadStudentData() {
    if (!user || !studentId) return;
    setLoading(true);

    const [canonData, notesData, prayerData, psalmStatsPayload, students, photo] = await Promise.all([
      db.getStudentActiveCanons(studentId, user.id),
      db.getPastoralNotes(user.id, studentId),
      db.getServantSharedPrayer(studentId),
      db.getAgentProgress(studentId, 'psalm-stats'),
      db.getServantStudents(user.id),
      db.getMemberPhoto(user.id, studentId),
    ]);
    setPsalmStats(psalmStatsPayload ? {
      streak: psalmStatsPayload.streak ?? 0,
      longestStreak: psalmStatsPayload.longestStreak ?? 0,
      masteredItems: psalmStatsPayload.masteredItems ?? 0,
    } : null);

    setStudentAvatarUrl(students.find(s => s.id === studentId)?.avatar_url ?? null);
    setMyPhotoUrl(photo);

    if (canonData) {
      const enriched = await Promise.all(canonData.map(async c => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const count = await db.countCanonCompletionsSince(c.id, sevenDaysAgo);
        // English shows the stored date as it always has; Arabic shows it
        // with Arabic month names.
        return { id: c.id, component: describeAssigned(c.component, c.category, c.payload), frequency: c.frequency, startDate: isRTL ? startDateLabel(c.start_date) : c.start_date, completions: count, totalDays: 7 };
      }));
      setCanons(enriched);
    }
    setNotes(notesData);
    if (prayerData) {
      const senderPubKey = await db.getPublicKey(studentId);
      const decryptedPrayer = await Promise.all(prayerData.map(async (r: any) => ({
        topic: categoryLabel(r.category),
        date: fmtDate(new Date(r.created_at), { month: 'short', day: 'numeric', year: 'numeric' }),
        body: (r.body_servant && senderPubKey) ? await decryptFromSender(r.body_servant, senderPubKey) : null,
      })));
      setPrayer(decryptedPrayer);
    }

    setLoading(false);
  }

  async function handleDeactivateCanon(canonId: string) {
    if (demoMode) { setCanons(prev => prev.filter(c => c.id !== canonId)); return; }
    await db.deactivateCanon(canonId);
    setCanons(prev => prev.filter(c => c.id !== canonId));
  }

  async function handleAddNote() {
    if (!newNoteText.trim()) return;
    if (demoMode) {
      const n: db.PastoralNote = { id: `demo-${Date.now()}`, author_id: 'demo-servant', member_id: studentId ?? '', body: newNoteText.trim(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setNotes(prev => [n, ...prev]);
      setNewNoteText('');
      return;
    }
    setAddingNote(true);
    setAddNoteError('');
    const { data, error } = await db.insertPastoralNote(user!.id, studentId!, newNoteText.trim());
    setAddingNote(false);
    if (error || !data) { setAddNoteError(T.notes.saveFailed); return; }
    setNotes(prev => [data, ...prev]);
    setNewNoteText('');
  }

  function handleStartEdit(note: db.PastoralNote) {
    setEditingId(note.id);
    setEditText(note.body);
    setEditError('');
  }

  async function handleSaveEdit() {
    if (!editingId || !editText.trim()) return;
    if (demoMode) {
      setNotes(prev => prev.map(n => n.id === editingId ? { ...n, body: editText.trim(), updated_at: new Date().toISOString() } : n));
      setEditingId(null);
      return;
    }
    setSavingEdit(true);
    setEditError('');
    const { error } = await db.updatePastoralNote(editingId, editText.trim());
    setSavingEdit(false);
    if (error) { setEditError(T.notes.saveFailed); return; }
    setNotes(prev => prev.map(n => n.id === editingId ? { ...n, body: editText.trim(), updated_at: new Date().toISOString() } : n));
    setEditingId(null);
  }

  async function handleDeleteNote(noteId: string) {
    if (demoMode) { setNotes(prev => prev.filter(n => n.id !== noteId)); return; }
    setDeletingId(noteId);
    await db.deletePastoralNote(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
    setDeletingId(null);
  }

  const TABS: { value: TabType; label: string }[] = [
    { value: 'canons', label: T.tabs.canons },
    { value: 'psalms', label: T.tabs.psalms },
    { value: 'notes', label: T.tabs.notes },
    { value: 'prayer', label: T.tabs.prayer },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        <View style={styles.topRow}>
          <TouchableOpacity style={[styles.backRow, styles.backRowInBar]} onPress={() => router.push('/(servant)')}>
            <Text style={styles.backArrow}>{GLYPH.back}</Text>
            <Text style={styles.backText}>{T.back}</Text>
          </TouchableOpacity>
          <HeaderActions />
        </View>

        <View style={styles.heroCard}>
          <Avatar url={studentAvatarUrl ?? myPhotoUrl} initials={initials} size={52} style={styles.heroAvatar} textStyle={styles.heroAvatarText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroMeta}>{T.role}</Text>
          </View>
        </View>

        {/* ── Student photo (only when they haven't set their own) ── */}
        {!demoMode && !loading && !studentAvatarUrl && (
          <View style={styles.photoRow}>
            <Text style={styles.photoRowLabel}>
              {myPhotoUrl ? T.photo.yours : T.photo.none}
            </Text>
            <View style={styles.photoChipRow}>
              {cameraAvailable && (
                <TouchableOpacity style={styles.photoChip} onPress={() => addStudentPhoto('camera')} disabled={photoBusy}>
                  <Text style={styles.photoChipText}>{T.photo.camera}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.photoChip} onPress={() => addStudentPhoto('library')} disabled={photoBusy}>
                <Text style={styles.photoChipText}>{myPhotoUrl ? T.photo.change : T.photo.upload}</Text>
              </TouchableOpacity>
              {!!myPhotoUrl && (
                <TouchableOpacity style={styles.photoChip} onPress={removeStudentPhoto} disabled={photoBusy}>
                  <Text style={[styles.photoChipText, { color: colors.red }]}>{T.photo.remove}</Text>
                </TouchableOpacity>
              )}
              {photoBusy && <ActivityIndicator color={colors.gold} size="small" />}
            </View>
            {!!photoError && <Text style={styles.photoErrorText}>{photoError}</Text>}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map(t => (
            <TouchableOpacity key={t.value} style={[styles.tab, tab === t.value && styles.tabActive]} onPress={() => setTab(t.value)}>
              <Text style={[styles.tabText, tab === t.value && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ paddingTop: 20 }} />
        ) : (
          <>
            {/* ── Canons ── */}
            {tab === 'canons' && (
              <>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnGold} onPress={() => router.push({ pathname: '/(servant)/assign-canon', params: { studentId: studentId ?? '', studentName: displayName } })}>
                    <Text style={styles.btnGoldText}>{T.canons.assign}</Text>
                  </TouchableOpacity>
                </View>
                <Card title={fmt(T.canons.cardTitle, { n: canons.length })} titleIconNode={<CandleIcon size={16} color={colors.gold} />}>
                  {canons.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyTitle}>{T.canons.emptyTitle}</Text>
                      <Text style={styles.emptyBody}>{T.canons.emptyBody}</Text>
                    </View>
                  ) : (
                    canons.map((c, i) => {
                      const pct = Math.round((c.completions / c.totalDays) * 100);
                      return (
                        <View key={c.id} style={[styles.canonRow, i < canons.length - 1 && styles.canonBorder]}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.canonComponent}>{c.component}</Text>
                            <Text style={styles.canonMeta}>{fmt(T.canons.meta, { frequency: frequencyLabel(c.frequency), date: c.startDate })}</Text>
                            <View style={styles.progressRow}>
                              <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` as any }]} />
                              </View>
                              <Text style={[styles.progressPct, { color: pct < 50 ? colors.yellow : colors.green }]}>
                                {fmt(T.canons.thisWeek, { done: c.completions, total: c.totalDays })}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity style={styles.removeBtn} onPress={() => handleDeactivateCanon(c.id)}>
                            <Text style={styles.removeBtnText}>{S.common.remove}</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </Card>
              </>
            )}

            {/* ── Psalms ── */}
            {tab === 'psalms' && (
              <Card title={T.psalms.cardTitle} titleIconNode={<Harp size={16} color={colors.gold} />}>
                {!psalmStats ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>{T.psalms.emptyTitle}</Text>
                    <Text style={styles.emptyBody}>{fmt(T.psalms.emptyBody, { name: displayName.split(' ')[0] })}</Text>
                  </View>
                ) : (
                  <View style={styles.psalmStatsRow}>
                    <View style={styles.psalmStat}>
                      <Text style={styles.psalmStatValue}>🔥 {psalmStats.streak}</Text>
                      <Text style={styles.psalmStatLabel}>{plural(T.psalms.dayStreak, psalmStats.streak)}</Text>
                    </View>
                    <View style={styles.psalmStat}>
                      <Text style={styles.psalmStatValue}>{psalmStats.longestStreak}</Text>
                      <Text style={styles.psalmStatLabel}>{T.psalms.bestStreak}</Text>
                    </View>
                    <View style={styles.psalmStat}>
                      <Text style={styles.psalmStatValue}>{psalmStats.masteredItems}</Text>
                      <Text style={styles.psalmStatLabel}>{T.psalms.memorized}</Text>
                    </View>
                  </View>
                )}
              </Card>
            )}

            {/* ── My Notes ── */}
            {tab === 'notes' && (
              <Card title={T.notes.cardTitle} titleIconNode={<PencilIcon size={16} color={colors.gold} />}>
                <Text style={styles.privacyNote}>{T.notes.privacy}</Text>

                {notes.length === 0 && (
                  <Text style={styles.emptyTitle}>{T.notes.empty}</Text>
                )}

                {notes.map(note => (
                  <View key={note.id} style={styles.noteCard}>
                    <View style={styles.noteCardHeader}>
                      <Text style={styles.noteCardDate}>
                        {note.updated_at !== note.created_at
                          ? fmt(T.notes.dateEdited, { date: fmtDate(new Date(note.created_at), { month: 'short', day: 'numeric', year: 'numeric' }) })
                          : fmtDate(new Date(note.created_at), { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      {editingId !== note.id && (
                        <View style={styles.noteActions}>
                          <TouchableOpacity onPress={() => handleStartEdit(note)} style={styles.noteActionBtn}>
                            <Text style={styles.noteActionText}>{S.common.edit}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={styles.noteActionBtn} disabled={deletingId === note.id}>
                            <Text style={[styles.noteActionText, { color: colors.red }]}>{deletingId === note.id ? '…' : S.common.delete}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    {editingId === note.id ? (
                      <>
                        <TextInput style={styles.noteInput} value={editText} onChangeText={setEditText} multiline autoFocus placeholderTextColor={colors.faint} />
                        {editError ? <Text style={styles.noteError}>{editError}</Text> : null}
                        <View style={styles.editActions}>
                          <TouchableOpacity style={[styles.btnGold, { opacity: (!editText.trim() || savingEdit) ? 0.4 : 1 }]} onPress={handleSaveEdit} disabled={!editText.trim() || savingEdit}>
                            <Text style={styles.btnGoldText}>{savingEdit ? T.notes.saving : T.notes.save}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.btnCancel} onPress={() => setEditingId(null)}>
                            <Text style={styles.btnCancelText}>{T.notes.cancel}</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.noteCardBody}>{note.body}</Text>
                    )}
                  </View>
                ))}

                <View style={styles.addNoteSection}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder={T.notes.placeholder}
                    placeholderTextColor={colors.faint}
                    multiline
                    numberOfLines={4}
                    value={newNoteText}
                    onChangeText={setNewNoteText}
                  />
                  {addNoteError ? <Text style={styles.noteError}>{addNoteError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.btnGold, { alignSelf: 'flex-start', marginTop: 10, opacity: (!newNoteText.trim() || addingNote) ? 0.4 : 1 }]}
                    onPress={handleAddNote}
                    disabled={!newNoteText.trim() || addingNote}
                  >
                    <Text style={styles.btnGoldText}>{addingNote ? T.notes.saving : T.notes.add}</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            {/* ── Prayer Requests ── */}
            {tab === 'prayer' && (
              <Card title={T.prayer.cardTitle} titleIconNode={<PrayingHandsIcon size={16} color={colors.gold} />}>
                <Text style={styles.privacyNote}>{fmt(T.prayer.sharedNote, { name: displayName.split(' ')[0] })}</Text>
                {prayer.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>{T.prayer.emptyTitle}</Text>
                    <Text style={styles.emptyBody}>{fmt(T.prayer.emptyBody, { name: displayName.split(' ')[0] })}</Text>
                  </View>
                ) : (
                  prayer.map((req, i) => (
                    <View key={i} style={[styles.prayerRow, i < prayer.length - 1 && styles.prayerBorder]}>
                      <Text style={styles.prayerBullet}>◇</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prayerText}>{req.topic}</Text>
                        {req.body ? <Text style={styles.prayerBody}>{req.body}</Text> : null}
                        {req.date ? <Text style={styles.prayerDate}>{req.date}</Text> : null}
                      </View>
                    </View>
                  ))
                )}
              </Card>
            )}
          </>
        )}

        <View style={styles.scopeNote}>
          <Text style={styles.scopeNoteText}>
            {T.scopeNote}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  // The back link and the header actions share one bar.
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backRowInBar: { marginBottom: 0, flexShrink: 1 },
  backArrow: { fontFamily: fonts.cormorant, fontSize: 22, color: colors.gold },
  backText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted },

  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 16 },
  photoRow: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 16, marginTop: -4 },
  photoRowLabel: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 8 },
  photoChipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  photoChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  photoChipText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.gold },
  photoErrorText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.red, marginTop: 8 },
  heroAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#1e3a5f', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontFamily: fonts.cormorantMedium, fontSize: 20, color: colors.cream },
  heroName: { fontFamily: fonts.cormorantMedium, fontSize: 22, color: colors.cream, marginBottom: 2 },
  heroMeta: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },

  tabs: { flexDirection: 'row', backgroundColor: colors.panel, borderRadius: 10, padding: 4, marginBottom: 16, gap: 2 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: colors.navyMid, borderWidth: 1, borderColor: colors.border },
  tabText: { fontFamily: fonts.latoBold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted },
  tabTextActive: { color: colors.goldLight },

  actionRow: { marginBottom: 16 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' },
  btnGoldText: { fontFamily: fonts.latoBold, fontSize: 10, color: colors.navy, letterSpacing: 0.8 },

  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.muted },
  emptyBody: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 17, opacity: 0.7 },

  canonRow: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  canonBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  canonComponent: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 2 },
  canonMeta: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 4, backgroundColor: colors.creamDim, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 4 },
  progressPct: { fontFamily: fonts.latoBold, fontSize: 11, flexShrink: 0 },
  removeBtn: { borderWidth: 1, borderColor: 'rgba(192,57,43,0.3)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  removeBtnText: { fontFamily: fonts.latoBold, fontSize: 9, color: colors.red, letterSpacing: 0.5 },

  psalmStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  psalmStat: { alignItems: 'center' },
  psalmStatValue: { fontFamily: fonts.cormorantMedium, fontSize: 20, color: colors.goldLight },
  psalmStatLabel: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },

  privacyNote: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 12, opacity: 0.7 },
  noteCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 10 },
  noteCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  noteCardDate: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 1, color: colors.gold, opacity: 0.8 },
  noteCardBody: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, lineHeight: 20 },
  noteActions: { flexDirection: 'row', gap: 12 },
  noteActionBtn: { paddingVertical: 2 },
  noteActionText: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 0.8, color: colors.gold },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btnCancel: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  btnCancelText: { fontFamily: fonts.latoBold, fontSize: 10, color: colors.muted, letterSpacing: 0.8 },
  addNoteSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  noteInput: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 13, padding: 12, textAlignVertical: 'top', minHeight: 90 },
  noteError: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.red, marginTop: 6 },

  prayerRow: { flexDirection: 'row', gap: 10, paddingVertical: 12, alignItems: 'flex-start' },
  prayerBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  prayerBullet: { fontFamily: fonts.lato, fontSize: 11, color: colors.gold, marginTop: 2 },
  prayerText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.cream, lineHeight: 19 },
  prayerBody: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 3, marginBottom: 2 },
  prayerDate: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, marginTop: 2 },

  scopeNote: { backgroundColor: 'rgba(201,168,76,0.05)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', borderRadius: 10, padding: 14, marginTop: 8 },
  scopeNoteText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 17, letterSpacing: 0.2 },
}));
