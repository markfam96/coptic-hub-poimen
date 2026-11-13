// app/(priest)/schedule.tsx
// The priest's scheduling console: a master open/close switch, custom
// appointment types + durations, recurring weekly availability windows, and
// the inbox of pending requests to confirm or decline. All cloud-backed
// (lib/db/scheduling.ts); demo mode drives an in-memory copy for the preview.

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { HeaderActions, fitTitle } from '@/components/ui/HeaderActions';
import { colors, fonts, lazyThemed } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import ScrollPicker from '@/components/ui/ScrollPicker';
import { useSession } from '@/lib/auth';
import { useDemoMode } from '@/lib/demo';
import { confirmDestructive } from '@/lib/confirm';
import * as H from '@/lib/haptics';
import * as db from '@/lib/db';
import type { AppointmentType, AvailabilityRuleRow, Appointment, AvailabilityException } from '@/lib/db';
import {
  WEEKDAYS, WEEKDAYS_SHORT, WEEKDAY_INITIALS, formatMinute, formatMinuteRange, formatTime, formatDayLabel,
  monthCells, dateKey, closuresOn, isClosedAllDay, extraWindowsOn, SCHEDULE_HORIZON_DAYS,
} from '@/lib/scheduling/slots';
import {
  normalizeCalendlyUrl, loadDemoCalendly, saveDemoCalendly,
  loadDemoSchedulingMode, saveDemoSchedulingMode,
} from '@/lib/scheduling/calendly';
import type { SchedulingMode } from '@/lib/db';
import {
  calendarSyncSupported, loadSyncState, listWritableCalendars, chooseCalendar,
  reconcileCalendar, type WritableCalendar, type ReconcileResult,
} from '@/lib/scheduling/calendar-sync';
import { S, fmt, plural, fmtDate, GLYPH, isRTL } from '@/lib/i18n';

const T = S.schedule;

const DURATION_OPTS = [15, 30, 45, 60, 90];

// Quarter-hour times as picker labels. A window's start can be any time up to
// 11:45 PM and its end anything from 12:15 AM to midnight, so neither list ever
// offers a value that couldn't begin or end a window.
const SLIDER_STEP = 15;
const TIME_VALUES = Array.from({ length: 1440 / SLIDER_STEP + 1 }, (_, i) => i * SLIDER_STEP);
const TIME_LABELS = TIME_VALUES.map(formatMinute);
const START_OPTIONS = TIME_LABELS.slice(0, -1);   // 12:00 AM … 11:45 PM
const END_OPTIONS = TIME_LABELS.slice(1);         // 12:15 AM … midnight
// Labels are unique (1440 renders "midnight", not a second "12:00 AM"), so this
// round-trips exactly.
const minutesFor = (label: string) => TIME_VALUES[TIME_LABELS.indexOf(label)] ?? 0;

// How far ahead the availability calendar goes — the same year a member can
// book into, so there is no stretch of time he can request and the priest
// can't close.
const CALENDAR_MONTHS = Math.ceil(SCHEDULE_HORIZON_DAYS / 30);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const monthLabel = (d: Date) => fmtDate(d, { month: 'long', year: 'numeric' });

// ── Demo seed ────────────────────────────────────────────────
const demoTypes = (): AppointmentType[] => ([
  { id: 'dt-conf', priest_id: 'demo', label: S.appointments.demo.typeConfession, duration_minutes: 30, active: true, sort: 0, created_at: '' },
  { id: 'dt-visit', priest_id: 'demo', label: S.appointments.demo.typeVisit, duration_minutes: 60, active: true, sort: 1, created_at: '' },
  { id: 'dt-meet', priest_id: 'demo', label: T.demo.typeMeeting, duration_minutes: 45, active: false, sort: 2, created_at: '' },
]);
const demoRules = (): AvailabilityRuleRow[] => ([
  { id: 'dr-1', priest_id: 'demo', type_id: 'dt-conf', weekday: 0, start_minute: 840, end_minute: 960, active: true, created_at: '' },
  { id: 'dr-2', priest_id: 'demo', type_id: 'dt-visit', weekday: 3, start_minute: 1080, end_minute: 1200, active: true, created_at: '' },
]);
const demoAppts = (): Appointment[] => {
  const soon = new Date(); soon.setDate(soon.getDate() + 3); soon.setHours(14, 0, 0, 0);
  const later = new Date(); later.setDate(later.getDate() + 5); later.setHours(18, 0, 0, 0);
  return [
    { id: 'da-1', priest_id: 'demo', congregant_id: 'demo-pb', type_id: 'dt-conf', type_label: S.appointments.demo.typeConfession, starts_at: soon.toISOString(), duration_minutes: 30, status: 'requested', note: T.demo.requestNote, created_at: '', updated_at: '' },
    { id: 'da-2', priest_id: 'demo', congregant_id: 'demo-sg', type_id: 'dt-visit', type_label: S.appointments.demo.typeVisit, starts_at: later.toISOString(), duration_minutes: 60, status: 'confirmed', note: null, created_at: '', updated_at: '' },
  ];
};
const demoExceptions = (): AvailabilityException[] => {
  const p = (n: number) => String(n).padStart(2, '0');
  const key = (offset: number) => {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  return [
    { id: 'de-1', priest_id: 'demo', on_date: key(9), start_minute: null, end_minute: null, kind: 'block', type_id: null, note: T.demo.closureNote, created_at: '' },
    { id: 'de-2', priest_id: 'demo', on_date: key(4), start_minute: 840, end_minute: 900, kind: 'block', type_id: null, note: null, created_at: '' },
  ];
};
const DEMO_NAMES: Record<string, string> = {
  'demo-pb': T.demo.names.pb, 'demo-sg': T.demo.names.sg, 'demo-mh': T.demo.names.mh, 'demo-mm': T.demo.names.mm,
};

export default function ScheduleScreen() {
  const navigation = useNavigation();
  const { user } = useSession();
  const { demoMode } = useDemoMode();

  const [loading, setLoading] = useState(!demoMode);
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [rules, setRules] = useState<AvailabilityRuleRow[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  // Add-type form
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeDur, setNewTypeDur] = useState(30);
  // Add-rule form
  const [ruleTypeId, setRuleTypeId] = useState<string | null>(null);
  const [ruleWeekday, setRuleWeekday] = useState(0);
  const [ruleStart, setRuleStart] = useState(840);   // 2:00 PM
  const [ruleEnd, setRuleEnd] = useState(960);        // 4:00 PM
  const [ruleErr, setRuleErr] = useState('');

  // Date-specific exceptions: the year-ahead calendar, the day being edited,
  // and the window for a partial closure.
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [calMonth, setCalMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [exStart, setExStart] = useState(540);        // 9:00 AM
  const [exEnd, setExEnd] = useState(720);            // 12:00 PM
  const [exErr, setExErr] = useState('');
  // Extra hours opened on a single date, over the weekly pattern.
  const [addTypeId, setAddTypeId] = useState<string | null>(null);
  const [addStart, setAddStart] = useState(1080);     // 6:00 PM
  const [addEnd, setAddEnd] = useState(1200);         // 8:00 PM
  const [addErr, setAddErr] = useState('');

  // Where members book: this app's scheduler, or the priest's Calendly page.
  // One or the other — both at once meant double-bookings.
  const [mode, setMode] = useState<SchedulingMode>('app');
  const [modeErr, setModeErr] = useState('');
  // The priest's Calendly link: what is saved, and what is in the input.
  const [calendly, setCalendly] = useState<string | null>(null);
  const [calendlyDraft, setCalendlyDraft] = useState('');
  const [calendlyErr, setCalendlyErr] = useState('');
  const [calendlyMsg, setCalendlyMsg] = useState('');

  // Calendar sync: which device calendar confirmed bookings are written to
  // (null = off), and the picker's list while it is open ('denied' = the
  // calendar permission was refused, 'error' = calendars unreadable).
  const [syncCal, setSyncCal] = useState<{ id: string; title: string } | null>(null);
  const [calChoices, setCalChoices] = useState<WritableCalendar[] | 'denied' | 'error' | null>(null);
  const [syncMsg, setSyncMsg] = useState('');
  const [syncWarn, setSyncWarn] = useState('');
  // Confirm/decline/cancel failures (e.g. the member cancelled first).
  const [apptErr, setApptErr] = useState('');

  // Every reconcile reports through here, so a sync that stops working shows a
  // warning instead of a green "writing to…" over a calendar getting nothing.
  const noteSync = (r: ReconcileResult | null) => {
    if (!r) return;
    if (r.permissionLost) setSyncWarn(T.sync.permissionLost);
    else if (r.failed > 0) setSyncWarn(plural(T.sync.writeFailed, r.failed));
    else setSyncWarn('');
  };

  const load = useCallback(async () => {
    if (demoMode) {
      setOpen(true); setTypes(demoTypes()); setRules(demoRules()); setAppts(demoAppts());
      setNames(DEMO_NAMES); setRuleTypeId('dt-conf'); setExceptions(demoExceptions());
      const dc = await loadDemoCalendly();
      setCalendly(dc); setCalendlyDraft(dc ?? '');
      setMode(await loadDemoSchedulingMode());
      setLoading(false);
      return;
    }
    if (!user) return;
    setLoading(true);
    const [o, t, r, a, flock, ex, cal, m] = await Promise.all([
      db.getSchedulingOpen(user.id),
      db.getAppointmentTypes(user.id),
      db.getAvailabilityRules(user.id),
      db.getPriestAppointments(user.id),
      db.getFlock(user.id),
      db.getAvailabilityExceptions(user.id),
      db.getCalendlyUrl(user.id),
      db.getSchedulingMode(user.id),
    ]);
    setOpen(o); setTypes(t); setRules(r); setAppts(a); setExceptions(ex);
    setCalendly(cal); setCalendlyDraft(cal ?? '');
    setMode(m);
    const nameMap = Object.fromEntries(flock.map(m => [m.id, m.full_name ?? T.memberFallback]));
    setNames(nameMap);
    if (!ruleTypeId && t.length) setRuleTypeId(t[0].id);
    setLoading(false);
    // Self-healing pass: pick up confirmations made while sync was off or that
    // failed to write, and clear events for bookings cancelled elsewhere (a
    // member cancelling happens on THEIR device — this is where the priest's
    // calendar catches up). Fire-and-forget; the screen never waits on it.
    const sync = await loadSyncState();
    setSyncCal(sync.calendarId ? { id: sync.calendarId, title: sync.calendarTitle ?? T.sync.calendarFallback } : null);
    if (sync.calendarId) {
      reconcileCalendar(a, id => nameMap[id] ?? T.memberFallback).then(noteSync).catch(() => {});
    }
  }, [demoMode, user, ruleTypeId]);

  useEffect(() => { load(); }, [demoMode, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // A "from" that reaches or passes its "to" pushes the end ahead of it, so a
  // range can never invert while you drag. The gap is preserved where the day
  // still has room for it, and never shrinks below one step.
  const moveFrom = (v: number, end: number, setStart: (n: number) => void, setEnd: (n: number) => void) => {
    setStart(v);
    if (end > v) return;
    setEnd(Math.min(1440, v + SLIDER_STEP));
  };
  const moveTo = (v: number, start: number, setEnd: (n: number) => void) =>
    setEnd(Math.max(v, Math.min(1440, start + SLIDER_STEP)));

  const memberName = (id: string) => names[id] ?? T.memberFallback;
  const typeLabel = (id: string | null) => types.find(t => t.id === id)?.label ?? '';

  // ── Booking mode ──
  // Switching stops NEW bookings from the other channel but orphans nothing:
  // requests and confirmed appointments stay on screen until they play out.
  async function pickMode(m: SchedulingMode) {
    if (m === mode) return;
    H.tap();
    setModeErr('');
    const prev = mode;
    setMode(m);
    if (demoMode) { await saveDemoSchedulingMode(m); return; }
    if (!user) return;
    const { error } = await db.setSchedulingMode(user.id, m);
    if (error) {
      // Revert AND say so — a choice that silently snaps back looks like a
      // broken switch, when the truth is the save failed (most likely the
      // scheduling_mode migration hasn't been applied to this database).
      setMode(prev);
      setModeErr(/scheduling_mode/.test(error)
        ? T.mode.migrationMissing
        : fmt(T.mode.saveFailed, { error }));
    }
  }

  // ── Master switch ──
  async function toggleOpen() {
    H.tap();
    const next = !open;
    setOpen(next);
    if (!demoMode && user) { const { error } = await db.setSchedulingOpen(user.id, next); if (error) setOpen(!next); }
  }

  // ── Calendly ──
  // Saved canonicalized (https, calendly.com host) so members always get a
  // link that opens; anything that isn't a Calendly address is refused here
  // rather than shown broken on their Appointments tab.
  async function saveCalendly() {
    H.tap();
    setCalendlyErr(''); setCalendlyMsg('');
    const url = normalizeCalendlyUrl(calendlyDraft);
    if (!url) {
      setCalendlyErr(T.calendly.errInvalid);
      return;
    }
    if (demoMode) await saveDemoCalendly(url);
    else if (user) {
      const { error } = await db.setCalendlyUrl(user.id, url);
      if (error) { setCalendlyErr(error); return; }
    }
    setCalendly(url); setCalendlyDraft(url);
    setCalendlyMsg(T.calendly.saved);
  }

  function removeCalendly() {
    confirmDestructive(T.calendly.removeConfirmTitle, T.calendly.removeConfirmBody, S.common.remove, async () => {
      setCalendlyErr(''); setCalendlyMsg('');
      if (demoMode) await saveDemoCalendly(null);
      else if (user) {
        const { error } = await db.setCalendlyUrl(user.id, null);
        if (error) { setCalendlyErr(error); return; }
      }
      setCalendly(null); setCalendlyDraft('');
      setCalendlyMsg(T.calendly.removed);
    });
  }

  // ── Types ──
  async function addType() {
    const label = newTypeLabel.trim();
    if (!label) return;
    H.tap();
    if (demoMode) {
      setTypes(p => [...p, { id: `dt-${Date.now()}`, priest_id: 'demo', label, duration_minutes: newTypeDur, active: true, sort: p.length, created_at: '' }]);
    } else if (user) {
      await db.createAppointmentType(user.id, { label, duration_minutes: newTypeDur, sort: types.length });
      await load();
    }
    setNewTypeLabel(''); setNewTypeDur(30);
  }
  async function toggleType(t: AppointmentType) {
    H.tap();
    setTypes(p => p.map(x => x.id === t.id ? { ...x, active: !x.active } : x));
    if (!demoMode) await db.updateAppointmentType(t.id, { active: !t.active });
  }
  function removeType(t: AppointmentType) {
    confirmDestructive(T.types.deleteConfirmTitle, fmt(T.types.deleteConfirmBody, { label: t.label }), S.common.delete, async () => {
      setTypes(p => p.filter(x => x.id !== t.id));
      setRules(p => p.filter(x => x.type_id !== t.id));
      if (ruleTypeId === t.id) setRuleTypeId(null);
      if (!demoMode) await db.deleteAppointmentType(t.id);
    });
  }

  // ── Rules ──
  async function addRule() {
    setRuleErr('');
    if (!ruleTypeId) { setRuleErr(T.weekly.errPickType); return; }
    if (ruleEnd <= ruleStart) { setRuleErr(T.weekly.errEndBeforeStart); return; }
    H.tap();
    if (demoMode) {
      setRules(p => [...p, { id: `dr-${Date.now()}`, priest_id: 'demo', type_id: ruleTypeId, weekday: ruleWeekday, start_minute: ruleStart, end_minute: ruleEnd, active: true, created_at: '' }]);
    } else if (user) {
      await db.createAvailabilityRule(user.id, { type_id: ruleTypeId, weekday: ruleWeekday, start_minute: ruleStart, end_minute: ruleEnd });
      await load();
    }
  }
  async function toggleRule(r: AvailabilityRuleRow) {
    H.tap();
    setRules(p => p.map(x => x.id === r.id ? { ...x, active: !x.active } : x));
    if (!demoMode) await db.updateAvailabilityRule(r.id, { active: !r.active });
  }
  function removeRule(r: AvailabilityRuleRow) {
    confirmDestructive(T.weekly.deleteConfirmTitle, fmt(T.weekly.deleteConfirmBody, { day: WEEKDAYS[r.weekday], range: formatMinuteRange(r.start_minute, r.end_minute) }), S.common.delete, async () => {
      setRules(p => p.filter(x => x.id !== r.id));
      if (!demoMode) await db.deleteAvailabilityRule(r.id);
    });
  }

  // ── Date exceptions ──
  // Each of these applies optimistically, then reconciles. A failed write puts
  // the previous state back and says so, rather than leaving the priest looking
  // at a closure that was never saved — the case that matters, because a day he
  // believes is closed is a day members can still book.
  //
  // Re-reading only the exceptions (not the full load()) keeps `loading` false,
  // so the screen isn't torn down and scrolled back to the top after every tap.
  async function refreshExceptions() {
    if (demoMode || !user) return;
    setExceptions(await db.getAvailabilityExceptions(user.id));
  }

  const failed = (msg: string | null, revert: AvailabilityException[]) => {
    setExceptions(revert);
    setExErr(msg ?? T.days.errSave);
  };

  // Closing the whole day supersedes any partial closures on it. The all-day row
  // goes in FIRST and the partials are cleared after: deleting first meant a
  // failed insert (no signal, or this migration not yet applied) destroyed the
  // existing closures AND created nothing, leaving the day wide open in silence.
  async function closeWholeDay(date: Date) {
    H.tap();
    setExErr('');
    const on_date = dateKey(date);
    const before = exceptions;
    const row: AvailabilityException = {
      id: `de-${Date.now()}`, priest_id: user?.id ?? 'demo', on_date,
      start_minute: null, end_minute: null, kind: 'block', type_id: null, note: null, created_at: '',
    };
    // Drop this date's CLOSURES only — extra hours opened on it are a separate
    // thing and the server keeps them, so the optimistic state must too.
    setExceptions(p => [...p.filter(e => e.on_date !== on_date || e.kind === 'open'), row]);
    if (demoMode || !user) return;
    const { error } = await db.createAvailabilityException(user.id, { on_date });
    if (error) return failed(error, before);
    await db.clearPartialExceptions(user.id, on_date);   // tidy-up; harmless if it fails
    await refreshExceptions();
  }

  async function closePartOfDay(date: Date) {
    setExErr('');
    if (exEnd <= exStart) { setExErr(T.weekly.errEndBeforeStart); return; }
    if (isClosedAllDay(exceptions, date)) { setExErr(T.days.errAlreadyClosed); return; }
    H.tap();
    const on_date = dateKey(date);
    const before = exceptions;
    const row: AvailabilityException = {
      id: `de-${Date.now()}`, priest_id: user?.id ?? 'demo', on_date,
      start_minute: exStart, end_minute: exEnd, kind: 'block', type_id: null, note: null, created_at: '',
    };
    setExceptions(p => [...p, row]);
    if (demoMode || !user) return;
    const { error } = await db.createAvailabilityException(user.id, { on_date, start_minute: exStart, end_minute: exEnd });
    if (error) return failed(error, before);
    await refreshExceptions();
  }

  async function reopenDay(date: Date) {
    H.tap();
    setExErr('');
    const on_date = dateKey(date);
    const before = exceptions;
    // Reopening lifts the closures; extra hours on the date stay put.
    setExceptions(p => p.filter(e => e.on_date !== on_date || e.kind === 'open'));
    if (demoMode || !user) return;
    const { error } = await db.clearAvailabilityExceptions(user.id, on_date);
    if (error) return failed(error, before);
    await refreshExceptions();
  }

  // Extra hours on one date — the mirror of a closure: hours the weekly pattern
  // doesn't offer, added for this date alone.
  async function openExtraHours(date: Date) {
    setAddErr('');
    const typeId = addTypeId ?? activeTypes[0]?.id ?? null;
    if (!typeId) { setAddErr(T.days.errNeedType); return; }
    if (addEnd <= addStart) { setAddErr(T.weekly.errEndBeforeStart); return; }
    if (isClosedAllDay(exceptions, date)) { setAddErr(T.days.errClosedReopen); return; }
    H.tap();
    const on_date = dateKey(date);
    const before = exceptions;
    const row: AvailabilityException = {
      id: `de-${Date.now()}`, priest_id: user?.id ?? 'demo', on_date,
      start_minute: addStart, end_minute: addEnd, kind: 'open', type_id: typeId, note: null, created_at: '',
    };
    setExceptions(p => [...p, row]);
    if (demoMode || !user) return;
    const { error } = await db.createExtraHours(user.id, { on_date, type_id: typeId, start_minute: addStart, end_minute: addEnd });
    if (error) { setExceptions(before); setAddErr(error); return; }
    await refreshExceptions();
  }

  async function removeException(ex: AvailabilityException) {
    H.tap();
    setExErr('');
    const before = exceptions;
    setExceptions(p => p.filter(e => e.id !== ex.id));
    if (demoMode || !user) return;
    const { error } = await db.deleteAvailabilityException(ex.id);
    if (error) return failed(error, before);
    await refreshExceptions();
  }

  // Does the recurring schedule offer anything on this weekday at all? Days it
  // never covers are dimmed — there is nothing there to close.
  const weekdayHasAvailability = (date: Date) =>
    rules.some(r => r.active && r.weekday === date.getDay()
      && types.some(t => t.id === r.type_id && t.active));

  // ── Requests ──
  async function respond(a: Appointment, confirm: boolean) {
    H.tap();
    setApptErr('');
    const next = appts.map(x => x.id === a.id ? { ...x, status: (confirm ? 'confirmed' : 'declined') as Appointment['status'] } : x);
    setAppts(next);
    if (!demoMode) {
      // The RPC refuses when the request is no longer 'requested' — e.g. the
      // member cancelled moments ago. Then the optimistic flip above is a lie:
      // reload the truth and, critically, do NOT write a calendar event for a
      // booking the server never confirmed.
      const { error } = await db.respondAppointment(a.id, confirm);
      if (error) {
        setApptErr(T.requests.changed);
        await load();
        return;
      }
      // A confirmation is the moment the time must close on Calendly — write
      // the calendar event now, not at the next screen load.
      reconcileCalendar(next, memberName).then(noteSync).catch(() => {});
    }
  }
  function cancelAppt(a: Appointment) {
    confirmDestructive(T.upcoming.cancelConfirmTitle, fmt(T.upcoming.cancelConfirmBody, { type: a.type_label, name: memberName(a.congregant_id) }), T.upcoming.cancelConfirmAction, async () => {
      setApptErr('');
      const next = appts.map(x => x.id === a.id ? { ...x, status: 'cancelled' as Appointment['status'] } : x);
      setAppts(next);
      if (!demoMode) {
        const { error } = await db.cancelAppointment(a.id);
        if (error) {
          // Server still holds the booking — put the screen (and calendar)
          // back in line with it rather than reopening a time that is taken.
          setApptErr(T.upcoming.cancelFailed);
          await load();
          return;
        }
        // …and a cancellation is the moment it must reopen.
        reconcileCalendar(next, memberName).then(noteSync).catch(() => {});
      }
    });
  }

  // ── Calendar sync ──
  async function openCalendarPicker() {
    H.tap();
    setSyncMsg('');
    setCalChoices(await listWritableCalendars());
  }
  async function pickCalendar(c: WritableCalendar) {
    H.tap();
    await chooseCalendar(c);
    setSyncCal({ id: c.id, title: c.title });
    setCalChoices(null);
    // Backfill immediately: everything already confirmed lands on the calendar
    // now, so Calendly is correct from the first minute, not the next booking.
    const res = await reconcileCalendar(appts, memberName).catch(() => null);
    noteSync(res);
    setSyncMsg(res && res.added > 0
      ? plural(T.sync.turnedOnAdded, res.added, { title: c.title })
      : fmt(T.sync.turnedOn, { title: c.title }));
  }
  async function disableCalendarSync() {
    H.tap();
    await chooseCalendar(null);
    setSyncCal(null); setCalChoices(null);
    setSyncMsg(T.sync.turnedOff);
  }

  const todayKey = dateKey(new Date());
  const firstMonth = startOfMonth(new Date());
  const lastMonth = addMonths(firstMonth, CALENDAR_MONTHS - 1);
  const canGoBack = calMonth > firstMonth;
  const canGoForward = calMonth < lastMonth;
  const activeTypes = types.filter(t => t.active);
  const onSelectedDay = selectedDay
    ? exceptions.filter(e => e.on_date === dateKey(selectedDay)).sort((a, b) => (a.start_minute ?? -1) - (b.start_minute ?? -1))
    : [];
  const selectedDayClosures = onSelectedDay.filter(e => e.kind !== 'open');
  const selectedDayExtras = onSelectedDay.filter(e => e.kind === 'open');

  const nowMs = Date.now();
  const pending = appts.filter(a => a.status === 'requested').sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const upcoming = appts.filter(a => a.status === 'confirmed' && new Date(a.starts_at).getTime() >= nowMs)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.gold} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.topbar}>
          <TouchableOpacity style={[styles.chipBtn, { marginEnd: 12 }]} hitSlop={8}
            onPress={() => { H.tap(); navigation.dispatch(DrawerActions.openDrawer()); }}>
            <Text style={styles.chipBtnText}>☰</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, styles.titleFill]} {...fitTitle}>{T.title}</Text>
          <HeaderActions />
        </View>

        {/* Booking mode — one place members book, never two. Two live systems
            meant two availability calendars drifting apart and double-booked
            times; the priest picks a lane instead. */}
        <Card title={T.mode.title} titleIcon="✦">
          {(([
            ['app', T.mode.appTitle, T.mode.appSub],
            ['calendly', T.mode.calendlyTitle, T.mode.calendlySub],
          ] as [SchedulingMode, string, string][])).map(([m, title, sub]) => (
            <TouchableOpacity key={m} style={[styles.modeOpt, mode === m && styles.modeOptOn]} onPress={() => pickMode(m)} activeOpacity={0.8}>
              <Text style={[styles.modeRadio, mode === m && { color: colors.gold }]}>{mode === m ? '◉' : '○'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeTitle, mode === m && { color: colors.gold }]}>{title}</Text>
                <Text style={styles.modeSub}>{sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {modeErr ? <Text style={styles.errText}>{modeErr}</Text> : null}
          {mode === 'calendly' && (
            <Text style={styles.hint}>
              {T.mode.calendlyHint}
            </Text>
          )}
        </Card>

        {/* Master switch — only meaningful when booking happens in the app. */}
        {mode === 'app' && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleOpen} style={[styles.masterCard, open ? styles.masterOn : styles.masterOff]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.masterTitle, { color: open ? colors.green : colors.muted }]}>
              {open ? T.master.openTitle : T.master.closedTitle}
            </Text>
            <Text style={styles.masterSub}>
              {open ? T.master.openSub : T.master.closedSub}
            </Text>
          </View>
        </TouchableOpacity>
        )}

        {/* Pending requests */}
        <Card title={fmt(T.requests.title, { n: pending.length })} flat>
          {apptErr ? <Text style={styles.errText}>{apptErr}</Text> : null}
          {pending.length === 0 ? (
            <Text style={styles.empty}>{T.requests.empty}</Text>
          ) : pending.map(a => (
            <View key={a.id} style={styles.reqRow}>
              <View style={styles.reqTop}>
                <Text style={styles.reqName}>{memberName(a.congregant_id)}</Text>
                <Text style={styles.reqType}>{fmt(S.appointments.slotMeta, { type: a.type_label, n: a.duration_minutes })}</Text>
              </View>
              <Text style={styles.reqWhen}>{fmt(S.appointments.dateTime, { date: formatDayLabel(new Date(a.starts_at)), time: formatTime(new Date(a.starts_at)) })}</Text>
              {a.note ? <Text style={styles.reqNote}>{fmt(T.requests.note, { note: a.note })}</Text> : null}
              <View style={styles.reqBtns}>
                <TouchableOpacity style={[styles.smallBtn, styles.confirmBtn]} onPress={() => respond(a, true)}>
                  <Text style={styles.confirmText}>{T.requests.confirm}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, styles.declineBtn]} onPress={() => respond(a, false)}>
                  <Text style={styles.declineText}>{T.requests.decline}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>

        {/* Upcoming confirmed */}
        {upcoming.length > 0 && (
          <Card title={fmt(T.upcoming.title, { n: upcoming.length })} flat>
            {upcoming.map(a => (
              <View key={a.id} style={styles.upRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reqName}>{memberName(a.congregant_id)}</Text>
                  <Text style={styles.reqWhen}>{fmt(T.upcoming.line, { type: a.type_label, date: formatDayLabel(new Date(a.starts_at)), time: formatTime(new Date(a.starts_at)) })}</Text>
                </View>
                <TouchableOpacity hitSlop={8} onPress={() => cancelAppt(a)}><Text style={styles.cancelLink}>{T.upcoming.cancel}</Text></TouchableOpacity>
              </View>
            ))}
          </Card>
        )}

        {/* In-app scheduling console — nothing here matters in Calendly mode,
            so it all steps aside rather than sitting as dead controls. */}
        {mode === 'app' && (<>
        {/* Appointment types */}
        <Card title={T.types.title} titleIcon="✦">
          {types.length === 0 ? (
            <Text style={styles.empty}>{T.types.empty}</Text>
          ) : types.map(t => (
            <View key={t.id} style={styles.listRow}>
              <TouchableOpacity onPress={() => toggleType(t)} style={styles.activePill}>
                <Text style={[styles.activePillText, { color: t.active ? colors.green : colors.faint }]}>{t.active ? T.types.on : T.types.off}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, !t.active && { color: colors.muted }]}>{t.label}</Text>
                <Text style={styles.rowSub}>{plural(T.types.duration, t.duration_minutes)}</Text>
              </View>
              <TouchableOpacity hitSlop={8} onPress={() => removeType(t)}><Text style={styles.removeX}>✕</Text></TouchableOpacity>
            </View>
          ))}
          <View style={styles.divider} />
          <Text style={styles.formLabel}>{T.types.newLabel}</Text>
          <TextInput style={styles.input} placeholder={T.types.newPlaceholder} placeholderTextColor={colors.faint} value={newTypeLabel} onChangeText={setNewTypeLabel} />
          <Text style={[styles.formLabel, { marginTop: 12 }]}>{T.types.lengthLabel}</Text>
          <View style={styles.pillRow}>
            {DURATION_OPTS.map(d => (
              <TouchableOpacity key={d} style={[styles.pill, newTypeDur === d && styles.pillActive]} onPress={() => setNewTypeDur(d)}>
                <Text style={[styles.pillText, newTypeDur === d && styles.pillTextActive]}>{fmt(T.types.durationShort, { n: d })}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.addBtn, !newTypeLabel.trim() && styles.btnDisabled]} onPress={addType} disabled={!newTypeLabel.trim()}>
            <Text style={styles.addBtnText}>{T.types.add}</Text>
          </TouchableOpacity>
        </Card>

        {/* Weekly availability */}
        <Card title={T.weekly.title} titleIcon="◷">
          {rules.length === 0 ? (
            <Text style={styles.empty}>{T.weekly.empty}</Text>
          ) : rules.map(r => (
            <View key={r.id} style={styles.listRow}>
              <TouchableOpacity onPress={() => toggleRule(r)} style={styles.activePill}>
                <Text style={[styles.activePillText, { color: r.active ? colors.green : colors.faint }]}>{r.active ? T.types.on : T.types.off}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, !r.active && { color: colors.muted }]}>{WEEKDAYS[r.weekday]}</Text>
                <Text style={styles.rowSub}>{fmt(T.weekly.windowLine, { range: formatMinuteRange(r.start_minute, r.end_minute), type: typeLabel(r.type_id) })}</Text>
              </View>
              <TouchableOpacity hitSlop={8} onPress={() => removeRule(r)}><Text style={styles.removeX}>✕</Text></TouchableOpacity>
            </View>
          ))}
          <View style={styles.divider} />
          <Text style={styles.formLabel}>{T.weekly.newLabel}</Text>
          {types.filter(t => t.active).length === 0 ? (
            <Text style={styles.hint}>{T.weekly.needType}</Text>
          ) : (
            <>
              <View style={styles.pillRow}>
                {types.filter(t => t.active).map(t => (
                  <TouchableOpacity key={t.id} style={[styles.pill, ruleTypeId === t.id && styles.pillActive]} onPress={() => setRuleTypeId(t.id)}>
                    <Text style={[styles.pillText, ruleTypeId === t.id && styles.pillTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.weekdayRow}>
                {WEEKDAYS_SHORT.map((w, i) => (
                  <TouchableOpacity key={i} style={[styles.dayPill, ruleWeekday === i && styles.pillActive]} onPress={() => setRuleWeekday(i)}>
                    <Text style={[styles.pillText, ruleWeekday === i && styles.pillTextActive]}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.pickerGroup}>
                <TimePicker label={T.weekly.start} options={START_OPTIONS} value={ruleStart} onChange={v => moveFrom(v, ruleEnd, setRuleStart, setRuleEnd)} />
                <TimePicker label={T.weekly.end} options={END_OPTIONS} value={ruleEnd} onChange={v => moveTo(v, ruleStart, setRuleEnd)} />
              </View>
              {ruleErr ? <Text style={styles.errText}>{ruleErr}</Text> : null}
              <TouchableOpacity style={styles.addBtn} onPress={addRule}>
                <Text style={styles.addBtnText}>{T.weekly.add}</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Date exceptions — one-off closures over the recurring schedule */}
        <Card title={T.days.title} titleIcon="⊘">
          <Text style={styles.empty}>
            {T.days.intro}
          </Text>

          <View style={styles.monthNav}>
            <TouchableOpacity
              style={[styles.navBtn, !canGoBack && styles.btnDisabled]}
              disabled={!canGoBack}
              onPress={() => { H.tap(); setSelectedDay(null); setCalMonth(m => addMonths(m, -1)); }}
              hitSlop={8}
            >
              <Text style={styles.navBtnText}>{GLYPH.back}</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthLabel(calMonth)}</Text>
            <TouchableOpacity
              style={[styles.navBtn, !canGoForward && styles.btnDisabled]}
              disabled={!canGoForward}
              onPress={() => { H.tap(); setSelectedDay(null); setCalMonth(m => addMonths(m, 1)); }}
              hitSlop={8}
            >
              <Text style={styles.navBtnText}>{GLYPH.forward}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calHeadRow}>
            {WEEKDAYS_SHORT.map((w, i) => (
              <Text key={w} style={styles.calHead}>{WEEKDAY_INITIALS[i]}</Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {monthCells(calMonth.getFullYear(), calMonth.getMonth()).map((d, i) => {
              if (!d) return <View key={`pad-${i}`} style={styles.calCell} />;
              const past = dateKey(d) < todayKey;
              const allDay = isClosedAllDay(exceptions, d);
              const partial = !allDay && closuresOn(exceptions, d).length > 0;
              const extra = !allDay && extraWindowsOn(exceptions, d).length > 0;
              const available = weekdayHasAvailability(d);
              const sel = selectedDay != null && dateKey(selectedDay) === dateKey(d);
              return (
                <TouchableOpacity
                  key={dateKey(d)}
                  style={[
                    styles.calCell,
                    available && !past && styles.calCellAvail,
                    extra && !past && styles.calCellExtra,
                    allDay && styles.calCellClosed,
                    partial && styles.calCellPartial,
                    sel && styles.calCellSelected,
                  ]}
                  disabled={past}
                  activeOpacity={0.8}
                  onPress={() => { H.tap(); setExErr(''); setSelectedDay(sel ? null : d); }}
                >
                  <Text style={[
                    styles.calCellText,
                    past && styles.calCellTextPast,
                    allDay && styles.calCellTextClosed,
                  ]}>{d.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendSwatch, styles.calCellAvail]} /><Text style={styles.legendText}>{T.days.legend.open}</Text>
            <View style={[styles.legendSwatch, styles.calCellExtra]} /><Text style={styles.legendText}>{T.days.legend.extra}</Text>
            <View style={[styles.legendSwatch, styles.calCellPartial]} /><Text style={styles.legendText}>{T.days.legend.partial}</Text>
            <View style={[styles.legendSwatch, styles.calCellClosed]} /><Text style={styles.legendText}>{T.days.legend.closed}</Text>
          </View>

          {selectedDay && (
            <View style={styles.dayPanel}>
              <Text style={styles.dayPanelTitle}>
                {fmtDate(selectedDay, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              {!weekdayHasAvailability(selectedDay) && selectedDayExtras.length === 0 && (
                <Text style={styles.hint}>
                  {T.days.noRecurring}
                </Text>
              )}

              {selectedDayClosures.length > 0 && (
                <>
                  {selectedDayClosures.map(ex => (
                    <View key={ex.id} style={styles.listRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>
                          {ex.start_minute == null ? T.days.closedAllDay : fmt(T.days.closedRange, { range: formatMinuteRange(ex.start_minute!, ex.end_minute!) })}
                        </Text>
                        {ex.note ? <Text style={styles.rowSub}>{ex.note}</Text> : null}
                      </View>
                      <TouchableOpacity hitSlop={8} onPress={() => removeException(ex)}>
                        <Text style={styles.removeX}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity style={styles.reopenBtn} onPress={() => reopenDay(selectedDay)}>
                    <Text style={styles.reopenBtnText}>{T.days.reopen}</Text>
                  </TouchableOpacity>
                </>
              )}

              {!isClosedAllDay(exceptions, selectedDay) && (
                <>
                  <TouchableOpacity style={styles.closeDayBtn} onPress={() => closeWholeDay(selectedDay)}>
                    <Text style={styles.closeDayBtnText}>{T.days.closeWholeDay}</Text>
                  </TouchableOpacity>
                  <Text style={[styles.formLabel, { marginTop: 14 }]}>{T.days.orClosePart}</Text>
                  <View style={styles.pickerGroup}>
                    <TimePicker label={T.days.from} options={START_OPTIONS} value={exStart} onChange={v => moveFrom(v, exEnd, setExStart, setExEnd)} />
                    <TimePicker label={T.days.to} options={END_OPTIONS} value={exEnd} onChange={v => moveTo(v, exStart, setExEnd)} />
                  </View>
                  {exErr ? <Text style={styles.errText}>{exErr}</Text> : null}
                  <TouchableOpacity style={styles.addBtn} onPress={() => closePartOfDay(selectedDay)}>
                    <Text style={styles.addBtnText}>{T.days.closeThisTime}</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Extra hours — the other direction: time this date offers that
                  the weekly pattern doesn't. */}
              <View style={styles.divider} />
              {selectedDayExtras.map(ex => (
                <View key={ex.id} style={styles.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitleExtra}>
                      {fmt(T.days.extraRange, { range: formatMinuteRange(ex.start_minute!, ex.end_minute!) })}
                    </Text>
                    <Text style={styles.rowSub}>{typeLabel(ex.type_id)}</Text>
                  </View>
                  <TouchableOpacity hitSlop={8} onPress={() => removeException(ex)}>
                    <Text style={styles.removeX}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {isClosedAllDay(exceptions, selectedDay) ? (
                <Text style={styles.hint}>{T.days.closedHint}</Text>
              ) : activeTypes.length === 0 ? (
                <Text style={styles.hint}>{T.days.needTypeForExtra}</Text>
              ) : (
                <>
                  <Text style={styles.formLabel}>{T.days.openExtraLabel}</Text>
                  <View style={styles.pillRow}>
                    {activeTypes.map(t => {
                      const on = (addTypeId ?? activeTypes[0].id) === t.id;
                      return (
                        <TouchableOpacity key={t.id} style={[styles.pill, on && styles.pillActive]} onPress={() => { H.tap(); setAddTypeId(t.id); }}>
                          <Text style={[styles.pillText, on && styles.pillTextActive]}>{t.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.pickerGroup}>
                    <TimePicker label={T.days.from} options={START_OPTIONS} value={addStart} onChange={v => moveFrom(v, addEnd, setAddStart, setAddEnd)} />
                    <TimePicker label={T.days.to} options={END_OPTIONS} value={addEnd} onChange={v => moveTo(v, addStart, setAddEnd)} />
                  </View>
                  {addErr ? <Text style={styles.errText}>{addErr}</Text> : null}
                  <TouchableOpacity style={styles.openHoursBtn} onPress={() => openExtraHours(selectedDay)}>
                    <Text style={styles.openHoursBtnText}>{T.days.openThisTime}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </Card>

        </>)}

        {/* Calendly mode: the link IS the booking system, so it is the one
            thing to configure. */}
        {mode === 'calendly' && (
        <Card title={T.calendly.title} titleIcon={isRTL ? '↖' : '↗'}>
          <Text style={styles.empty}>
            {T.calendly.intro}
          </Text>
          {!calendly && (
            <Text style={styles.errText}>
              {T.calendly.noLink}
            </Text>
          )}
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder={T.calendly.placeholder}
            placeholderTextColor={colors.faint}
            value={calendlyDraft}
            onChangeText={setCalendlyDraft}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {calendlyErr ? <Text style={styles.errText}>{calendlyErr}</Text> : null}
          {calendlyMsg ? <Text style={styles.savedMsg}>{calendlyMsg}</Text> : null}
          <TouchableOpacity
            style={[styles.addBtn, (!calendlyDraft.trim() || calendlyDraft.trim() === calendly) && styles.btnDisabled]}
            onPress={saveCalendly}
            disabled={!calendlyDraft.trim() || calendlyDraft.trim() === calendly}
          >
            <Text style={styles.addBtnText}>{calendly ? T.calendly.update : T.calendly.save}</Text>
          </TouchableOpacity>
          {calendly && (
            <View style={styles.calendlyLinks}>
              <TouchableOpacity hitSlop={8} onPress={() => { H.tap(); Linking.openURL(calendly); }}>
                <Text style={styles.calendlyOpen}>{T.calendly.open}</Text>
              </TouchableOpacity>
              <TouchableOpacity hitSlop={8} onPress={removeCalendly}>
                <Text style={styles.calendlyRemove}>{S.common.remove}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
        )}

        {/* Calendar sync — app mode only, since only in-app bookings are ours
            to write. Framed generically: the priest's life lives in his own
            calendar, and anything else that reads it (a Calendly kept for a
            different audience included, since Calendly hides slots that
            collide with its connected calendar) sees the time as taken. */}
        {mode === 'app' && (
        <Card title={T.sync.title} titleIcon="⇄">
          <Text style={styles.empty}>
            {T.sync.intro}
          </Text>
          {!calendarSyncSupported ? (
            <Text style={styles.hint}>{T.sync.webOnly}</Text>
          ) : demoMode ? (
            <Text style={styles.hint}>{T.sync.demo}</Text>
          ) : (
            <>
              {syncCal ? (
                <View style={styles.calendlyLinks}>
                  <Text style={styles.syncOnText}>{fmt(T.sync.writingTo, { title: syncCal.title })}</Text>
                  <TouchableOpacity hitSlop={8} onPress={disableCalendarSync}>
                    <Text style={styles.calendlyRemove}>{T.sync.turnOff}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {syncWarn ? <Text style={styles.errText}>{fmt(T.sync.warning, { message: syncWarn })}</Text> : null}
              {calChoices === 'denied' ? (
                <Text style={styles.errText}>
                  {T.sync.denied}
                </Text>
              ) : calChoices === 'error' ? (
                <Text style={styles.errText}>{T.sync.readError}</Text>
              ) : calChoices && calChoices.length === 0 ? (
                <Text style={styles.errText}>{T.sync.noCalendars}</Text>
              ) : calChoices ? (
                calChoices.map(c => (
                  <TouchableOpacity key={c.id} style={styles.calChoiceRow} onPress={() => pickCalendar(c)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.calChoiceTitle}>{c.title}</Text>
                      {c.source ? <Text style={styles.rowSub}>{c.source}</Text> : null}
                    </View>
                    {syncCal?.id === c.id ? <Text style={styles.calendlyOpen}>✓</Text> : null}
                  </TouchableOpacity>
                ))
              ) : null}
              {syncMsg ? <Text style={styles.savedMsg}>{syncMsg}</Text> : null}
              <TouchableOpacity style={styles.addBtn} onPress={calChoices ? () => { H.tap(); setCalChoices(null); } : openCalendarPicker}>
                <Text style={styles.addBtnText}>
                  {calChoices ? T.sync.close : syncCal ? T.sync.change : T.sync.choose}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Time picker ──────────────────────────────────────────────
// Stepping a whole afternoon 15 minutes at a time took dozens of taps, so times
// are scrolled instead — the same snap-scrolling picker used for "fast until"
// in the canon builder and new-cards-per-day in Psalms.
function TimePicker({ label, value, onChange, options }: {
  label: string; value: number; onChange: (v: number) => void; options: string[];
}) {
  return (
    <View style={styles.picker}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <ScrollPicker
        options={options}
        value={formatMinute(value)}
        onChange={s => onChange(minutesFor(s))}
      />
    </View>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  topbar: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  titleFill: { flex: 1, marginEnd: 12 },
  chipBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  chipBtnText: { fontSize: 18, color: colors.gold },
  pageTitle: { fontFamily: fonts.cormorantMedium, fontSize: 28, color: colors.cream },

  masterCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  masterOn: { backgroundColor: colors.greenBg, borderColor: colors.green },
  masterOff: { backgroundColor: colors.surface, borderColor: colors.border },
  masterTitle: { fontFamily: fonts.latoBold, fontSize: 15, marginBottom: 3 },
  masterSub: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 16 },

  empty: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 18, paddingVertical: 4 },
  hint: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 18 },

  // request rows
  reqRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  reqTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  reqName: { fontFamily: fonts.latoBold, fontSize: 14, color: colors.cream },
  reqType: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.gold },
  reqWhen: { fontFamily: fonts.lato, fontSize: 12, color: colors.muted, marginTop: 2 },
  reqNote: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 4 },
  reqBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  smallBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  confirmBtn: { backgroundColor: colors.greenBg, borderColor: colors.green },
  confirmText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.green },
  declineBtn: { backgroundColor: 'rgba(192,57,43,0.15)', borderColor: colors.red },
  declineText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.red },

  upRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  cancelLink: { fontFamily: fonts.lato, fontSize: 12, color: colors.red },

  // generic list rows
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  activePill: { minWidth: 40, paddingHorizontal: 6, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.panel },
  activePillText: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 0.5 },
  rowTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream },
  rowSub: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 1 },
  removeX: { fontFamily: fonts.latoBold, fontSize: 14, color: colors.red, paddingHorizontal: 4 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  formLabel: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold, opacity: 0.8, marginBottom: 8 },
  input: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 13, padding: 12 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  pillText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.muted },
  pillTextActive: { color: colors.goldLight },

  weekdayRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dayPill: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },

  pickerGroup: { marginTop: 14 },
  picker: { marginBottom: 6 },
  pickerLabel: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, marginBottom: 2 },

  errText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.red, marginTop: 10 },
  savedMsg: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.green, marginTop: 10 },
  calendlyLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  calendlyOpen: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.gold },
  calendlyRemove: { fontFamily: fonts.lato, fontSize: 12, color: colors.red },
  syncOnText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.green, flex: 1 },
  modeOpt: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: colors.panel },
  modeOptOn: { borderColor: colors.gold, backgroundColor: colors.goldDim },
  modeRadio: { fontSize: 16, color: colors.muted, marginTop: 1 },
  modeTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 2 },
  modeSub: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 15 },
  calChoiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  calChoiceTitle: { fontFamily: fonts.lato, fontSize: 13, color: colors.cream },
  addBtn: { backgroundColor: colors.gold, borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 16 },
  addBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.navy, letterSpacing: 0.8 },
  btnDisabled: { opacity: 0.35 },

  // ── Days Away calendar ──
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  navBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  navBtnText: { fontSize: 18, color: colors.gold, lineHeight: 20 },
  monthTitle: { fontFamily: fonts.cormorantMedium, fontSize: 19, color: colors.cream },

  calHeadRow: { flexDirection: 'row' },
  calHead: { flex: 1, textAlign: 'center', fontFamily: fonts.latoBold, fontSize: 10, color: colors.muted, paddingBottom: 6 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  calCellAvail: { backgroundColor: colors.goldDim, borderColor: colors.gold + '55' },
  calCellExtra: { backgroundColor: colors.greenBg, borderColor: colors.green },
  calCellPartial: { backgroundColor: 'rgba(196,130,26,0.22)', borderColor: '#C4821A' },
  calCellClosed: { backgroundColor: colors.surface, borderColor: colors.red + '77' },
  calCellSelected: { borderColor: colors.cream, borderWidth: 2 },
  calCellText: { fontFamily: fonts.lato, fontSize: 13, color: colors.cream },
  calCellTextPast: { color: colors.faint },
  calCellTextClosed: { color: colors.red, textDecorationLine: 'line-through' },

  legendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3, borderWidth: 1 },
  legendText: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, marginRight: 8 },

  dayPanel: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  dayPanelTitle: { fontFamily: fonts.cormorantMedium, fontSize: 18, color: colors.cream, marginBottom: 10 },
  closeDayBtn: { borderWidth: 1, borderColor: colors.red + '88', borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 12 },
  closeDayBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.red, letterSpacing: 0.8 },
  reopenBtn: { borderWidth: 1, borderColor: colors.green, borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 12 },
  reopenBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.green, letterSpacing: 0.8 },
  openHoursBtn: { backgroundColor: colors.greenBg, borderWidth: 1, borderColor: colors.green, borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 16 },
  openHoursBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.green, letterSpacing: 0.8 },
  rowTitleExtra: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.green },
}));
