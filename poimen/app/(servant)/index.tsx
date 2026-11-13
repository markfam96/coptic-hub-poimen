import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { CandleIcon } from '@/components/ui/TabIcons';
import { useSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { useDemoMode } from '@/lib/demo';
import { S, fmt, plural, fmtDate, GLYPH } from '@/lib/i18n';

const T = S.servant.list;
const D = S.demo.servant;

interface Student {
  id: string;
  initials: string;
  name: string;
  canonCount: number;
  lastActivity: string | null;
  // Student's own picture, else this servant's roster photo (member_photos).
  avatarUrl?: string | null;
}

const DEMO_STUDENTS: Student[] = [
  { id: 'demo-s1', initials: D.johnMark.initials, name: D.johnMark.name, canonCount: 2, lastActivity: plural(S.common.daysAgo, 2) },
  { id: 'demo-s2', initials: D.esther.initials, name: D.esther.name, canonCount: 1, lastActivity: plural(S.common.daysAgo, 5) },
];

export default function ServantFlockScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, profile } = useSession();
  const { demoMode } = useDemoMode();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(!demoMode);
  const [search, setSearch] = useState('');

  const today = fmtDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = profile?.full_name?.split(' ')[0] ?? S.common.roleServant;

  // Reload on focus (not just mount) so changes made in the student detail —
  // e.g. a roster photo added there — show up when returning to the list.
  useFocusEffect(
    useCallback(() => {
      if (demoMode) {
        setStudents(DEMO_STUDENTS);
      } else {
        loadStudents();
      }
    }, [user, demoMode]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  async function loadStudents() {
    if (!user) return;
    setLoading(true);
    const profiles = await db.getServantStudents(user.id);

    // Count active canons per student
    const canons = await db.getActiveCanonsByPriest(user.id);

    const canonCountByStudent: Record<string, number> = {};
    for (const c of canons) {
      canonCountByStudent[c.congregant_id] = (canonCountByStudent[c.congregant_id] ?? 0) + 1;
    }

    // Roster photos this servant set for students without a picture of their own.
    const myPhotos = await db.getMyMemberPhotos(user.id);

    const mapped: Student[] = profiles.map(p => {
      const parts = (p.full_name ?? '?').split(' ');
      const init = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
      return { id: p.id, initials: init, name: p.full_name ?? T.unknownName, canonCount: canonCountByStudent[p.id] ?? 0, lastActivity: null, avatarUrl: p.avatar_url ?? myPhotos[p.id] ?? null };
    });

    setStudents(mapped);
    setLoading(false);
  }

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        <View style={styles.topbar}>
          <View style={styles.topbarLeft}>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={8}
            >
              <Text style={styles.menuBtnText}>☰</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>{T.title}</Text>
              <Text style={styles.pageSubtitle}>{today} · {greeting}</Text>
            </View>
          </View>
          <HeaderActions />
        </View>

        <Text style={styles.flockMeta}>
          {plural(T.studentCount, students.length)}
          {students.filter(s => s.canonCount > 0).length > 0
            ? ` · ${plural(T.withActiveCanon, students.filter(s => s.canonCount > 0).length)}`
            : ''}
        </Text>

        <TextInput
          style={styles.search}
          placeholder={T.searchPlaceholder}
          placeholderTextColor={colors.faint}
          value={search}
          onChangeText={setSearch}
        />

        <Card title={fmt(T.cardTitle, { n: filtered.length })} flat>
          {loading ? (
            <ActivityIndicator color={colors.gold} style={{ paddingVertical: 20 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{students.length === 0 ? T.emptyTitle : T.noMatchesTitle}</Text>
              <Text style={styles.emptyBody}>
                {students.length === 0
                  ? T.emptyBody
                  : T.noMatchesBody}
              </Text>
            </View>
          ) : (
            filtered.map((student, i) => (
              <TouchableOpacity
                key={student.id}
                style={[styles.studentRow, i < filtered.length - 1 && styles.studentBorder]}
                onPress={() => router.push({ pathname: '/(servant)/student', params: { id: student.id, name: student.name } })}
                activeOpacity={0.7}
              >
                <Avatar url={student.avatarUrl} initials={student.initials} size={40} style={styles.avatar} textStyle={styles.avatarText} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <View style={styles.studentMeta}>
                    <CandleIcon size={12} color={colors.muted} />
                    <Text style={styles.metaItem}>{plural(T.canonCount, student.canonCount)}</Text>
                    {student.lastActivity && (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaItem}>{fmt(T.lastActive, { when: student.lastActivity })}</Text>
                      </>
                    )}
                  </View>
                </View>
                <Text style={styles.chevron}>{GLYPH.forward}</Text>
              </TouchableOpacity>
            ))
          )}
        </Card>

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

  topbar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
  menuBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 },
  menuBtnText: { fontFamily: fonts.lato, fontSize: 16, color: colors.gold },
  pageTitle: { fontFamily: fonts.cormorantMedium, fontSize: 28, color: colors.cream },
  pageSubtitle: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 4 },

  flockMeta: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, marginBottom: 18, marginTop: -12 },

  search: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 13, padding: 11, marginBottom: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyTitle: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.muted },
  emptyBody: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 17, opacity: 0.7 },

  studentRow: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e3a5f', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: fonts.cormorantMedium, fontSize: 14, color: colors.cream },
  studentName: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 3 },
  studentMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },
  metaDot: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },
  chevron: { fontFamily: fonts.lato, fontSize: 20, color: colors.muted },

  scopeNote: { backgroundColor: 'rgba(201,168,76,0.05)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', borderRadius: 10, padding: 14, marginTop: 8 },
  scopeNoteText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 17, letterSpacing: 0.2 },
}));
