import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import {
  CrossIcon, SpeechIcon, ThoughtIcon, HouseIcon, PhoneIcon, CongregationIcon,
  PersonIcon, ClipboardIcon, CalendarIcon, NotepadIcon, PencilIcon,
} from '@/components/ui/TabIcons';
import { useSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { parseLocalDate } from '@/lib/confession/dates';
import { useDemoMode } from '@/lib/demo';
import { S, fmt, fmtDate, GLYPH } from '@/lib/i18n';

const T = S.priest.encounter;
const SHARED = S.priest.shared;
const DEMO_NAMES = S.priest.demo.names;

type EncounterType = 'confession' | 'counseling' | 'advice' | 'visit' | 'phone' | 'group';

type IconComp = React.ComponentType<{ size?: number; color?: string }>;

const ENCOUNTER_TYPES: { value: EncounterType; label: string; desc: string; Icon: IconComp }[] = [
  { value: 'confession', label: T.types.confession.label, desc: T.types.confession.desc, Icon: CrossIcon },
  { value: 'counseling', label: T.types.counseling.label, desc: T.types.counseling.desc, Icon: SpeechIcon },
  { value: 'advice',     label: T.types.advice.label,     desc: T.types.advice.desc,     Icon: ThoughtIcon },
  { value: 'visit',      label: T.types.visit.label,      desc: T.types.visit.desc,      Icon: HouseIcon },
  { value: 'phone',      label: T.types.phone.label,      desc: T.types.phone.desc,      Icon: PhoneIcon },
  { value: 'group',      label: T.types.group.label,      desc: T.types.group.desc,      Icon: CongregationIcon },
];

const DEMO_MEMBERS = [
  { id: 'demo-pb', name: DEMO_NAMES.pb },
  { id: 'demo-mh', name: DEMO_NAMES.mh },
  { id: 'demo-sg', name: DEMO_NAMES.sg },
  { id: 'demo-mm', name: DEMO_NAMES.mm },
  { id: 'demo-ag', name: DEMO_NAMES.ag },
  { id: 'demo-cn', name: DEMO_NAMES.cn },
];

export default function LogEncounterScreen() {
  const router = useRouter();
  const { memberId: preselectedId, memberName: preselectedName } = useLocalSearchParams<{ memberId: string; memberName: string }>();
  const { user } = useSession();
  const { demoMode } = useDemoMode();

  const [encounterType, setEncounterType] = useState<EncounterType>('confession');
  const [encounterDate, setEncounterDate] = useState(today());
  const [selectedMemberId, setSelectedMemberId] = useState(preselectedId ?? (demoMode ? 'demo-pb' : ''));
  const [memberSearch, setMemberSearch] = useState(preselectedName ?? (demoMode ? DEMO_NAMES.pb : ''));
  const [showMemberList, setShowMemberList] = useState(false);
  const [memberNote, setMemberNote] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpError, setFollowUpError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dateError, setDateError] = useState('');
  const [saveError, setSaveError] = useState('');

  // Member list (real mode: loaded from Supabase)
  const [memberList, setMemberList] = useState<{ id: string; name: string }[]>(demoMode ? DEMO_MEMBERS : []);

  useEffect(() => {
    if (!demoMode) loadMembers();
  }, [user]);

  async function loadMembers() {
    if (!user) return;
    const data = await db.getFlock(user.id, { ordered: true });
    if (data) {
      const list = data.map(p => ({ id: p.id, name: p.full_name ?? SHARED.unknownMember }));
      setMemberList(list);
      // If preselected member not already set, don't change
      if (!preselectedId && list.length > 0) {
        setSelectedMemberId(list[0].id);
        setMemberSearch(list[0].name);
      }
    }
  }

  const filteredMembers = memberList.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  async function handleSave() {
    if (saving) return;
    if (!selectedMemberId) {
      setSaveError(T.errSelectMember);
      return;
    }
    if (demoMode) {
      setSaveError(T.errDemo);
      return;
    }
    // parseLocalDate (not `new Date(str)`) because Hermes — React Native's JS
    // engine — cannot parse "Jul 21, 2026" and returns Invalid Date, which was
    // silently blocking every save on device (it only "worked" in a browser).
    const parsedDate = parseLocalDate(encounterDate);
    if (!parsedDate) {
      setDateError(T.errDate);
      return;
    }
    setDateError('');
    // follow_up_date is a DATE column — a free-text reminder (e.g. "after the
    // Feast") makes the whole insert fail silently. Parse it: a bare date is
    // sent as YYYY-MM-DD; anything unparseable is rejected with a clear error
    // instead of losing the encounter.
    let followUp: string | null = null;
    const fuRaw = followUpDate.trim();
    if (fuRaw) {
      const fd = parseLocalDate(fuRaw);
      if (!fd) {
        setFollowUpError(T.errFollowUp);
        return;
      }
      const p = (n: number) => String(n).padStart(2, '0');
      followUp = `${fd.getFullYear()}-${p(fd.getMonth() + 1)}-${p(fd.getDate())}`;
    }
    setFollowUpError('');
    setSaveError('');
    setSaving(true);
    const { error } = await db.insertEncounter({
      priest_id: user!.id,
      congregant_id: selectedMemberId,
      encounter_type: encounterType,
      encountered_at: parsedDate.toISOString(),
      member_note: memberNote.trim() || null,
      private_note: privateNote.trim() || null,
      outcomes: null,
      follow_up_date: followUp,
    });
    setSaving(false);
    if (error) {
      // Surface the real reason (RLS denial, bad date, etc.) instead of a
      // generic message that hides what actually failed.
      setSaveError(fmt(T.errSave, { error }));
      return;
    }
    // No profile mirror here: RLS lets a user update only their OWN profiles
    // row, so a priest-side setLastConfession was a silent 0-row no-op. The
    // FOC dashboards read confession encounters directly instead.
    setSaved(true);
    setTimeout(() => router.push('/(priest)'), 1300);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        <View style={styles.topRow}>
          <TouchableOpacity style={[styles.backRow, styles.backRowInBar]} onPress={() => router.back()}>
            <Text style={styles.backArrow}>{GLYPH.back}</Text>
            <Text style={styles.backText}>{SHARED.myFlock}</Text>
          </TouchableOpacity>
          <HeaderActions />
        </View>

        <Text style={styles.pageTitle}>{T.title}</Text>
        <Text style={styles.pageSub}>{fmtDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>

        {/* Member */}
        <Card title={T.memberCard} titleIconNode={<PersonIcon size={16} color={colors.gold} />}>
          <TextInput
            style={styles.textInput}
            value={memberSearch}
            onChangeText={t => { setMemberSearch(t); setShowMemberList(true); setSelectedMemberId(''); }}
            onFocus={() => setShowMemberList(true)}
            placeholder={T.memberSearchPlaceholder}
            placeholderTextColor={colors.faint}
          />
          {showMemberList && filteredMembers.length > 0 && (
            <View style={styles.memberDropdown}>
              {filteredMembers.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.memberOption}
                  onPress={() => { setSelectedMemberId(m.id); setMemberSearch(m.name); setShowMemberList(false); }}
                >
                  <Text style={[styles.memberOptionText, selectedMemberId === m.id && styles.memberOptionTextActive]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Encounter type */}
        <Card title={T.typeCard} titleIconNode={<ClipboardIcon size={16} color={colors.gold} />}>
          {ENCOUNTER_TYPES.map(opt => {
            const active = encounterType === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.typeRow, active && styles.typeRowActive]}
                onPress={() => setEncounterType(opt.value)}
              >
                <View style={[styles.typeRadio, active && styles.typeRadioActive]} />
                <View style={styles.typeIcon}>
                  <opt.Icon size={20} color={active ? colors.goldLight : colors.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{opt.label}</Text>
                  <Text style={styles.typeDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Date */}
        <Card title={T.dateCard} titleIconNode={<CalendarIcon size={16} color={colors.gold} />}>
          <TextInput
            style={styles.textInput}
            value={encounterDate}
            onChangeText={t => { setEncounterDate(t); setDateError(''); }}
            placeholder={T.datePlaceholder}
            placeholderTextColor={colors.faint}
          />
          {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
        </Card>

        {/* Member-visible note */}
        <Card title={T.memberNoteCard} titleIconNode={<NotepadIcon size={16} color={colors.gold} />}>
          <TextInput
            style={[styles.textInput, { minHeight: 90, textAlignVertical: 'top' }]}
            placeholder={T.memberNotePlaceholder}
            placeholderTextColor={colors.faint}
            multiline
            value={memberNote}
            onChangeText={setMemberNote}
          />
          <Text style={styles.fieldHint}>{T.memberNoteHint}</Text>
        </Card>

        {/* Private FOC note */}
        <Card title={T.privateNoteCard} titleIconNode={<PencilIcon size={16} color={colors.gold} />}>
          <View style={styles.privacyNote}>
            <Text style={styles.privacyNoteText}>{T.privateNoteBanner}</Text>
          </View>
          <TextInput
            style={[styles.textInput, { minHeight: 90, textAlignVertical: 'top' }]}
            placeholder={T.privateNotePlaceholder}
            placeholderTextColor={colors.faint}
            multiline
            value={privateNote}
            onChangeText={setPrivateNote}
          />
        </Card>

        {/* Follow-up */}
        <Card title={T.followUpCard} titleIconNode={<CalendarIcon size={16} color={colors.gold} />}>
          <TextInput
            style={styles.textInput}
            placeholder={T.followUpPlaceholder}
            placeholderTextColor={colors.faint}
            value={followUpDate}
            onChangeText={(t) => { setFollowUpDate(t); if (followUpError) setFollowUpError(''); }}
          />
          {followUpError ? <Text style={styles.errorText}>{followUpError}</Text> : null}
          <Text style={styles.fieldHint}>{T.followUpHint}</Text>
        </Card>

        {/* Confession-specific notice */}
        {encounterType === 'confession' && (
          <View style={styles.confessionNotice}>
            <Text style={styles.confessionNoticeTitle}>{T.sealTitle}</Text>
            <Text style={styles.confessionNoticeBody}>
              {T.sealBody}
            </Text>
          </View>
        )}

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        <TouchableOpacity
          style={[styles.saveBtn, (!selectedMemberId || saving) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!selectedMemberId || saving}
        >
          {saving
            ? <ActivityIndicator color={colors.navy} />
            : <Text style={styles.saveBtnText}>{saved ? T.saved : T.save}</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// The date field is typed into and parsed (parseLocalDate), so what it opens
// with has to be something the parser reads back, whatever the language.
function today(): string {
  const now = new Date();
  const shown = fmtDate(now, { month: 'short', day: 'numeric', year: 'numeric' });
  if (parseLocalDate(shown)) return shown;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}


const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  // The back link and the header actions share one bar.
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backRowInBar: { marginBottom: 0, flexShrink: 1 },
  backArrow: { fontFamily: fonts.cormorant, fontSize: 22, color: colors.gold },
  backText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted },
  pageTitle: { fontFamily: fonts.cormorantMedium, fontSize: 26, color: colors.cream, marginBottom: 4 },
  pageSub: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 20 },

  textInput: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 13, padding: 12 },
  fieldHint: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, marginTop: 6, lineHeight: 15 },
  errorText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.red, marginTop: 6 },

  memberDropdown: { backgroundColor: colors.navyDark, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginTop: 4, overflow: 'hidden' },
  memberOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  memberOptionText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted },
  memberOptionTextActive: { color: colors.goldLight, fontFamily: fonts.latoBold },

  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 8 },
  typeRowActive: { backgroundColor: colors.goldDim },
  typeRadio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  typeIcon: { width: 24, alignItems: 'center', justifyContent: 'center' },
  typeRadioActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  typeLabel: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.muted, marginBottom: 1 },
  typeLabelActive: { color: colors.cream },
  typeDesc: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted },

  privacyNote: { backgroundColor: 'rgba(201,168,76,0.07)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10 },
  privacyNoteText: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, letterSpacing: 0.3 },

  outcomesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  outcomePill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  outcomePillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  outcomePillText: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted },
  outcomePillTextActive: { color: colors.goldLight },

  confessionNotice: { backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 },
  confessionNoticeTitle: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.gold, marginBottom: 6 },
  confessionNoticeBody: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 18 },

  saveBtn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.35 },
  saveBtnText: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.navy, letterSpacing: 1 },
}));
