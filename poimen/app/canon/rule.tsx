// app/canon/rule.tsx
// The congregant's *personal* prayer rule (Canon), set with their father of
// confession. Ported from Nepsis and re-skinned to Poimen. "Today" shows the
// items due today (built from the rule for this weekday); "Edit" configures the
// rule per day of the week. Distinct from the priest-assigned canon on the tab.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { goBack } from '@/lib/nav';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { useSession } from '@/lib/auth';
import { useDemoMode } from '@/lib/demo';
import {
  RuleConfig, DayPlan, ServiceCommitment, loadRule, saveRule,
  AGPEYA_HOURS, SERVICES, CONFESSION_OPTIONS, SERVICE_FREQUENCY_OPTIONS,
  FAST_UNTIL_OPTIONS, WEEKDAY_NAMES, MAX_SERVICE_COUNT, setServicesMode,
  freqLabel, fastUntilLabel, ReadMode,
} from '@/lib/canon/rule-store';
import { periodUnit, maxPerPeriod } from '@/lib/canon/periods';
import { hydrateRuleFromCloud, pushRuleToCloud } from '@/lib/canon/rule-sync';
import {
  AssignedCategory, AssignedCanon, loadAssignedForMember, applyOverlay,
} from '@/lib/canon/assigned';
import { lastConfessionDate } from '@/lib/confession/dates';
import ScrollPicker from '@/components/ui/ScrollPicker';
import { S, fmt, plural, GLYPH } from '@/lib/i18n';

const T = S.canon.rule;

// The picker shows the translated time; what is saved is still the option at
// the same position in FAST_UNTIL_OPTIONS.
const FAST_UNTIL_LABELS = FAST_UNTIL_OPTIONS.map(fastUntilLabel);

// A locked reading amount: "3 chapters", "15 minutes".
const readAmount = (mode: ReadMode, n: number) => plural(mode === 'chapters' ? T.amountChapters : T.amountMinutes, n);
const minutesShort = (n: number) => plural(T.minutesShort, n);
// A locked counted service, one sentence per frequency (an unknown one reads
// as weekly, as periodUnit does).
const lockedCountFor = (freq: string) => (T.lockedCount as Record<string, string>)[freq] ?? T.lockedCount.Weekly;

const SP = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 };
const R = { md: 10, lg: 12, full: 999 };

// ─── Small controls ───────────────────────────────────────────────────────────

function Stepper({ value, onChange, min = 0, max = 999, step = 1, format }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; format?: (n: number) => string;
}) {
  return (
    <View style={s.stepperRow}>
      <TouchableOpacity style={s.stepBtn} onPress={() => onChange(Math.max(min, value - step))}>
        <Text style={s.stepBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={s.stepValue}>{format ? format(value) : value}</Text>
      <TouchableOpacity style={s.stepBtn} onPress={() => onChange(Math.min(max, value + step))}>
        <Text style={s.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.chip, { borderColor: on ? colors.gold : colors.border, backgroundColor: on ? colors.gold : 'transparent' }]}
      onPress={onPress}
    >
      <Text style={{ color: on ? colors.navy : colors.textSecond, fontSize: 12, fontFamily: fonts.latoBold }}>{label}</Text>
    </TouchableOpacity>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// A short note shown under any part the Father of Confession has assigned. That
// part is read-only until the member's next confession, or until the FOC
// changes/removes it.
function LockNote() {
  return (
    <View style={s.lockNote}>
      <Text style={s.lockNoteText}>
        {T.lockNote}
      </Text>
    </View>
  );
}

// Read-only value pill for a locked "every day" field.
function LockedValue({ text }: { text: string }) {
  return <View style={s.lockedPill}><Text style={s.lockedPillText}>{text}</Text></View>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Which part of the rule a Spiritual Vitals row corresponds to. A member who
// taps "Spiritual Book — not in your rule yet" on the dashboard lands here,
// scrolled to the thing they tapped, rather than at the top of a 570-line
// editor with no indication of where to look.
const FOCUS_ANCHOR: Record<string, 'everyday' | 'services' | 'days'> = {
  book: 'everyday', quiet: 'everyday', scripture: 'everyday', fasting: 'everyday',
  liturgy: 'services', communion: 'services',
  service: 'days', prayer: 'days',
};

export default function RuleScreen() {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const scroller = useRef<ScrollView>(null);
  const anchorY = useRef<Record<string, number>>({});
  const scrolled = useRef(false);

  // Runs on the layout that reports the anchor, so it fires once the position
  // is actually known rather than guessing at a delay.
  const onAnchorLayout = (name: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
    anchorY.current[name] = e.nativeEvent.layout.y;
    const want = focus ? FOCUS_ANCHOR[focus] : undefined;
    if (!want || scrolled.current || want !== name) return;
    scrolled.current = true;
    // A little above the heading, so it does not sit flush against the header.
    scroller.current?.scrollTo({ y: Math.max(0, e.nativeEvent.layout.y - 12), animated: true });
  };

  const { user, profile } = useSession();
  const { demoMode } = useDemoMode();
  const canSync = !!user && !demoMode;

  const [rule, setRule] = useState<RuleConfig | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  // What the Father of Confession has assigned, kept as inputs so the overlay
  // can be RE-derived on every edit. Holding the overlay in state instead let
  // it go stale the moment the member changed anything (most visibly: flipping
  // the services mode left the weekday editor rendering against the old mode).
  const [assigned, setAssigned] = useState<AssignedCanon[]>([]);
  const [lastConf, setLastConf] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (canSync && user) await hydrateRuleFromCloud(user.id);
      const r = await loadRule();
      const [a, last] = await Promise.all([
        loadAssignedForMember(user?.id ?? '', demoMode, profile?.foc_id),
        lastConfessionDate(),
      ]);
      setAssigned(a);
      setLastConf(last);
      setRule(r);
    })();
  }, [canSync, user, demoMode]);

  const overlay = useMemo(
    () => (rule ? applyOverlay(rule, assigned, lastConf) : null),
    [rule, assigned, lastConf],
  );
  const effRule = overlay?.rule ?? null;
  const lockedCats = overlay?.lockedCategories ?? new Set<AssignedCategory>();
  const lockedDays = overlay?.lockedDays ?? { agpeya_hours: new Set<number>(), services: new Set<number>(), heart_of_service: new Set<number>() };
  // The priest fixes HOW services are committed whenever he has assigned any —
  // including a weekday assignment, which locks only its own days but still
  // takes the days-vs-counts choice out of the member's hands.
  const servicesModeLocked = overlay?.servicesModeLocked ?? false;

  const isLocked = (c: AssignedCategory) => lockedCats.has(c);
  const isDayLocked = (c: 'agpeya_hours' | 'services' | 'heart_of_service', i: number) => lockedDays[c].has(i);
  const anyLock = lockedCats.size > 0 || (['agpeya_hours', 'services', 'heart_of_service'] as const).some(c => lockedDays[c].size > 0);

  // Every edit autosaves immediately (no separate Save button) — but with no
  // feedback anywhere, that's indistinguishable from edits not sticking at
  // all. This surfaces what's actually happening in the header.
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const update = useCallback((next: RuleConfig) => {
    setRule(next);
    setSaveState('saving');
    saveRule(next).then(() => {
      setSaveState('saved');
      if (canSync && user) pushRuleToCloud(user.id, next);
    });
  }, [canSync, user]);

  if (!rule || !effRule) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><ActivityIndicator color={colors.gold} /></View>
      </SafeAreaView>
    );
  }

  const today = new Date().getDay();

  // ─── Editor ───────────────────────────────────────────────────────────────────
  const setDay = (i: number, patch: Partial<DayPlan>) => {
    const days = rule.days.map((d, idx) => (idx === i ? { ...d, ...patch } : d));
    update({ ...rule, days });
  };
  const toggleIn = (arr: string[], k: string) => (arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);
  const patchServing = (dayIdx: number, j: number, patch: Partial<ServiceCommitment>) => {
    const serving = rule.days[dayIdx].serving.map((e, idx) => (idx === j ? { ...e, ...patch } : e));
    setDay(dayIdx, { serving });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => goBack('/(tabs)/canon')} hitSlop={8}>
          <Text style={s.headerBack}>{GLYPH.back} {T.backToCanon}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{T.title}</Text>
        <View style={{ minWidth: 54, alignItems: 'flex-end' }}>
          {saveState !== 'idle' && (
            <Text style={s.saveStatus}>{saveState === 'saving' ? S.common.saving : T.savedTick}</Text>
          )}
        </View>
      </View>
      <ScrollView ref={scroller} contentContainerStyle={{ padding: SP.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Text style={s.note}>
          {T.intro}
        </Text>

        {anyLock && (
          <View style={s.banner}>
            <Text style={s.bannerText}>
              {T.lockBanner}
            </Text>
          </View>
        )}

        {/* Daily */}
        <Text style={s.sectionLabel} onLayout={onAnchorLayout('everyday')}>{T.everyDay}</Text>
        {isLocked('prostrations') ? (
          <>
            <FieldRow label={T.prostrations}><LockedValue text={`${effRule.prostrations}`} /></FieldRow>
            <LockNote />
          </>
        ) : (
          <>
            <FieldRow label={T.prostrations}>
              <Stepper value={rule.prostrations} onChange={n => update({ ...rule, prostrations: n })} max={500} />
            </FieldRow>
            <Text style={s.fieldNote}>{T.prostrationsNote}</Text>
          </>
        )}
        {isLocked('quiet') ? (
          <>
            <FieldRow label={T.quietTime}><LockedValue text={minutesShort(effRule.quietMinutes)} /></FieldRow>
            <LockNote />
          </>
        ) : (
          <FieldRow label={T.quietTime}>
            <Stepper value={rule.quietMinutes} onChange={n => update({ ...rule, quietMinutes: n })} step={5} max={180} format={minutesShort} />
          </FieldRow>
        )}

        {/* Fasting */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>{T.fastUntil}</Text>
            <Text style={[s.cardTitle, { color: colors.goldLight }]}>{fastUntilLabel(isLocked('fasting') ? effRule.fastUntil : rule.fastUntil)}</Text>
          </View>
          {isLocked('fasting') ? (
            <LockNote />
          ) : (
            <>
              <ScrollPicker options={FAST_UNTIL_LABELS} value={fastUntilLabel(rule.fastUntil)} onChange={v => update({ ...rule, fastUntil: FAST_UNTIL_OPTIONS[FAST_UNTIL_LABELS.indexOf(v)] ?? rule.fastUntil })} />
              <Text style={[s.fieldNote, { marginTop: 4 }]}>
                {T.fastNote}
              </Text>
            </>
          )}
        </View>

        {/* Bible reading */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{T.bibleReading}</Text>
          {isLocked('bible') ? (
            <><LockedValue text={readAmount(effRule.bible.mode, effRule.bible.amount)} /><LockNote /></>
          ) : (
            <View style={s.chipRow}>
              <Chip label={T.chapters} on={rule.bible.mode === 'chapters'} onPress={() => update({ ...rule, bible: { ...rule.bible, mode: 'chapters' } })} />
              <Chip label={T.minutes}  on={rule.bible.mode === 'minutes'}  onPress={() => update({ ...rule, bible: { ...rule.bible, mode: 'minutes' } })} />
              <View style={{ flex: 1 }} />
              <Stepper value={rule.bible.amount} onChange={n => update({ ...rule, bible: { ...rule.bible, amount: n } })} step={rule.bible.mode === 'minutes' ? 5 : 1} max={180} />
            </View>
          )}
        </View>

        {/* Spiritual book */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>{T.spiritualBook}</Text>
            {!isLocked('book') && (rule.book ? (
              <TouchableOpacity onPress={() => update({ ...rule, book: null })}><Text style={{ color: colors.red, fontSize: 12, fontFamily: fonts.lato }}>{S.common.remove}</Text></TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => update({ ...rule, book: { title: '', mode: 'chapters', amount: 1 } })}><Text style={{ color: colors.gold, fontSize: 12, fontFamily: fonts.latoBold }}>{T.addPlus}</Text></TouchableOpacity>
            ))}
          </View>
          {isLocked('book') && (
            <><LockedValue text={effRule.book ? fmt(T.lockedBook, { title: effRule.book.title || T.lockedBookFallback, amount: readAmount(effRule.book.mode, effRule.book.amount) }) : S.common.none} /><LockNote /></>
          )}
          {!isLocked('book') && rule.book && (
            <>
              <TextInput
                style={s.input}
                placeholder={T.bookPlaceholder}
                placeholderTextColor={colors.muted}
                value={rule.book.title}
                onChangeText={t => update({ ...rule, book: { ...rule.book!, title: t } })}
              />
              <View style={[s.chipRow, { marginTop: SP.sm }]}>
                <Chip label={T.chapters} on={rule.book.mode === 'chapters'} onPress={() => update({ ...rule, book: { ...rule.book!, mode: 'chapters' } })} />
                <Chip label={T.minutes}  on={rule.book.mode === 'minutes'}  onPress={() => update({ ...rule, book: { ...rule.book!, mode: 'minutes' } })} />
                <View style={{ flex: 1 }} />
                <Stepper value={rule.book.amount} onChange={n => update({ ...rule, book: { ...rule.book!, amount: n } })} step={rule.book.mode === 'minutes' ? 5 : 1} max={180} />
              </View>
            </>
          )}
        </View>

        {/* Confession */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{T.confessionFrequency}</Text>
          {isLocked('confession') ? (
            <><LockedValue text={freqLabel(effRule.confession)} /><LockNote /></>
          ) : (
            <View style={[s.chipRow, { flexWrap: 'wrap' }]}>
              {CONFESSION_OPTIONS.map(opt => (
                <Chip key={opt} label={freqLabel(opt)} on={rule.confession === opt} onPress={() => update({ ...rule, confession: opt })} />
              ))}
            </View>
          )}
        </View>

        {/* Church services — specific days OR a number of times per week */}
        <View style={s.card}>
          <Text style={s.sectionLabel} onLayout={onAnchorLayout('services')}>{T.churchServices}</Text>
          {isLocked('services') ? (
            <>
              {effRule.servicesMode === 'counts' ? (
                <View style={[s.chipRow, { flexWrap: 'wrap' }]}>
                  {SERVICES.filter(sv => (effRule.serviceCounts?.[sv.key]?.n ?? 0) > 0).length === 0
                    ? <Text style={s.mutedSmall}>{S.common.none}</Text>
                    : SERVICES.filter(sv => (effRule.serviceCounts?.[sv.key]?.n ?? 0) > 0).map(sv => (
                        <View key={sv.key} style={s.roChip}>
                          <Text style={s.roChipText}>{fmt(lockedCountFor(effRule.serviceCounts[sv.key].freq), { service: sv.name, n: effRule.serviceCounts[sv.key].n })}</Text>
                        </View>
                      ))}
                </View>
              ) : (
                <Text style={s.mutedSmall}>{T.setOnDaysBelow}</Text>
              )}
              <LockNote />
            </>
          ) : servicesModeLocked ? (
            // The priest assigned services by specific weekdays: he owns HOW
            // they're committed, so the mode can't be switched here. Only the
            // weekdays he didn't set stay editable, in the day cards below.
            <>
              <Text style={s.mutedSmall}>{T.setOnDaysBelow}</Text>
              <LockNote />
            </>
          ) : (
            <>
              <Text style={s.helpText}>
                {T.servicesHelp}
              </Text>
              <View style={[s.chipRow, { marginTop: SP.sm }]}>
                <Chip label={T.specificDays} on={rule.servicesMode === 'days'}
                  onPress={() => update(setServicesMode(rule, 'days'))} />
                <Chip label={T.timesPerWeek} on={rule.servicesMode === 'counts'}
                  onPress={() => update(setServicesMode(rule, 'counts'))} />
              </View>
              {rule.servicesMode === 'counts' && (
                <View style={{ marginTop: SP.sm }}>
                  {SERVICES.map(sv => {
                    // Each service carries its own cadence, so communion can be
                    // monthly while liturgy stays weekly — the frequencies are
                    // the same set Heart of Service and confession already use.
                    const cfg = rule.serviceCounts?.[sv.key];
                    const freq = cfg?.freq ?? 'Weekly';
                    const setCount = (n: number, f = freq) => {
                      const counts = { ...(rule.serviceCounts ?? {}) };
                      if (n > 0) counts[sv.key] = { n: Math.min(n, maxPerPeriod(f)), freq: f };
                      else delete counts[sv.key];
                      update({ ...rule, serviceCounts: counts });
                    };
                    return (
                      <View key={sv.key} style={{ marginBottom: SP.sm }}>
                        <FieldRow label={sv.name}>
                          <Stepper
                            value={cfg?.n ?? 0}
                            onChange={n => setCount(n)}
                            max={maxPerPeriod(freq)}
                            format={n => fmt(S.canon.countWithUnit, { n, unit: periodUnit(freq, S.canon.periodUnits) })}
                          />
                        </FieldRow>
                        {(cfg?.n ?? 0) > 0 && (
                          <View style={[s.chipRow, { flexWrap: 'wrap', marginTop: 6 }]}>
                            {SERVICE_FREQUENCY_OPTIONS.map(f => (
                              <Chip key={f} label={freqLabel(f)} on={freq === f}
                                onPress={() => setCount(cfg?.n ?? 1, f)} />
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                  <Text style={s.helpText}>
                    {T.countsHelp}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* By day of week */}
        <Text style={[s.sectionLabel, { marginTop: SP.lg }]}>{T.eachDay}</Text>
        <View onLayout={onAnchorLayout('days')} />
        {WEEKDAY_NAMES.map((name, i) => {
          const d = rule.days[i];
          const ed = effRule.days[i];   // effective (includes any FOC-locked parts) — for the summary
          const open = expandedDay === i;
          const autoFast = i === 3 || i === 5;
          const serveCount = ed.serving.filter(x => x.text.trim()).length;
          const summary = [
            ed.hours.length ? plural(T.summaryHours, ed.hours.length) : null,
            effRule.servicesMode === 'days' && ed.services.length ? plural(T.summaryServices, ed.services.length) : null,
            serveCount ? plural(T.summaryServing, serveCount) : null,
            autoFast ? T.summaryFastDay : null,
          ].filter(Boolean).join(' · ') || T.summaryNothing;
          return (
            <View key={i} style={[s.dayCard, { borderColor: open ? colors.gold : colors.border }]}>
              <TouchableOpacity style={s.dayHead} onPress={() => setExpandedDay(open ? null : i)}>
                <View>
                  <Text style={s.dayName}>{i === today ? fmt(T.dayToday, { day: name }) : name}</Text>
                  <Text style={s.daySummary}>{summary}</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 16 }}>{open ? '▲' : '▾'}</Text>
              </TouchableOpacity>

              {open && (
                <View style={{ paddingTop: SP.sm }}>
                  {/* Agpeya hours */}
                  <Text style={s.subLabel}>{T.agpeyaHours}</Text>
                  {isDayLocked('agpeya_hours', i) ? (
                    <>
                      <View style={[s.chipRow, { flexWrap: 'wrap' }]}>
                        {effRule.days[i].hours.length === 0
                          ? <Text style={s.mutedSmall}>{S.common.none}</Text>
                          : AGPEYA_HOURS.filter(h => effRule.days[i].hours.includes(h.key)).map(h => (
                              <View key={h.key} style={s.roChip}><Text style={s.roChipText}>{h.name}</Text></View>
                            ))}
                      </View>
                      <LockNote />
                    </>
                  ) : (
                    <View style={[s.chipRow, { flexWrap: 'wrap' }]}>
                      {AGPEYA_HOURS.map(h => (
                        <Chip key={h.key} label={h.name} on={d.hours.includes(h.key)} onPress={() => setDay(i, { hours: toggleIn(d.hours, h.key) })} />
                      ))}
                    </View>
                  )}

                  {/* Church services — only when committed by specific days;
                      in "times per week" mode they live in the card above. */}
                  <Text style={[s.subLabel, { marginTop: SP.sm }]}>{T.churchServices}</Text>
                  {effRule.servicesMode === 'counts' ? (
                    <Text style={s.mutedSmall}>{T.setAsCountsAbove}</Text>
                  ) : isDayLocked('services', i) ? (
                    <>
                      <View style={[s.chipRow, { flexWrap: 'wrap' }]}>
                        {effRule.days[i].services.length === 0
                          ? <Text style={s.mutedSmall}>{S.common.none}</Text>
                          : SERVICES.filter(sv => effRule.days[i].services.includes(sv.key)).map(sv => (
                              <View key={sv.key} style={s.roChip}><Text style={s.roChipText}>{sv.name}</Text></View>
                            ))}
                      </View>
                      <LockNote />
                    </>
                  ) : (
                    <View style={[s.chipRow, { flexWrap: 'wrap' }]}>
                      {SERVICES.map(sv => (
                        <Chip key={sv.key} label={sv.name} on={d.services.includes(sv.key)} onPress={() => setDay(i, { services: toggleIn(d.services, sv.key) })} />
                      ))}
                    </View>
                  )}

                  {/* Heart of Service */}
                  {isDayLocked('heart_of_service', i) ? (
                    <>
                      <Text style={[s.subLabel, { marginTop: SP.sm }]}>{T.heartOfService}</Text>
                      {effRule.days[i].serving.filter(x => x.text.trim()).length === 0
                        ? <Text style={s.mutedSmall}>{S.common.none}</Text>
                        : effRule.days[i].serving.filter(x => x.text.trim()).map((sv, j) => (
                            <View key={j} style={s.roChip}><Text style={s.roChipText}>{sv.freq ? fmt(T.servingWithFreq, { text: sv.text, freq: freqLabel(sv.freq) }) : sv.text}</Text></View>
                          ))}
                      <LockNote />
                    </>
                  ) : (
                    <>
                      <View style={s.serveHead}>
                        <Text style={[s.subLabel, { marginBottom: 0 }]}>{T.heartOfService}</Text>
                        <TouchableOpacity onPress={() => setDay(i, { serving: [...d.serving, { text: '', freq: 'Weekly' }] })} hitSlop={8}>
                          <Text style={{ color: colors.gold, fontSize: 12, fontFamily: fonts.latoBold }}>{T.addPlus}</Text>
                        </TouchableOpacity>
                      </View>
                      {d.serving.map((sv, j) => (
                        <View key={j} style={s.serveEntry}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                              style={[s.input, { flex: 1 }]}
                              placeholder={T.servicePlaceholder}
                              placeholderTextColor={colors.muted}
                              value={sv.text}
                              onChangeText={t => patchServing(i, j, { text: t })}
                            />
                            <TouchableOpacity onPress={() => setDay(i, { serving: d.serving.filter((_, idx) => idx !== j) })} hitSlop={8}>
                              <Text style={{ color: colors.red, fontSize: 12, fontFamily: fonts.lato, marginStart: SP.sm }}>{S.common.remove}</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={[s.chipRow, { flexWrap: 'wrap', marginTop: SP.sm }]}>
                            {SERVICE_FREQUENCY_OPTIONS.map(opt => (
                              <Chip key={opt} label={freqLabel(opt)} on={sv.freq === opt} onPress={() => patchServing(i, j, { freq: opt })} />
                            ))}
                          </View>
                        </View>
                      ))}
                      {d.serving.length > 0 && (
                        <Text style={[s.fieldNote, { marginTop: 2, marginBottom: 0 }]}>
                          {fmt(T.serviceNote, { day: name })}
                        </Text>
                      )}
                    </>
                  )}

                  {autoFast && (
                    <Text style={[s.fieldNote, { marginTop: SP.sm }]}>
                      {T.autoFast}
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={s.doneBtn} onPress={() => goBack('/(tabs)/canon')}>
          <Text style={s.doneBtnText}>{T.done}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = lazyThemed(() => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.navy },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SP.lg, paddingVertical: SP.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerBack: { fontFamily: fonts.lato, fontSize: 14, color: colors.gold, minWidth: 54 },
  headerTitle: { fontFamily: fonts.cormorantMedium, fontSize: 20, color: colors.cream },
  saveStatus: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },

  note:          { fontFamily: fonts.latoLight, fontSize: 12, lineHeight: 18, fontStyle: 'italic', marginBottom: SP.lg, color: colors.textSecond },
  sectionLabel:  { fontFamily: fonts.latoBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SP.sm, color: colors.textSecond },
  subLabel:      { fontFamily: fonts.latoBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, color: colors.textSecond },

  fieldRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: R.lg, padding: SP.md, marginBottom: SP.sm, backgroundColor: colors.panel },
  fieldLabel:    { fontFamily: fonts.lato, fontSize: 14, flex: 1, color: colors.cream },
  fieldNote:     { fontFamily: fonts.latoLight, fontSize: 11, lineHeight: 16, marginBottom: SP.sm, marginTop: -2, color: colors.muted },

  stepperRow:    { flexDirection: 'row', alignItems: 'center', gap: SP.sm },
  stepBtn:       { width: 34, height: 34, borderRadius: R.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:   { fontSize: 20, fontFamily: fonts.latoBold, color: colors.gold },
  stepValue:     { fontFamily: fonts.latoBold, fontSize: 15, minWidth: 56, textAlign: 'center', color: colors.cream },

  card:          { borderWidth: 1, borderColor: colors.border, borderRadius: R.lg, padding: SP.md, marginBottom: SP.sm, backgroundColor: colors.panel },
  cardHead:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle:     { fontFamily: fonts.latoBold, fontSize: 14, marginBottom: SP.sm, color: colors.cream },
  chipRow:       { flexDirection: 'row', alignItems: 'center', gap: SP.xs },
  chip:          { borderWidth: 1, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  input:         { borderWidth: 1, borderColor: colors.border, borderRadius: R.md, padding: SP.sm, fontSize: 14, color: colors.cream, fontFamily: fonts.lato, backgroundColor: colors.panel },

  dayCard:       { borderWidth: 1, borderRadius: R.lg, padding: SP.md, marginBottom: SP.sm, backgroundColor: colors.panel },
  serveHead:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SP.sm, marginBottom: 6 },
  serveEntry:    { borderWidth: 1, borderColor: colors.border, borderRadius: R.md, padding: SP.sm, marginBottom: 6 },
  dayHead:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayName:       { fontFamily: fonts.latoBold, fontSize: 14, color: colors.cream },
  daySummary:    { fontFamily: fonts.latoLight, fontSize: 12, marginTop: 2, color: colors.muted },

  banner:        { borderWidth: 1, borderColor: colors.gold + '55', backgroundColor: colors.goldDim, borderRadius: R.md, padding: SP.md, marginBottom: SP.md },
  bannerText:    { fontFamily: fonts.lato, fontSize: 12, lineHeight: 18, color: colors.goldLight },
  lockNote:      { marginTop: 4, marginBottom: SP.sm },
  lockNoteText:  { fontFamily: fonts.latoLight, fontSize: 11, lineHeight: 16, color: colors.muted, fontStyle: 'italic' },
  lockedPill:    { alignSelf: 'flex-end', backgroundColor: colors.goldDim, borderWidth: 1, borderColor: colors.gold + '55', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 6 },
  lockedPillText:{ fontFamily: fonts.latoBold, fontSize: 13, color: colors.goldLight },
  roChip:        { borderWidth: 1, borderColor: colors.gold + '55', backgroundColor: colors.goldDim, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  roChipText:    { fontFamily: fonts.latoBold, fontSize: 12, color: colors.goldLight },
  mutedSmall:    { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, marginBottom: 6 },

  doneBtn:       { backgroundColor: colors.gold, borderRadius: R.lg, paddingVertical: 16, alignItems: 'center', marginTop: SP.lg },
  doneBtnText:   { fontFamily: fonts.latoBold, fontSize: 12, letterSpacing: 0.5, color: colors.navy },
  helpText:      { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 4 },
}));
