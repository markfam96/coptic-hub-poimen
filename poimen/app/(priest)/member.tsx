import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { CandleIcon } from '@/components/ui/TabIcons';
import Harp from '@/components/ui/Harp';
import { useSession } from '@/lib/auth';
import { confirmDestructive } from '@/lib/confirm';
import { pickPhoto, uploadAvatarImage, removeAvatarImage, newFlockPhotoPath, pathFromAvatarUrl, cameraAvailable, PhotoSource } from '@/lib/avatar';
import { latestConfessionMs, daysSinceMs } from '@/lib/confession/dates';
import * as db from '@/lib/db';
import { useDemoMode } from '@/lib/demo';
import { decryptFromSender } from '@/lib/crypto';
import { VITAL_CATEGORIES } from '@/lib/canon/history';
import { RuleConfig, WEEKDAY_SHORT, AGPEYA_HOURS, SERVICES, freqLabel, fastUntilLabel } from '@/lib/canon/rule-store';
import { loadMemberRule } from '@/lib/canon/rule-sync';
import { AssignedCategory, applyOverlay, loadAssignedForPriest } from '@/lib/canon/assigned';
import { openContactForFoc, openChildrenForFoc } from '@/lib/pastoral-secure';
import { S, fmt, plural, fmtDate, GLYPH, isRTL } from '@/lib/i18n';
import { describeAssigned } from '@/lib/canon/describe';

// A stored YYYY-MM-DD shown with Arabic month names; English keeps the stored
// text exactly as it always showed it.
const arabicStartDate = (v: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v ?? '');
  return m ? fmtDate(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12), { month: 'short', day: 'numeric', year: 'numeric' }) : v;
};

const T = S.priest.member;
const R = T.rule;
const D = S.priest.demo;
const SHARED = S.priest.shared;

// A canon's frequency, a prayer request's category, a life stage and an
// encounter type are stored values: these give the words shown for them, and
// anything else (a frequency typed by hand, say) is shown as stored.
const frequencyLabel = (v: string) => (S.canonEditor.servant.freq as Record<string, string>)[v] ?? freqLabel(v);
const prayerCategoryLabel = (v: string) => (T.prayerCategories as Record<string, string>)[v] ?? v;
const capitalized = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
const lifeStageLabel = (v: string) => (T.lifeStages as Record<string, string>)[v] ?? capitalized(v);
const encounterTypeLabel = (v: string) => (T.encounterTypes as Record<string, string>)[v] ?? capitalized(v);

// A phone number, email or street address written in Latin letters keeps its
// own left-to-right order inside the Arabic layout ("(614) 555-0214" would
// otherwise read backwards). One written in Arabic is left as it is.
const ltrRun = (v: string) => (isRTL && !/[\u0600-\u06FF]/.test(v) ? `\u2066${v}\u2069` : v);

const DAY_FORMAT = { month: 'short', day: 'numeric', year: 'numeric' } as const;
const demoDate = (y: number, m: number, d: number) => fmtDate(new Date(y, m, d), DAY_FORMAT);
const demoDay = (y: number, m: number, d: number) => demoDate(y, m, d).toUpperCase();
const demoMonth = (y: number, m: number) => fmtDate(new Date(y, m, 1), { month: 'long', year: 'numeric' });

// Local YYYY-MM-DD of a timestamp — the lock model compares calendar days.
function localDayOf(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Compact FOC-facing summary of a member's self-set rule. Long option names
// collapse to their short form ("First Hour (Prime)" → "Prime").
function ruleSummaryLines(r: RuleConfig): { category: AssignedCategory; label: string; value: string }[] {
  const dayName = (i: number) => WEEKDAY_SHORT[i];
  const shortName = (full: string) => {
    const m = full.match(/\(([^)]+)\)/);
    return m ? m[1] : full;
  };
  const hourName = (k: string) => shortName(AGPEYA_HOURS.find(h => h.key === k)?.name ?? k);
  const svcName = (k: string) => (SERVICES.find(s => s.key === k)?.name ?? k).split(' (')[0];
  const dayLine = (i: number, items: string[]) => fmt(R.dayLine, { day: dayName(i), items: items.join(SHARED.listSeparator) });
  const servicePer = R.servicePer as Record<string, string>;

  const lines: { category: AssignedCategory; label: string; value: string }[] = [
    { category: 'prostrations', label: R.prostrations, value: r.prostrations > 0 ? plural(R.prostrationsDaily, r.prostrations) : S.common.none },
    { category: 'quiet', label: R.quiet, value: plural(R.quietDaily, r.quietMinutes) },
    { category: 'fasting', label: R.fasting, value: fmt(R.fastUntil, { time: fastUntilLabel(r.fastUntil) }) },
    { category: 'bible', label: R.bible, value: plural(r.bible.mode === 'minutes' ? R.bibleMinutes : R.bibleChapters, r.bible.amount) },
  ];
  if (r.book) lines.push({ category: 'book', label: R.book, value: plural(r.book.mode === 'minutes' ? R.bookMinutes : R.bookChapters, r.book.amount, { title: r.book.title || R.bookUntitled }) });
  lines.push({ category: 'confession', label: R.confession, value: freqLabel(r.confession) });

  const agpeya = r.days
    .map((d, i) => (d.hours.length ? dayLine(i, d.hours.map(hourName)) : null))
    .filter(Boolean) as string[];
  if (agpeya.length) lines.push({ category: 'agpeya_hours', label: R.agpeyaHours, value: agpeya.join('\n') });

  // Services are committed either by weekday or by times-per-period, never both.
  if (r.servicesMode === 'counts') {
    const counts = SERVICES
      .filter(sv => (r.serviceCounts?.[sv.key]?.n ?? 0) > 0)
      .map(sv => fmt(servicePer[r.serviceCounts[sv.key].freq] ?? R.servicePer.Weekly, { service: svcName(sv.key), n: r.serviceCounts[sv.key].n }));
    if (counts.length) lines.push({ category: 'services', label: R.services, value: counts.join('\n') });
  } else {
    const services = r.days
      .map((d, i) => (d.services.length ? dayLine(i, d.services.map(svcName)) : null))
      .filter(Boolean) as string[];
    if (services.length) lines.push({ category: 'services', label: R.services, value: services.join('\n') });
  }

  const serving = r.days
    .map((d, i) => (d.serving.length ? dayLine(i, d.serving.map(s => fmt(R.serving, { text: s.text, freq: freqLabel(s.freq) }))) : null))
    .filter(Boolean) as string[];
  if (serving.length) lines.push({ category: 'heart_of_service', label: R.heartOfService, value: serving.join('\n') });

  return lines;
}

// ── Demo data ─────────────────────────────────────────────────
const DEMO_DB: Record<string, {
  member: any; contact: any; life: any; children: any[];
  vitals: Record<string, number | null>; confessions: any[]; prayer: any[]; canons: any[]; note: string;
  psalm: { streak: number; longestStreak: number; masteredItems: number } | null;
}> = {
  'demo-mh': {
    member: { key: 'mh', initials: D.initials.mh, name: D.names.mh, stage: D.stages.growing, joined: demoMonth(2024, 8), daysSince: 47, flagged: false, flagNote: '' },
    contact: { phone: '(614) 555-0214', email: 'mhanna@example.com', address_line1: '1190 Oak Hill Rd', address_line2: null, city: 'Columbus', state: 'OH', zip: '43235', country: 'US' },
    life: { life_stage: 'married', spouse_name: D.spouses.mh },
    children: [{ id: 'dc1', name: D.children.mh[0], birth_year: 2024 }],
    vitals: { prayer: 75, quiet: 55, scripture: 50, book: null, liturgy: 80, communion: 65, fasting: 60, service: 25, confession: null },
    confessions: [{ date: demoDay(2026, 3, 20), type: T.holyConfession, note: D.confessionNotes.mh[0] }, { date: demoDay(2026, 1, 5), type: T.holyConfession, note: D.confessionNotes.mh[1] }],
    prayer: [{ date: demoDay(2026, 4, 4), topic: D.prayerTopics.mh[0] }, { date: demoDay(2026, 2, 10), topic: D.prayerTopics.mh[1] }],
    canons: [{ id: 'c1', component: D.canons.morningAgpeya, frequency: 'Daily', startDate: demoDate(2026, 3, 21), completions: 5, totalDays: 7 }, { id: 'c2', component: D.canons.psalmReading, frequency: 'Daily', startDate: demoDate(2026, 3, 21), completions: 4, totalDays: 7 }],
    note: D.notes.mh,
    psalm: { streak: 6, longestStreak: 14, masteredItems: 3 },
  },
  'demo-sg': {
    member: { key: 'sg', initials: D.initials.sg, name: D.names.sg, stage: D.stages.mature, joined: demoMonth(2021, 2), daysSince: 18, flagged: false, flagNote: '' },
    contact: { phone: '(614) 555-0339', email: 'sgirgis@example.com', address_line1: '408 Granville St', address_line2: null, city: 'Columbus', state: 'OH', zip: '43215', country: 'US' },
    life: { life_stage: 'single', spouse_name: '' },
    children: [],
    vitals: { prayer: 90, quiet: 85, scripture: 85, book: 70, liturgy: 100, communion: 85, fasting: 88, service: 100, confession: null },
    confessions: [{ date: demoDay(2026, 4, 21), type: T.holyConfession, note: D.confessionNotes.sg[0] }, { date: demoDay(2026, 2, 3), type: T.holyConfession, note: D.confessionNotes.sg[1] }, { date: demoDay(2026, 0, 8), type: T.holyConfession, note: D.confessionNotes.sg[2] }],
    prayer: [{ date: demoDay(2026, 4, 20), topic: D.prayerTopics.sg[0] }],
    canons: [{ id: 'c1', component: D.canons.completeAgpeya, frequency: 'Daily', startDate: demoDate(2026, 0, 9), completions: 6, totalDays: 7 }, { id: 'c2', component: D.canons.bibleTwo, frequency: 'Daily', startDate: demoDate(2026, 0, 9), completions: 6, totalDays: 7 }],
    note: D.notes.sg,
    psalm: { streak: 41, longestStreak: 41, masteredItems: 11 },
  },
  'demo-pb': {
    member: { key: 'pb', initials: D.initials.pb, name: D.names.pb, stage: D.stages.new, joined: demoMonth(2026, 1), daysSince: 74, flagged: true, flagNote: D.flagNotes.pb },
    contact: { phone: '(614) 555-0182', email: 'pbotros@example.com', address_line1: '2847 Riverside Dr', address_line2: null, city: 'Columbus', state: 'OH', zip: '43221', country: 'US' },
    life: { life_stage: 'married', spouse_name: D.spouses.pb },
    children: [{ id: 'dc1', name: D.children.pb[0], birth_year: 2018 }, { id: 'dc2', name: D.children.pb[1], birth_year: 2021 }],
    vitals: { prayer: 20, quiet: 10, scripture: 30, book: null, liturgy: 45, communion: 30, fasting: 20, service: 0, confession: null },
    confessions: [{ date: demoDay(2026, 1, 25), type: T.holyConfession, note: D.confessionNotes.pb[0] }, { date: demoDay(2026, 1, 11), type: D.introMeeting, note: D.confessionNotes.pb[1] }],
    prayer: [{ date: demoDay(2026, 4, 28), topic: D.prayerTopics.pb[0] }, { date: demoDay(2026, 4, 5), topic: D.prayerTopics.pb[1] }],
    canons: [{ id: 'c1', component: D.canons.morningAgpeya, frequency: 'Daily', startDate: demoDate(2026, 2, 1), completions: 1, totalDays: 7 }, { id: 'c2', component: D.canons.gospelOne, frequency: 'Daily', startDate: demoDate(2026, 2, 1), completions: 2, totalDays: 7 }],
    note: D.notes.pb,
    psalm: null,
  },
  'demo-mm': {
    member: { key: 'mm', initials: D.initials.mm, name: D.names.mm, stage: D.stages.growing, joined: demoMonth(2023, 5), daysSince: 29, flagged: false, flagNote: '' },
    contact: { phone: '(614) 555-0471', email: 'mmkhail@example.com', address_line1: '93 Olentangy Blvd', address_line2: 'Apt 4B', city: 'Columbus', state: 'OH', zip: '43202', country: 'US' },
    life: { life_stage: 'married', spouse_name: D.spouses.mm },
    children: [{ id: 'dc1', name: D.children.mm[0], birth_year: 2020 }, { id: 'dc2', name: D.children.mm[1], birth_year: 2023 }],
    vitals: { prayer: 65, quiet: 50, scripture: 60, book: null, liturgy: 75, communion: 60, fasting: 58, service: 50, confession: null },
    confessions: [{ date: demoDay(2026, 4, 10), type: T.holyConfession, note: D.confessionNotes.mm[0] }, { date: demoDay(2026, 1, 28), type: T.holyConfession, note: D.confessionNotes.mm[1] }],
    prayer: [{ date: demoDay(2026, 3, 30), topic: D.prayerTopics.mm[0] }, { date: demoDay(2026, 2, 15), topic: D.prayerTopics.mm[1] }],
    canons: [{ id: 'c1', component: D.canons.eveningPrayer, frequency: 'Daily', startDate: demoDate(2026, 2, 1), completions: 5, totalDays: 7 }, { id: 'c2', component: D.canons.bibleOne, frequency: 'Daily', startDate: demoDate(2026, 2, 1), completions: 4, totalDays: 7 }],
    note: D.notes.mm,
    psalm: { streak: 2, longestStreak: 9, masteredItems: 1 },
  },
  'demo-ag': {
    member: { key: 'ag', initials: D.initials.ag, name: D.names.ag, stage: D.stages.seeking, joined: demoMonth(2026, 0), daysSince: 92, flagged: true, flagNote: D.flagNotes.ag },
    contact: { phone: '(614) 555-0598', email: 'ageorge@example.com', address_line1: '5120 Kenny Rd', address_line2: null, city: 'Columbus', state: 'OH', zip: '43220', country: 'US' },
    life: { life_stage: 'single', spouse_name: '' },
    children: [],
    vitals: { prayer: null, quiet: null, scripture: null, book: null, liturgy: 25, communion: 10, fasting: null, service: null, confession: null },
    confessions: [],
    prayer: [{ date: demoDay(2026, 4, 1), topic: D.prayerTopics.ag[0] }],
    canons: [],
    note: D.notes.ag,
    psalm: null,
  },
  'demo-cn': {
    member: { key: 'cn', initials: D.initials.cn, name: D.names.cn, stage: D.stages.multiplying, joined: demoMonth(2019, 3), daysSince: 35, flagged: false, flagNote: '' },
    contact: { phone: '(614) 555-0623', email: 'cnaguib@example.com', address_line1: '711 Worthington Ave', address_line2: null, city: 'Columbus', state: 'OH', zip: '43085', country: 'US' },
    life: { life_stage: 'married', spouse_name: D.spouses.cn },
    children: [{ id: 'dc1', name: D.children.cn[0], birth_year: 2017 }, { id: 'dc2', name: D.children.cn[1], birth_year: 2019 }, { id: 'dc3', name: D.children.cn[2], birth_year: 2022 }],
    vitals: { prayer: 95, quiet: 90, scripture: 90, book: 85, liturgy: 100, communion: 85, fasting: 92, service: 100, confession: null },
    confessions: [{ date: demoDay(2026, 4, 5), type: T.holyConfession, note: D.confessionNotes.cn[0] }, { date: demoDay(2026, 1, 20), type: T.holyConfession, note: D.confessionNotes.cn[1] }, { date: demoDay(2025, 10, 10), type: T.holyConfession, note: D.confessionNotes.cn[2] }],
    prayer: [{ date: demoDay(2026, 3, 25), topic: D.prayerTopics.cn[0] }],
    canons: [{ id: 'c1', component: D.canons.midnightPraise, frequency: 'Weekly', startDate: demoDate(2026, 0, 1), completions: 6, totalDays: 7 }, { id: 'c2', component: D.canons.bibleThree, frequency: 'Daily', startDate: demoDate(2026, 0, 1), completions: 6, totalDays: 7 }],
    note: D.notes.cn,
    psalm: { streak: 87, longestStreak: 112, masteredItems: 22 },
  },
};

function getDemoData(id: string) {
  return DEMO_DB[id] ?? DEMO_DB['demo-pb'];
}

// Render the member's vital categories from a stored payload (the same
// map the member mirrors to agent_progress['vitals']). A key that's absent is
// "not shared"; a key present but null had nothing ever due, so it reads "—".
function vitalsFromPayload(payload: Record<string, number | null> | null | undefined) {
  const v = payload ?? {};
  return VITAL_CATEGORIES.map(c => ({
    key: c.key,
    label: c.label,
    pct: c.key in v ? v[c.key] : null,
    shared: c.key in v,
  }));
}

type TabType = 'overview' | 'canon' | 'prayer' | 'notes';
const TABS: { value: TabType; label: string }[] = [
  { value: 'overview', label: T.tabs.overview },
  { value: 'canon', label: T.tabs.canon },
  { value: 'prayer', label: T.tabs.prayer },
  { value: 'notes', label: T.tabs.notes },
];

// ── Helpers ───────────────────────────────────────────────────
function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.split(' ');
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function formatLifeStageLine(ls: any, kids: any[]): string | null {
  if (!ls?.life_stage) return null;
  const stage = lifeStageLabel(ls.life_stage);
  const yr = new Date().getFullYear();
  const parts: string[] = [stage];
  if (kids.length > 0) {
    // birth_year can be absent now that it lives inside the sealed payload —
    // an unopened row would otherwise read as "~2026" rather than admitting
    // the age is unknown.
    const ages = kids
      .map((k: any) => (typeof k.birth_year === 'number' ? fmt(T.childAge, { age: yr - k.birth_year }) : null))
      .filter(Boolean)
      .join(SHARED.listSeparator);
    parts.push(ages ? plural(T.childrenWithAges, kids.length, { ages }) : plural(T.children, kids.length));
  }
  return parts.join(SHARED.dot);
}

export default function MemberScreen() {
  const router = useRouter();
  const { id: memberId, name: memberName } = useLocalSearchParams<{ id: string; name: string }>();
  const { user } = useSession();
  const { demoMode } = useDemoMode();
  const [tab, setTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(!demoMode);

  const demo = getDemoData(memberId ?? '');

  // Display data
  const [memberInfo, setMemberInfo] = useState<any>(demo.member);
  const [contact, setContact] = useState<any>(demoMode ? demo.contact : null);
  const [lifeStageData, setLifeStageData] = useState<any>(demoMode ? demo.life : null);
  const [memberChildren, setMemberChildren] = useState<any[]>(demoMode ? demo.children : []);
  const [vitals, setVitals] = useState<any[]>(vitalsFromPayload(demo.vitals));
  const [psalmStats, setPsalmStats] = useState<{ streak: number; longestStreak: number; masteredItems: number } | null>(demoMode ? demo.psalm : null);
  const [confessions, setConfessions] = useState<any[]>(demo.confessions);
  const [prayerRequests, setPrayerRequests] = useState<any[]>(demo.prayer);
  const [canons, setCanons] = useState<any[]>(demo.canons);

  // Notes state
  const [notes, setNotes] = useState<db.PastoralNote[]>(
    demo.note ? [{ id: 'demo-note-1', author_id: 'demo-priest', member_id: memberId ?? '', body: demo.note, created_at: new Date(Date.now() - 86400000 * 10).toISOString(), updated_at: new Date(Date.now() - 86400000 * 10).toISOString() }] : []
  );
  // Private notes written in Log Encounter. Shown in the same list as the
  // notes above, but read-only: they belong to their encounter.
  const [encounterNotes, setEncounterNotes] = useState<db.EncounterPrivateNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [addNoteError, setAddNoteError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [noteError, setNoteError] = useState('');

  // Contact sheet
  const [showContactSheet, setShowContactSheet] = useState(false);

  // The member's EFFECTIVE canon: their self-set rule with this priest's
  // still-locked assignments overlaid — what the member's Canon tab shows.
  const [memberRule, setMemberRule] = useState<RuleConfig | null>(null);
  const [assignedCats, setAssignedCats] = useState<Set<AssignedCategory>>(new Set());
  const [customCount, setCustomCount] = useState(0);
  const [lastVisit, setLastVisit] = useState<string | null>(demoMode ? '2026-05-04' : null);
  const [visitRequested, setVisitRequested] = useState(false);

  // Photos: the member's own picture (profiles.avatar_url) wins; otherwise
  // this priest's roster photo (member_photos, visible only to him).
  const [memberAvatarUrl, setMemberAvatarUrl] = useState<string | null>(null);
  const [myPhotoUrl, setMyPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');

  async function addMemberPhoto(source: PhotoSource) {
    if (!user || !memberId || photoBusy) return;
    setPhotoError('');
    setPhotoBusy(true);   // before the picker, so a double-tap can't open two
    try {
      const base64 = await pickPhoto(source);
      if (!base64) return;
      // Fresh random path per upload (see newFlockPhotoPath); drop the old object.
      const oldPath = myPhotoUrl ? pathFromAvatarUrl(myPhotoUrl) : null;
      const { url, error } = await uploadAvatarImage(newFlockPhotoPath(user.id, memberId), base64);
      if (!url) { setPhotoError(fmt(T.errUpload, { error: String(error) })); return; }
      const { error: dbErr } = await db.upsertMemberPhoto(user.id, memberId, url);
      if (dbErr) { setPhotoError(fmt(T.errSave, { error: dbErr })); return; }
      if (oldPath) removeAvatarImage(oldPath);
      setMyPhotoUrl(url);
    } finally {
      setPhotoBusy(false);
    }
  }

  function removeMemberPhoto() {
    if (!user || !memberId || !myPhotoUrl) return;
    confirmDestructive(T.photoRemoveTitle, T.photoRemoveBody, S.common.remove, async () => {
      setPhotoBusy(true);
      const path = pathFromAvatarUrl(myPhotoUrl);
      const { error } = await db.deleteMemberPhoto(user.id, memberId);
      if (error) { setPhotoError(fmt(T.errRemove, { error })); setPhotoBusy(false); return; }
      if (path) removeAvatarImage(path);
      setMyPhotoUrl(null);
      setPhotoBusy(false);
    });
  }

  const loadEffectiveRule = useCallback(async (lastConfessionIso: string | null) => {
    const [base, assigned] = await Promise.all([
      loadMemberRule(memberId ?? '', demoMode),
      loadAssignedForPriest(memberId ?? '', user?.id ?? '', demoMode),
    ]);
    if (!base) { setMemberRule(null); setAssignedCats(new Set()); setCustomCount(0); return; }
    const overlay = applyOverlay(base, assigned, lastConfessionIso ? localDayOf(lastConfessionIso) : null);
    setMemberRule(overlay.rule);
    setAssignedCats(overlay.lockedCategories);
    setCustomCount(overlay.customComponents.length);
  }, [memberId, demoMode, user?.id]);

  // Total canon components the member follows = the effective rule's shown
  // components plus any free-text custom ones — not just the priest-assigned
  // rows, so the count matches the full Current Canon below.
  const canonCount = memberRule ? ruleSummaryLines(memberRule).length + customCount : canons.length;

  useFocusEffect(
    useCallback(() => {
      if (demoMode) loadEffectiveRule(null);
      if (demoMode) {
        const d = getDemoData(memberId ?? '');
        setVisitRequested(d.member.key === 'pb');
        setMemberAvatarUrl(null);
        setMyPhotoUrl(null);
        setMemberInfo(d.member);
        setContact(d.contact);
        setLifeStageData(d.life);
        setMemberChildren(d.children);
        setVitals(vitalsFromPayload(d.vitals));
        setPsalmStats(d.psalm);
        setConfessions(d.confessions);
        setPrayerRequests(d.prayer);
        setCanons(d.canons);
        setNotes(d.note ? [{ id: 'demo-note-1', author_id: 'demo-priest', member_id: memberId ?? '', body: d.note, created_at: new Date(Date.now() - 86400000 * 10).toISOString(), updated_at: new Date(Date.now() - 86400000 * 10).toISOString() }] : []);
      } else if (memberId) {
        loadMemberData();
      }
    }, [memberId, demoMode, loadEffectiveRule])
  );

  async function loadMemberData() {
    if (!user || !memberId) return;
    setLoading(true);

    const [profileData, vitalsPayload, psalmStatsPayload, confData, confDatesPayload, prayerData, canonData, notesData, contactData, lifeData, kidsData] =
      await Promise.all([
        db.getMemberProfile(memberId),
        db.getAgentProgress(memberId, 'vitals'),
        db.getAgentProgress(memberId, 'psalm-stats'),
        db.getConfessionsForCongregant(memberId),
        db.getAgentProgress(memberId, 'confession-dates'),
        db.getFocPrayerRequests(memberId),
        db.getMemberActiveCanons(memberId),
        db.getPastoralNotes(user.id, memberId),
        db.getContact(memberId),
        db.getLifeProfile(memberId),
        db.getChildren(memberId),
      ]);

    loadEffectiveRule(profileData?.last_confession_at ?? null);
    db.getLastEncounterDate(memberId, 'visit').then(setLastVisit);
    db.getEncounterPrivateNotes(user.id, memberId).then(setEncounterNotes);
    db.getVisitRequest(memberId).then(r => setVisitRequested(r.active));
    db.getMemberPhoto(user.id, memberId).then(setMyPhotoUrl);
    setMemberAvatarUrl(profileData?.avatar_url ?? null);

    if (profileData) {
      const p = profileData;
      const joined = fmtDate(new Date(p.created_at), { month: 'long', year: 'numeric' });
      // Latest of the priest's logged confession encounters and the member's
      // own self-reported confession (profiles.last_confession_at) — the same
      // event may exist in both, so taking the newest never double-counts.
      const lastMs = latestConfessionMs(confData?.[0]?.encountered_at, p.last_confession_at);
      // Count local calendar days (not raw elapsed 24h) so this matches the
      // member's own "days since confession".
      const daysSince = lastMs != null ? daysSinceMs(lastMs) : null;
      setMemberInfo({ initials: initials(memberName ?? p.full_name), name: memberName ?? p.full_name, stage: '', joined, daysSince, flagged: false, flagNote: '' });
    }

    if (vitalsPayload) {
      // Mirror the member's own eight vital categories exactly (same keys/labels
      // the member computes from their canon adherence).
      setVitals(vitalsFromPayload(vitalsPayload as Record<string, number | null>));
    } else if (!demoMode) {
      setVitals([]);
    }

    setPsalmStats(psalmStatsPayload ? {
      streak: psalmStatsPayload.streak ?? 0,
      longestStreak: psalmStatsPayload.longestStreak ?? 0,
      masteredItems: psalmStatsPayload.masteredItems ?? 0,
    } : null);

    {
      // Priest-logged confession encounters merged with the member's own
      // self-reported dates (a dates-only mirror — never content). A same-day
      // pair collapses to the logged encounter, which carries the note.
      const fmtDay = (ms: number) => fmtDate(new Date(ms), DAY_FORMAT).toUpperCase();
      const encRows = (confData ?? []).map((c: any) => ({
        ms: new Date(c.encountered_at).getTime(),
        day: localDayOf(c.encountered_at),
        type: T.holyConfession,
        note: c.member_note ?? '',
      }));
      const encDays = new Set(encRows.map(r => r.day));
      const selfDates: string[] = Array.isArray((confDatesPayload as any)?.dates) ? (confDatesPayload as any).dates : [];
      const selfRows = selfDates
        .filter(d => typeof d === 'string' && !encDays.has(d))
        .map(d => ({
          ms: new Date(`${d}T12:00:00`).getTime(),
          day: d,
          type: T.holyConfession,
          note: T.selfReported,
        }));
      setConfessions(
        [...encRows, ...selfRows]
          .sort((a, b) => b.ms - a.ms)
          .map(r => ({ date: fmtDay(r.ms), type: r.type, note: r.note })),
      );
    }

    if (prayerData) {
      const senderPubKey = await db.getPublicKey(memberId);
      const decryptedPrayers = await Promise.all(prayerData.map(async p => ({
        date: fmtDate(new Date(p.created_at), DAY_FORMAT).toUpperCase(),
        topic: p.category,
        body: (p.body_foc && senderPubKey) ? await decryptFromSender(p.body_foc, senderPubKey) : null,
      })));
      setPrayerRequests(decryptedPrayers);
    }

    if (canonData) {
      // completions/totalDays over the trailing week — same measure the
      // servant's student view uses, so "how is this going" reads the same
      // way across both pastoral roles.
      const enriched = await Promise.all(canonData.map(async (c: any) => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const count = await db.countCanonCompletionsSince(c.id, sevenDaysAgo);
        return { id: c.id, component: describeAssigned(c.component, c.category, c.payload), frequency: c.frequency, startDate: isRTL ? arabicStartDate(c.start_date) : c.start_date, completions: count, totalDays: 7 };
      }));
      setCanons(enriched);
    }

    setNotes(notesData);

    // Contact and family details are sealed to this priest's keypair by the
    // member's device. Opening them needs the MEMBER's public key, since they
    // are the sender. Without it (a member who has not finished key setup)
    // only rows still in plaintext can be read, which is what the fallback in
    // openContactForFoc handles.
    const memberPublicKey = await db.getPublicKey(memberId);
    setContact(await openContactForFoc(contactData, memberPublicKey));
    if (lifeData) setLifeStageData(lifeData);
    setMemberChildren(await openChildrenForFoc(kidsData ?? [], memberPublicKey));

    setLoading(false);
  }

  async function handleAddNote() {
    if (!newNoteText.trim()) return;
    if (demoMode) {
      const n: db.PastoralNote = { id: `demo-${Date.now()}`, author_id: 'demo-priest', member_id: memberId ?? '', body: newNoteText.trim(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setNotes(prev => [n, ...prev]);
      setNewNoteText('');
      return;
    }
    setAddingNote(true);
    setAddNoteError('');
    const { data, error } = await db.insertPastoralNote(user!.id, memberId!, newNoteText.trim());
    setAddingNote(false);
    if (error || !data) { setAddNoteError(T.noteSaveFailed); return; }
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
    if (error) { setEditError(T.noteSaveFailed); return; }
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

  function openMaps() {
    if (!contact?.address_line1) return;
    // Country included so an address outside the US resolves to the right place.
    const parts = [contact.address_line1, contact.address_line2, contact.city, contact.state, contact.zip, contact.country].filter(Boolean);
    const encoded = encodeURIComponent(parts.join(', '));
    const url = Platform.OS === 'ios' ? `maps:?q=${encoded}` : `geo:0,0?q=${encoded}`;
    Linking.openURL(url);
  }

  const daysSince = memberInfo?.daysSince;
  const sinceTxt = daysSince !== null && daysSince !== undefined ? plural(T.statDays, daysSince) : '—';
  const sinceColor = daysSince === null || daysSince === undefined ? colors.muted : daysSince < 30 ? colors.green : daysSince < 60 ? colors.yellow : colors.red;
  const lifeStageDisplay = formatLifeStageLine(lifeStageData, memberChildren);

  // One newest-first list: standalone pastoral notes by when they were
  // written, encounter notes by when the encounter happened.
  const noteItems = [
    ...notes.map(n => ({ kind: 'pastoral' as const, ms: new Date(n.created_at).getTime(), note: n })),
    ...encounterNotes.map(n => ({ kind: 'encounter' as const, ms: new Date(n.encountered_at).getTime(), note: n })),
  ].sort((a, b) => b.ms - a.ms);
  const encounterLabel = (n: db.EncounterPrivateNote) =>
    fmt(T.encounterNoteHeading, { type: encounterTypeLabel(n.encounter_type), date: fmtDate(new Date(n.encountered_at), DAY_FORMAT) });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        <View style={styles.topRow}>
          <TouchableOpacity style={[styles.backRow, styles.backRowInBar]} onPress={() => router.push('/(priest)')}>
            <Text style={styles.backArrow}>{GLYPH.back}</Text>
            <Text style={styles.backText}>{SHARED.myFlock}</Text>
          </TouchableOpacity>
          <HeaderActions />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ paddingTop: 40 }} />
        ) : (
          <>
            {/* ── Hero card ── */}
            <View style={styles.heroCard}>
              <Avatar
                url={memberAvatarUrl ?? myPhotoUrl}
                initials={memberInfo?.initials ?? '?'}
                size={52}
                style={[styles.heroAvatar, memberInfo?.flagged && styles.heroAvatarFlagged]}
                textStyle={styles.heroAvatarText}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{memberInfo?.name ?? memberName ?? T.nameFallback}</Text>
                <Text style={styles.heroMeta}>
                  {memberInfo?.stage ? fmt(T.heroStage, { stage: memberInfo.stage }) + SHARED.dot : ''}
                  {memberInfo?.joined ? fmt(T.heroJoined, { date: memberInfo.joined }) : ''}
                </Text>
                {lifeStageDisplay ? (
                  <Text style={styles.heroLifeStage}>{lifeStageDisplay}</Text>
                ) : null}
                {memberInfo?.flagged && (
                  <View style={styles.flagBadge}>
                    <Text style={styles.flagBadgeText}>{fmt(T.flagNote, { note: memberInfo.flagNote })}</Text>
                  </View>
                )}
                {visitRequested && (
                  <View style={styles.visitBadge}>
                    <Text style={styles.visitBadgeText}>{SHARED.visitRequested}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Member photo (only when they haven't set their own) ── */}
            {!demoMode && !loading && !memberAvatarUrl && (
              <View style={styles.photoRow}>
                <Text style={styles.photoRowLabel}>
                  {myPhotoUrl ? T.photoYours : T.photoNone}
                </Text>
                <View style={styles.photoChipRow}>
                  {cameraAvailable && (
                    <TouchableOpacity style={styles.photoChip} onPress={() => addMemberPhoto('camera')} disabled={photoBusy}>
                      <Text style={styles.photoChipText}>{T.photoCamera}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.photoChip} onPress={() => addMemberPhoto('library')} disabled={photoBusy}>
                    <Text style={styles.photoChipText}>{myPhotoUrl ? T.photoChange : T.photoUpload}</Text>
                  </TouchableOpacity>
                  {!!myPhotoUrl && (
                    <TouchableOpacity style={styles.photoChip} onPress={removeMemberPhoto} disabled={photoBusy}>
                      <Text style={[styles.photoChipText, { color: colors.red }]}>{T.photoRemove}</Text>
                    </TouchableOpacity>
                  )}
                  {photoBusy && <ActivityIndicator color={colors.gold} size="small" />}
                </View>
                {!!photoError && <Text style={styles.photoErrorText}>{photoError}</Text>}
              </View>
            )}

            {/* ── Stats strip ── */}
            <View style={styles.statStrip}>
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: sinceColor }]}>{sinceTxt}</Text>
                <Text style={styles.statLabel}>{T.statSinceConfession}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.cream }]}>{canonCount}</Text>
                <Text style={styles.statLabel}>{T.statCanons}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.cream }]}>{prayerRequests.length}</Text>
                <Text style={styles.statLabel}>{T.statRequests}</Text>
              </View>
            </View>

            {/* ── Last pastoral visit ── */}
            <View style={styles.lastVisitRow}>
              <Text style={styles.lastVisitLabel}>{T.lastVisit}</Text>
              <Text style={styles.lastVisitVal}>
                {lastVisit
                  ? fmtDate(new Date(/^\d{4}-\d{2}-\d{2}$/.test(lastVisit) ? `${lastVisit}T12:00:00` : lastVisit), DAY_FORMAT)
                  : T.lastVisitNone}
              </Text>
            </View>

            {/* ── Action row ── */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btnGold, { flex: 1 }]}
                onPress={() => router.push({ pathname: '/(priest)/log-encounter', params: { memberId: memberId ?? '', memberName: memberName ?? memberInfo?.name ?? '' } })}
              >
                <Text style={styles.btnGoldText}>{T.logEncounter}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnMenu}
                onPress={() => setShowContactSheet(true)}
              >
                <Text style={styles.btnMenuText}>···</Text>
              </TouchableOpacity>
            </View>

            {/* ── Tab bar ── */}
            <View style={styles.tabBar}>
              {TABS.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.tabItem, tab === t.value && styles.tabItemActive]}
                  onPress={() => setTab(t.value)}
                >
                  <Text style={[styles.tabText, tab === t.value && styles.tabTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Overview ── */}
            {tab === 'overview' && (
              <>
                <Card title={T.vitalsTitle} flat>
                  {vitals.length === 0 ? (
                    <Text style={styles.emptyText}>{T.vitalsEmpty}</Text>
                  ) : vitals.map((v, i) => {
                    // Confession has no canon check-off to measure, so it never
                    // has a percentage — show days-since-confession instead of
                    // "—", the same as the member's own dashboard.
                    const isConf = v.key === 'confession';
                    const confDays = memberInfo?.daysSince;
                    const has = isConf
                      ? confDays !== null && confDays !== undefined
                      : v.shared && v.pct !== null && v.pct !== undefined;
                    const notShared = !isConf && !v.shared;
                    return (
                      <View key={i} style={[styles.vitalRow, i < vitals.length - 1 && { marginBottom: 10 }]}>
                        <Text style={[styles.vitalLabel, notShared && styles.vitalLabelDim]}>
                          {notShared ? fmt(T.vitalNotShared, { label: v.label }) : v.label}
                        </Text>
                        <View style={styles.vitalTrack}>
                          {has && !isConf && <View style={[styles.vitalFill, { width: `${v.pct}%` as any }]} />}
                        </View>
                        <Text style={[styles.vitalVal, !has && { color: colors.muted, opacity: 0.4 }]}>
                          {isConf ? (has ? fmt(T.vitalDays, { n: confDays }) : '—') : (has ? `${v.pct}%` : '—')}
                        </Text>
                      </View>
                    );
                  })}
                </Card>

                <Card title={T.psalmTitle} titleIconNode={<Harp size={16} color={colors.gold} />} flat>
                  {!psalmStats ? (
                    <Text style={styles.emptyText}>{T.psalmEmpty}</Text>
                  ) : (
                    <View style={styles.psalmStatsRow}>
                      <View style={styles.psalmStat}>
                        <Text style={styles.psalmStatValue}>🔥 {psalmStats.streak}</Text>
                        <Text style={styles.psalmStatLabel}>{T.psalmStreak}</Text>
                      </View>
                      <View style={styles.psalmStat}>
                        <Text style={styles.psalmStatValue}>{psalmStats.longestStreak}</Text>
                        <Text style={styles.psalmStatLabel}>{T.psalmBest}</Text>
                      </View>
                      <View style={styles.psalmStat}>
                        <Text style={styles.psalmStatValue}>{psalmStats.masteredItems}</Text>
                        <Text style={styles.psalmStatLabel}>{T.psalmMemorized}</Text>
                      </View>
                    </View>
                  )}
                </Card>

                <Card title={T.confessionTitle} flat>
                  <View style={styles.privacyNote}>
                    <Text style={styles.privacyNoteText}>{T.confessionPrivacy}</Text>
                  </View>
                  {confessions.length === 0 ? (
                    <Text style={styles.emptyText}>{T.confessionEmpty}</Text>
                  ) : confessions.map((c, i) => (
                    <View key={i} style={[styles.histRow, i < confessions.length - 1 && styles.histBorder]}>
                      <Text style={styles.histDate}>{c.date}</Text>
                      <Text style={styles.histType}>{c.type}</Text>
                      {c.note ? <Text style={styles.histNote}>{c.note}</Text> : null}
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* ── Canon ── */}
            {tab === 'canon' && (
              <Card title={T.currentCanonTitle} flat>
                {!memberRule ? (
                  <Text style={styles.emptyText}>{T.currentCanonEmpty}</Text>
                ) : (
                  ruleSummaryLines(memberRule).map((l, i, arr) => (
                    <View key={l.category} style={[styles.canonRow, i < arr.length - 1 && styles.histBorder]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.canonComponent}>
                          {l.label}
                          {assignedCats.has(l.category)
                            ? <Text style={styles.assignedByYou}>{T.assignedByYou}</Text>
                            : null}
                        </Text>
                        <Text style={styles.canonMeta}>{l.value}</Text>
                      </View>
                    </View>
                  ))
                )}
                <Text style={styles.currentCanonHint}>
                  {T.currentCanonHint}
                </Text>
              </Card>
            )}
            {tab === 'canon' && (
              <Card title={T.assignedCanonTitle} flat>
                {canons.length === 0 ? (
                  <Text style={styles.emptyText}>{T.assignedCanonEmpty}</Text>
                ) : canons.map((c, i) => {
                  const pct = Math.round((c.completions / c.totalDays) * 100);
                  return (
                    <View key={c.id} style={[styles.canonRow, i < canons.length - 1 && styles.histBorder]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.canonComponent}>{c.component}</Text>
                        <Text style={styles.canonMeta}>{fmt(T.canonSince, { frequency: frequencyLabel(c.frequency), date: c.startDate })}</Text>
                      </View>
                      <View style={styles.canonPill}>
                        <Text style={[styles.canonPillText, { color: pct < 40 ? colors.red : colors.yellow }]}>
                          {fmt(T.canonThisWeek, { done: c.completions, total: c.totalDays })}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <TouchableOpacity
                  style={[styles.btnGold, { alignSelf: 'flex-start', marginTop: 12 }]}
                  onPress={() => router.push({ pathname: '/(priest)/assign-canon', params: { memberId: memberId ?? '', memberName: memberName ?? memberInfo?.name ?? '' } })}
                >
                  <Text style={styles.btnGoldText}>{T.assignCanon}</Text>
                </TouchableOpacity>
              </Card>
            )}

            {/* ── Prayer ── */}
            {tab === 'prayer' && (
              <Card title={T.prayerTitle} flat>
                <View style={styles.privacyNote}>
                  <Text style={styles.privacyNoteText}>{T.prayerPrivacy}</Text>
                </View>
                {prayerRequests.length === 0 ? (
                  <Text style={styles.emptyText}>{T.prayerEmpty}</Text>
                ) : prayerRequests.map((p, i) => (
                  <View key={i} style={[styles.histRow, i < prayerRequests.length - 1 && styles.histBorder]}>
                    <Text style={styles.histDate}>{p.date}</Text>
                    <Text style={styles.histType}>{prayerCategoryLabel(p.topic)}</Text>
                    {p.body ? <Text style={styles.histNote}>{p.body}</Text> : null}
                  </View>
                ))}
              </Card>
            )}

            {/* ── Notes ── */}
            {tab === 'notes' && (
              <Card title={T.notesTitle} flat>
                <View style={styles.privacyNote}>
                  <Text style={styles.privacyNoteText}>{T.notesPrivacy}</Text>
                </View>

                {noteItems.length === 0 && (
                  <Text style={styles.emptyText}>{T.notesEmpty}</Text>
                )}

                {noteItems.map(item => {
                  if (item.kind === 'encounter') {
                    return (
                      <View key={`enc-${item.note.id}`} style={styles.noteCard}>
                        <View style={styles.noteCardHeader}>
                          <Text style={styles.noteCardDate}>{encounterLabel(item.note).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.noteCardBody}>{item.note.body}</Text>
                      </View>
                    );
                  }
                  const note = item.note;
                  return (
                  <View key={note.id} style={styles.noteCard}>
                    <View style={styles.noteCardHeader}>
                      <Text style={styles.noteCardDate}>
                        {note.updated_at !== note.created_at
                          ? fmt(T.noteEdited, { date: fmtDate(new Date(note.created_at), DAY_FORMAT) })
                          : fmtDate(new Date(note.created_at), DAY_FORMAT)}
                      </Text>
                      {editingId !== note.id && (
                        <View style={styles.noteActions}>
                          <TouchableOpacity onPress={() => handleStartEdit(note)} style={styles.noteActionBtn}>
                            <Text style={styles.noteActionText}>{S.common.edit}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteNote(note.id)}
                            style={styles.noteActionBtn}
                            disabled={deletingId === note.id}
                          >
                            <Text style={[styles.noteActionText, { color: colors.red }]}>
                              {deletingId === note.id ? '…' : S.common.delete}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {editingId === note.id ? (
                      <>
                        <TextInput
                          style={styles.noteInput}
                          value={editText}
                          onChangeText={setEditText}
                          multiline
                          autoFocus
                          placeholderTextColor={colors.faint}
                        />
                        {editError ? <Text style={styles.noteErrorText}>{editError}</Text> : null}
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.btnGold, { opacity: (!editText.trim() || savingEdit) ? 0.4 : 1 }]}
                            onPress={handleSaveEdit}
                            disabled={!editText.trim() || savingEdit}
                          >
                            <Text style={styles.btnGoldText}>{savingEdit ? T.noteSaving : T.noteSave}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.btnCancel} onPress={() => setEditingId(null)}>
                            <Text style={styles.btnCancelText}>{T.noteCancel}</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.noteCardBody}>{note.body}</Text>
                    )}
                  </View>
                  );
                })}

                <View style={styles.addNoteSection}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder={T.notePlaceholder}
                    placeholderTextColor={colors.faint}
                    multiline
                    numberOfLines={4}
                    value={newNoteText}
                    onChangeText={setNewNoteText}
                  />
                  {addNoteError ? <Text style={styles.noteErrorText}>{addNoteError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.btnGold, { alignSelf: 'flex-start', marginTop: 10, opacity: (!newNoteText.trim() || addingNote) ? 0.4 : 1 }]}
                    onPress={handleAddNote}
                    disabled={!newNoteText.trim() || addingNote}
                  >
                    <Text style={styles.btnGoldText}>{addingNote ? T.noteSaving : T.noteAdd}</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          </>
        )}

      </ScrollView>

      {/* ── Contact sheet ── */}
      <Modal
        visible={showContactSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          onPress={() => setShowContactSheet(false)}
          activeOpacity={1}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{memberInfo?.name ?? T.contactFallback}</Text>

            {/* Assign canon action */}
            <TouchableOpacity
              style={styles.sheetRow}
              onPress={() => { setShowContactSheet(false); router.push({ pathname: '/(priest)/assign-canon', params: { memberId: memberId ?? '', memberName: memberName ?? memberInfo?.name ?? '' } }); }}
            >
              <View style={styles.sheetRowIcon}><CandleIcon size={18} color={colors.gold} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetRowLabel}>{T.sheet.assignCanon}</Text>
                <Text style={styles.sheetRowValue}>{T.sheet.assignCanonSub}</Text>
              </View>
              <Text style={styles.sheetRowAction}>{T.sheet.assignAction}</Text>
            </TouchableOpacity>

            {contact?.phone ? (
              <TouchableOpacity
                style={styles.sheetRow}
                onPress={() => Linking.openURL(`tel:${contact.phone.replace(/[^0-9+]/g, '')}`)}
              >
                <Text style={styles.sheetRowIcon}>☎</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetRowLabel}>{T.sheet.phone}</Text>
                  <Text style={styles.sheetRowValue}>{ltrRun(contact.phone)}</Text>
                </View>
                <Text style={styles.sheetRowAction}>{T.sheet.phoneAction}</Text>
              </TouchableOpacity>
            ) : null}

            {contact?.email ? (
              <TouchableOpacity
                style={styles.sheetRow}
                onPress={() => Linking.openURL(`mailto:${contact.email}`)}
              >
                <Text style={styles.sheetRowIcon}>✉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetRowLabel}>{T.sheet.email}</Text>
                  <Text style={styles.sheetRowValue}>{ltrRun(contact.email)}</Text>
                </View>
                <Text style={styles.sheetRowAction}>{T.sheet.emailAction}</Text>
              </TouchableOpacity>
            ) : null}

            {contact?.address_line1 ? (
              <TouchableOpacity style={styles.sheetRow} onPress={openMaps}>
                <Text style={styles.sheetRowIcon}>⌖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetRowLabel}>{T.sheet.address}</Text>
                  <Text style={styles.sheetRowValue}>{ltrRun(contact.address_line1)}</Text>
                  {contact.address_line2 ? (
                    <Text style={styles.sheetRowValue}>{ltrRun(contact.address_line2)}</Text>
                  ) : null}
                  <Text style={styles.sheetRowValue}>
                    {ltrRun([contact.city, contact.state, contact.zip].filter(Boolean).join(', '))}
                  </Text>
                  {contact.country ? (
                    <Text style={styles.sheetRowValue}>{contact.country}</Text>
                  ) : null}
                </View>
                <Text style={styles.sheetRowAction}>{T.sheet.addressAction}</Text>
              </TouchableOpacity>
            ) : null}

            {!contact?.phone && !contact?.email && !contact?.address_line1 ? (
              <Text style={styles.sheetEmpty}>
                {T.sheet.empty}
              </Text>
            ) : null}

            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setShowContactSheet(false)}>
              <Text style={styles.sheetCloseBtnText}>{T.sheet.close}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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

  heroCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 12 },
  photoRow: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 12 },
  photoRowLabel: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 8 },
  photoChipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  photoChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  photoChipText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.gold },
  photoErrorText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.red, marginTop: 8 },
  heroAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blueBg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  heroAvatarFlagged: { borderColor: colors.red, backgroundColor: 'rgba(192,57,43,0.2)' },
  heroAvatarText: { fontFamily: fonts.cormorantMedium, fontSize: 20, color: colors.blue },
  heroName: { fontFamily: fonts.cormorantMedium, fontSize: 22, color: colors.cream, marginBottom: 2 },
  heroMeta: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },
  heroLifeStage: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 3 },
  flagBadge: { backgroundColor: 'rgba(192,57,43,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 6 },
  flagBadgeText: { fontFamily: fonts.latoBold, fontSize: 9, color: colors.red, letterSpacing: 0.5 },
  visitBadge: { backgroundColor: colors.blueBg, borderWidth: 1, borderColor: colors.blue, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 6 },
  visitBadgeText: { fontFamily: fonts.latoBold, fontSize: 9, color: colors.blue, letterSpacing: 0.5 },

  statStrip: { flexDirection: 'row', backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  statItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statVal: { fontFamily: fonts.cormorantMedium, fontSize: 22 },
  statLabel: { fontFamily: fonts.latoBold, fontSize: 8, letterSpacing: 1.5, color: colors.muted, textTransform: 'uppercase', marginTop: 2 },
  lastVisitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 4 },
  lastVisitLabel: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 1.2, color: colors.muted, textTransform: 'uppercase' },
  lastVisitVal: { fontFamily: fonts.lato, fontSize: 13, color: colors.cream },
  statDivider: { width: 1, backgroundColor: colors.border },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 16 },
  btnGold: { backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, alignItems: 'center' },
  btnGoldText: { fontFamily: fonts.latoBold, fontSize: 10, color: colors.navy, letterSpacing: 0.8 },
  btnMenu: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' },
  btnMenuText: { fontFamily: fonts.lato, fontSize: 16, color: colors.muted, letterSpacing: 2, lineHeight: 18 },

  tabBar: { flexDirection: 'row', backgroundColor: colors.panel, borderRadius: 10, padding: 4, marginBottom: 16, gap: 2 },
  tabItem: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabItemActive: { backgroundColor: colors.navyMid, borderWidth: 1, borderColor: colors.border },
  tabText: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted },
  tabTextActive: { color: colors.goldLight },

  vitalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vitalLabel: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, flex: 1 },
  vitalLabelDim: { opacity: 0.4 },
  vitalTrack: { width: 80, height: 4, backgroundColor: colors.creamDim, borderRadius: 4, overflow: 'hidden' },
  vitalFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 4 },
  vitalVal: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.cream, width: 30, textAlign: 'right' },

  psalmStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  psalmStat: { alignItems: 'center' },
  psalmStatValue: { fontFamily: fonts.cormorantMedium, fontSize: 20, color: colors.goldLight },
  psalmStatLabel: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },

  privacyNote: { backgroundColor: 'rgba(201,168,76,0.07)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12 },
  privacyNoteText: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, letterSpacing: 0.3 },

  histRow: { paddingVertical: 12 },
  histBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  histDate: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 1.5, color: colors.gold, opacity: 0.7, marginBottom: 2, textTransform: 'uppercase' },
  histType: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 2 },
  histNote: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 16 },

  canonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  canonComponent: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 2 },
  canonMeta: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 17 },
  currentCanonHint: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 12, opacity: 0.85 },
  assignedByYou: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.gold },
  canonPill: { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  canonPillText: { fontFamily: fonts.latoBold, fontSize: 12 },

  emptyText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 16 },

  savedNoteText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 12, padding: 12, backgroundColor: colors.panel, borderRadius: 8 },
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
  noteErrorText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.red, marginTop: 6 },

  // ── Contact sheet ──
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.navyMid, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12,
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontFamily: fonts.cormorantMedium, fontSize: 22, color: colors.cream, marginBottom: 18 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetRowIcon: { width: 26, alignItems: 'center', justifyContent: 'center' },
  sheetRowLabel: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 2 },
  sheetRowValue: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.cream },
  sheetRowAction: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 1, color: colors.gold, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  sheetEmpty: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 28, lineHeight: 20 },
  sheetCloseBtn: { marginTop: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  sheetCloseBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.muted, letterSpacing: 1 },
}));
