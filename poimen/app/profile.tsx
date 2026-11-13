import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HomeButton } from '@/components/ui/HomeButton';
import * as H from '@/lib/haptics';
import { goBack } from '@/lib/nav';
import { useSession } from '@/lib/auth';
import { useDemoMode } from '@/lib/demo';
import { Switch } from 'react-native';
import * as db from '@/lib/db';
import { colors, fonts, ThemeMode, loadThemeMode, saveThemeMode , lazyThemed } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { useTutorial } from '@/lib/tutorial-context';
import { isBiometricAvailable, loadFaceIdLockEnabled, saveFaceIdLockEnabled } from '@/lib/biometrics';
import { clergyDisplayName } from '@/lib/names';
import * as Updates from 'expo-updates';
import { Avatar } from '@/components/ui/Avatar';
import { confirmDestructive } from '@/lib/confirm';
import { pickPhoto, uploadAvatarImage, removeAvatarImage, selfAvatarPath, cameraAvailable, PhotoSource } from '@/lib/avatar';
import { PrivacyNote } from '@/components/ui/PrivacyNote';
import { PRIVACY_COPY } from '@/lib/privacy-copy';
import { useChurchList } from '@/lib/church-list';
import { ChurchField, ChurchPicker } from '@/components/ChurchPicker';
import { type ChurchChoice, churchChoiceToFields } from '@/lib/church-choice';
import { seal, openContactSelf, openChildrenSelf, needsSealing } from '@/lib/pastoral-secure';
import type { ContactData, ChildData, OpenedChild } from '@/lib/pastoral-secure';
import { S, fmt, plural, GLYPH } from '@/lib/i18n';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';

const T = S.profile;

const LIFE_STAGES = ['single', 'engaged', 'married', 'widowed', 'divorced'] as const;
type LifeStageType = typeof LIFE_STAGES[number];

// The role is stored and compared in English; only the badge's label is translated.
const ROLE_LABELS: Record<string, string> = {
  congregant: S.common.roleCongregant,
  servant: S.common.roleServant,
  priest: S.common.rolePriest,
  admin: S.common.roleAdmin,
};

interface ChildRow {
  id?: string;
  name: string;
  birth_year: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useSession();
  const { demoMode, demoRole, setDemoMode } = useDemoMode();
  const { resetAndStartTutorial } = useTutorial();

  const effectiveRole = demoMode
    ? (demoRole as 'congregant' | 'priest' | 'servant')
    : profile?.role === 'priest' || profile?.role === 'admin' ? 'priest'
    : profile?.role === 'servant' ? 'servant'
    : 'congregant';

  // ── Appearance ─────────────────────────────────────────────
  // Screen styles capture the palette when their module loads, so applying a
  // new theme needs a full JS reload (web: location.reload; native: dev
  // reload — production builds would use expo-updates' reloadAsync).
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  useEffect(() => { loadThemeMode().then(setThemeMode); }, []);

  // ── Face ID lock ───────────────────────────────────────────
  const [faceIdAvailable, setFaceIdAvailable] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  useEffect(() => {
    isBiometricAvailable().then(setFaceIdAvailable);
    loadFaceIdLockEnabled().then(setFaceIdEnabled);
  }, []);

  async function toggleFaceId(value: boolean) {
    setFaceIdEnabled(value);
    await saveFaceIdLockEnabled(value);
  }

  async function switchTheme(mode: ThemeMode) {
    if (mode === themeMode) return;
    setThemeMode(mode);
    await saveThemeMode(mode);
    if (Platform.OS === 'web') {
      window.location.reload();
      return;
    }
    // DevSettings.reload() only works with a Metro/dev-client attached — it's
    // a silent no-op in a production build (TestFlight/App Store), which is
    // why switching themes there looked like it did nothing. expo-updates'
    // reloadAsync() is the one that actually works in a release build.
    if (Updates.isEnabled) {
      await Updates.reloadAsync();
      return;
    }
    try {
      const { DevSettings } = require('react-native');
      DevSettings.reload();
    } catch {
      Alert.alert(T.appearance.savedTitle, T.appearance.savedBody);
    }
  }

  // ── FOC name ──────────────────────────────────────────────
  const [focName, setFocName] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.foc_id) {
      db.getProfile(profile.foc_id).then(p => setFocName(p?.full_name ? clergyDisplayName(p.full_name) : null));
    } else {
      setFocName(null);
    }
  }, [profile?.foc_id]);

  // ── Account ───────────────────────────────────────────────
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [churchName, setChurchName] = useState(profile?.church_name ?? '');
  const [churchId, setChurchId] = useState<string | null>(profile?.church_id ?? null);
  const list = useChurchList(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  // The Home strip's "Find it" arrives with pickChurch=1 and the name the
  // member once typed; the sheet opens once there is a list to search.
  const { pickChurch, q } = useLocalSearchParams<{ pickChurch?: string; q?: string }>();
  const [pickerQuery, setPickerQuery] = useState<string | undefined>(undefined);
  const [openedFromHome, setOpenedFromHome] = useState(false);
  useEffect(() => {
    // 'failed' opens too: the sheet shows the error, a Retry and the typed path.
    if (pickChurch !== '1' || openedFromHome || (list.status !== 'ready' && list.status !== 'failed')) return;
    setOpenedFromHome(true);
    setPickerQuery(q ?? '');
    setPickerOpen(true);
  }, [pickChurch, q, openedFromHome, list.status]);

  // What the field shows, from the two columns handleSave writes. An id that
  // the list does not have (hidden row, or list not loaded yet) is still a
  // listed church: the member picked it once and the save must not drop it.
  const churchChoice = useMemo<ChurchChoice | null>(() => {
    if (churchId) {
      const row = list.churches?.find(c => c.id === churchId);
      return { kind: 'listed', church: row ?? { id: churchId, name: churchName } };
    }
    if (churchName.trim()) return { kind: 'unlisted', name: churchName, city: '' };
    return null;
  }, [churchId, churchName, list.churches]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [accountError, setAccountError] = useState('');

  // ── Contact ───────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  // The column has existed since the baseline schema with a 'US' default, but
  // nothing ever set it — so a member outside the US had no way to say so.
  const [country, setCountry] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [savedContact, setSavedContact] = useState(false);
  const [contactError, setContactError] = useState('');

  // ── Family ────────────────────────────────────────────────
  const [lifeStage, setLifeStage] = useState<LifeStageType | null>(null);
  const [spouseName, setSpouseName] = useState('');
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [newChildName, setNewChildName] = useState('');
  const [newChildYear, setNewChildYear] = useState('');
  const [savingFamily, setSavingFamily] = useState(false);
  const [savedFamily, setSavedFamily] = useState(false);
  const [familyError, setFamilyError] = useState('');

  // Re-runs when the Father of Confession changes, not only on sign-in: the
  // link flow returns to this screen with the component already mounted, and
  // the new priest cannot read contact details until resealPastoralData has
  // sealed them to his key.
  useEffect(() => {
    if (user) loadMyInfo();
  }, [user, profile?.foc_id]);

  async function loadMyInfo() {
    const [contact, lifeProfile, childrenData] = await Promise.all([
      db.getContact(user!.id),
      db.getLifeProfile(user!.id),
      db.getChildren(user!.id),
    ]);
    const openedContact = await openContactSelf(contact);
    if (openedContact) {
      const c = openedContact;
      setPhone(c.phone ?? '');
      setContactEmail(c.email ?? '');
      setAddressLine1(c.address_line1 ?? '');
      setAddressLine2(c.address_line2 ?? '');
      setCity(c.city ?? '');
      setStateVal(c.state ?? '');
      setZip(c.zip ?? '');
      setCountry(c.country ?? '');
    }
    if (lifeProfile) {
      setLifeStage((lifeProfile.life_stage as LifeStageType) ?? null);
      setSpouseName(lifeProfile.spouse_name ?? '');
    }
    const openedChildren = await openChildrenSelf(childrenData ?? []);
    setChildren(openedChildren.map(c => ({ id: c.id, name: c.name ?? '', birth_year: c.birth_year ?? 0 })));

    // Backfill: seal anything still in plaintext, and re-seal for a new Father
    // of Confession. Runs after the screen has its values, so a failure here
    // never stops the member seeing their own details.
    void resealPastoralData(openedContact, openedChildren, contact, childrenData ?? []);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setAccountError('');
    const { error } = await db.updateAccount(user.id, { full_name: fullName.trim(), church_name: churchName.trim(), church_id: churchId });
    setSaving(false);
    if (error) { setAccountError(T.saveFailed); return; }
    setSaved(true);
    // Home's church strip reads the profile in context; without this it would
    // keep asking until the next launch.
    await refreshProfile();
    setTimeout(() => setSaved(false), 2000);
  }

  // Who the FOC copy is sealed for. Null when there is no FOC, or when the
  // priest has no public key yet — the row is still sealed to the member, and
  // resealPastoralData picks it up once the key appears.
  async function focSealTarget(): Promise<{ id: string; publicKey: string | null } | null> {
    const focId = profile?.foc_id;
    if (!focId) return null;
    return { id: focId, publicKey: await db.getPublicKey(focId) };
  }

  // Seal rows left in plaintext by the pre-encryption app, and re-seal rows
  // sealed to a previous Father of Confession. Only ever writes data we could
  // already read, so a row we cannot open is left untouched rather than
  // overwritten with blanks.
  async function resealPastoralData(
    openedContact: ContactData | null,
    openedChildren: OpenedChild[],
    contactRow: Record<string, unknown> | null,
    childRows: Record<string, unknown>[],
  ) {
    if (!user) return;
    try {
      const focId = profile?.foc_id ?? null;
      const target = await focSealTarget();

      // Phase 1: adds the sealed copy and re-writes the plaintext unchanged.
      // upsert replaces the whole row, so the plaintext has to be restated or
      // it would be dropped — which is the build 17 breakage this avoids.
      if (openedContact && needsSealing(contactRow, focId)) {
        await db.upsertContact({
          user_id: user.id,
          ...openedContact,
          ...(await seal<ContactData>(openedContact, target)),
          updated_at: new Date().toISOString(),
        });
      }

      // In place, row by row: a delete-then-insert that failed halfway would
      // lose children the member never touched.
      for (const c of openedChildren) {
        const row = childRows.find(r => String(r.id) === c.id);
        if (!row || !needsSealing(row, focId)) continue;
        // An UPDATE touching only the sealed columns — name and birth_year
        // are left exactly as they are for build 17.
        await db.updateChildRow(c.id, {
          ...(await seal<ChildData>({ name: c.name, birth_year: c.birth_year }, target)),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {}
  }

  async function handleSaveContact() {
    if (!user) return;
    setSavingContact(true);
    setContactError('');
    // PHASE 1 of the encryption rollout — DUAL WRITE.
    // Sealed payloads AND the original plaintext columns are both written,
    // because build 17 is still in the field and reads only the plaintext.
    // Nulling those columns now would blank a member's contact details for
    // anyone who has not updated. Phase 2 (see the migration header) stops
    // writing plaintext and clears it, once build 17 is gone.
    const contactData: ContactData = {
      phone:         phone.trim()         || null,
      email:         contactEmail.trim()  || null,
      address_line1: addressLine1.trim()  || null,
      address_line2: addressLine2.trim()  || null,
      city:          city.trim()          || null,
      state:         stateVal.trim()      || null,
      zip:           zip.trim()           || null,
      // Keep the column's 'US' default rather than writing null, so an address
      // saved without a country still resolves on a map.
      country:       country.trim().toUpperCase() || 'US',
    };
    const { error } = await db.upsertContact({
      user_id: user.id,
      ...contactData,                                     // phase 1: plaintext
      ...(await seal<ContactData>(contactData, await focSealTarget())),
      updated_at: new Date().toISOString(),
    });
    setSavingContact(false);
    if (error) { setContactError(T.saveFailed); return; }
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 2000);
  }

  async function handleSaveFamily() {
    if (!user) return;
    setSavingFamily(true);
    setFamilyError('');
    const showSpouse = lifeStage === 'married' || lifeStage === 'engaged';
    const { error: lifeErr } = await db.upsertLifeProfile({
      user_id:     user.id,
      life_stage:  lifeStage ?? null,
      spouse_name: showSpouse ? (spouseName.trim() || null) : null,
      updated_at:  new Date().toISOString(),
    });
    if (lifeErr) { setSavingFamily(false); setFamilyError(T.saveFailed); return; }
    // Replace children: delete all then re-insert current list
    await db.deleteChildren(user.id);
    if (children.length > 0) {
      const focTarget = await focSealTarget();
      const { error: kidsErr } = await db.insertChildren(
        await Promise.all(children.map(async (c) => ({
          parent_id:  user!.id,
          name:       c.name,              // phase 1: plaintext, for build 17
          birth_year: c.birth_year,
          ...(await seal<ChildData>({ name: c.name, birth_year: c.birth_year }, focTarget)),
          updated_at: new Date().toISOString(),
        })))
      );
      if (kidsErr) { setSavingFamily(false); setFamilyError(T.saveChildrenFailed); return; }
    }
    setSavingFamily(false);
    setSavedFamily(true);
    setTimeout(() => setSavedFamily(false), 2000);
  }

  function handleAddChild() {
    const yr = parseInt(newChildYear, 10);
    const currentYear = new Date().getFullYear();
    if (!newChildName.trim() || isNaN(yr) || yr < 1960 || yr > currentYear) return;
    setChildren(prev => [...prev, { name: newChildName.trim(), birth_year: yr }]);
    setNewChildName('');
    setNewChildYear('');
  }

  async function handleSignOut() {
    if (Platform.OS === 'web') {
      await signOut();
      router.replace('/sign-in');
    } else {
      Alert.alert(T.signOut.confirmTitle, T.signOut.confirmBody, [
        { text: S.common.cancel, style: 'cancel' },
        { text: T.signOut.confirmButton, style: 'destructive', onPress: async () => { await signOut(); } },
      ]);
    }
  }

  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Profile photo ─────────────────────────────────────────
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');

  async function changePhoto(source: PhotoSource) {
    if (demoMode || !user || photoBusy) return;
    setPhotoError('');
    setPhotoBusy(true);   // before the picker, so a double-tap can't open two
    try {
      const base64 = await pickPhoto(source);
      if (!base64) return;   // denied or cancelled
      const { url, error } = await uploadAvatarImage(selfAvatarPath(user.id), base64);
      if (!url) { setPhotoError(fmt(T.photo.uploadFailed, { error: String(error) })); return; }
      const { error: dbErr } = await db.setAvatarUrl(user.id, url);
      if (dbErr) setPhotoError(fmt(T.photo.saveFailed, { error: String(dbErr) }));
      await refreshProfile();
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto() {
    if (demoMode || !user) return;
    confirmDestructive(T.photo.removeTitle, T.photo.removeBody, S.common.remove, async () => {
      setPhotoBusy(true);
      await removeAvatarImage(selfAvatarPath(user.id));
      await db.setAvatarUrl(user.id, null);
      await refreshProfile();
      setPhotoBusy(false);
    });
  }

  const showSpouseField = lifeStage === 'married' || lifeStage === 'engaged';
  const currentYear = new Date().getFullYear();
  const canAddChild = newChildName.trim().length > 0 && newChildYear.length === 4;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={[styles.backRow, styles.backRowInBar]} onPress={() => goBack('/(tabs)')}>
            <Text style={styles.backArrow}>{GLYPH.back}</Text>
            <Text style={styles.backText}>{S.common.back}</Text>
          </TouchableOpacity>
          <HomeButton />
        </View>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <Avatar url={profile?.avatar_url} initials={initials} size={72} style={styles.avatar} textStyle={styles.avatarText} />
          {!demoMode && user && <View style={styles.photoChipRow}>
            {cameraAvailable && (
              <TouchableOpacity style={styles.photoChip} onPress={() => changePhoto('camera')} disabled={photoBusy}>
                <Text style={styles.photoChipText}>{T.photo.camera}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.photoChip} onPress={() => changePhoto('library')} disabled={photoBusy}>
              <Text style={styles.photoChipText}>{profile?.avatar_url ? T.photo.change : T.photo.add}</Text>
            </TouchableOpacity>
            {!!profile?.avatar_url && (
              <TouchableOpacity style={styles.photoChip} onPress={removePhoto} disabled={photoBusy}>
                <Text style={[styles.photoChipText, { color: colors.red }]}>{T.photo.remove}</Text>
              </TouchableOpacity>
            )}
          </View>}
          {photoBusy && <ActivityIndicator color={colors.gold} style={{ marginBottom: 6 }} />}
          {!!photoError && <Text style={styles.photoError}>{photoError}</Text>}
          <Text style={styles.avatarName}>{profile?.full_name ?? '—'}</Text>
          <Text style={styles.avatarEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{ROLE_LABELS[profile?.role ?? 'congregant'] ?? profile?.role}</Text>
          </View>
        </View>

        {/* ── Account Details ── */}
        <Card title={T.account.title} titleIcon="◈">
          <View style={styles.field}>
            <Text style={styles.label}>{T.account.fullName}</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={T.account.fullNamePlaceholder}
              placeholderTextColor={colors.faint}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{T.account.email}</Text>
            <View style={styles.inputReadOnly}>
              <Text style={styles.inputReadOnlyText}>{user?.email}</Text>
            </View>
            <Text style={styles.fieldHint}>{T.account.emailHint}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{T.account.church}</Text>
            <ChurchField
              value={churchChoice}
              status={list.status}
              placeholder={T.account.churchPlaceholder}
              style={styles.churchPicker}
              textSize={14}
              onPress={() => setPickerOpen(true)}
            />
          </View>
          {accountError ? <Text style={styles.fieldError}>{accountError}</Text> : null}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={colors.navy} />
              : <Text style={styles.saveBtnText}>{saved ? T.savedBadge : T.account.save}</Text>
            }
          </TouchableOpacity>
        </Card>

        {/* ── Contact for Visitation ── */}
        <Card title={T.contact.title} titleIcon="◎">
          <Text style={styles.sectionHint}>{T.sharedWithFocOnly}</Text>
          <View style={styles.field}>
            <Text style={styles.label}>{T.contact.phone}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={T.contact.phonePlaceholder}
              placeholderTextColor={colors.faint}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{T.contact.email}</Text>
            <TextInput
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder={T.contact.emailPlaceholder}
              placeholderTextColor={colors.faint}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{T.contact.address}</Text>
            <TextInput
              style={[styles.input, { marginBottom: 8 }]}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder={T.contact.street}
              placeholderTextColor={colors.faint}
            />
            <TextInput
              style={[styles.input, { marginBottom: 8 }]}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder={T.contact.line2}
              placeholderTextColor={colors.faint}
            />
            <View style={styles.addressRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={city}
                onChangeText={setCity}
                placeholder={T.contact.city}
                placeholderTextColor={colors.faint}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={stateVal}
                onChangeText={setStateVal}
                placeholder={T.contact.state}
                placeholderTextColor={colors.faint}
                autoCapitalize="characters"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={zip}
                onChangeText={setZip}
                placeholder={T.contact.zip}
                placeholderTextColor={colors.faint}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={country}
              onChangeText={setCountry}
              placeholder={T.contact.country}
              placeholderTextColor={colors.faint}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
          {contactError ? <Text style={styles.fieldError}>{contactError}</Text> : null}
          <TouchableOpacity
            style={[styles.saveBtn, savingContact && styles.saveBtnDisabled]}
            onPress={handleSaveContact}
            disabled={savingContact}
          >
            {savingContact
              ? <ActivityIndicator color={colors.navy} />
              : <Text style={styles.saveBtnText}>{savedContact ? T.savedBadge : T.contact.save}</Text>
            }
          </TouchableOpacity>
        </Card>

        {/* ── Life Stage & Family ── */}
        <Card title={T.family.title} titleIcon="✦">
          <Text style={styles.sectionHint}>{T.sharedWithFocOnly}</Text>

          <Text style={styles.label}>{T.family.lifeStage}</Text>
          <View style={styles.stageRow}>
            {LIFE_STAGES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.stagePill, lifeStage === s && styles.stagePillActive]}
                onPress={() => setLifeStage(prev => prev === s ? null : s)}
              >
                <Text style={[styles.stagePillText, lifeStage === s && styles.stagePillTextActive]}>
                  {T.family.stages[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showSpouseField && (
            <View style={[styles.field, { marginTop: 16 }]}>
              <Text style={styles.label}>{T.family.spouseName}</Text>
              <TextInput
                style={styles.input}
                value={spouseName}
                onChangeText={setSpouseName}
                placeholder={T.family.spousePlaceholder}
                placeholderTextColor={colors.faint}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={[styles.field, { marginTop: 16 }]}>
            <Text style={styles.label}>{T.family.children}</Text>
            {children.length === 0 ? (
              <Text style={styles.emptyChildText}>{T.family.noChildren}</Text>
            ) : (
              children.map((child, i) => (
                <View key={i} style={styles.childRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childMeta}>{plural(T.family.childMeta, currentYear - child.birth_year, { year: child.birth_year })}</Text>
                  </View>
                  <TouchableOpacity style={styles.childRemoveBtn} onPress={() => setChildren(prev => prev.filter((_, idx) => idx !== i))}>
                    <Text style={styles.childRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <View style={styles.addChildRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={newChildName}
                onChangeText={setNewChildName}
                placeholder={T.family.childName}
                placeholderTextColor={colors.faint}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newChildYear}
                onChangeText={setNewChildYear}
                placeholder={T.family.childYear}
                placeholderTextColor={colors.faint}
                keyboardType="numeric"
                maxLength={4}
              />
              <TouchableOpacity
                style={[styles.addChildBtn, !canAddChild && styles.addChildBtnDisabled]}
                onPress={handleAddChild}
                disabled={!canAddChild}
              >
                <Text style={styles.addChildBtnText}>{T.family.addChild}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {familyError ? <Text style={styles.fieldError}>{familyError}</Text> : null}
          <TouchableOpacity
            style={[styles.saveBtn, savingFamily && styles.saveBtnDisabled]}
            onPress={handleSaveFamily}
            disabled={savingFamily}
          >
            {savingFamily
              ? <ActivityIndicator color={colors.navy} />
              : <Text style={styles.saveBtnText}>{savedFamily ? T.savedBadge : T.family.save}</Text>
            }
          </TouchableOpacity>
        </Card>

        {/* ── Appearance ── */}
        <Card title={T.appearance.title} titleIcon="◐">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([
              { mode: 'dark' as ThemeMode, label: T.appearance.dark },
              { mode: 'light' as ThemeMode, label: T.appearance.light },
            ]).map(opt => (
              <TouchableOpacity
                key={opt.mode}
                onPress={() => switchTheme(opt.mode)}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 10, borderWidth: 1,
                  borderColor: themeMode === opt.mode ? colors.gold : colors.border,
                  backgroundColor: themeMode === opt.mode ? colors.goldDim : 'transparent',
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.themeLabel, { color: themeMode === opt.mode ? colors.goldLight : colors.muted }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.settingNote}>{T.appearance.note}</Text>
        </Card>

        {/* ── Language ── */}
        <Card title={T.language.title} titleIcon="◉">
          <LanguageSwitch />
          <Text style={styles.settingNote}>{T.language.note}</Text>
        </Card>

        {/* ── Your data & privacy ── */}
        <Card title={PRIVACY_COPY.settingsTitle} titleIcon="✦">
          <Text style={styles.privacyText}>{PRIVACY_COPY.settingsSummary}</Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.privacyLink}>{T.privacy.readPolicy}</Text>
          </TouchableOpacity>
        </Card>

        {/* ── Reminders ── */}
        <Card title={T.reminders.title} titleIcon="◷">
          <Text style={styles.privacyText}>{T.reminders.body}</Text>
          <TouchableOpacity style={styles.feedbackBtn} onPress={() => { H.tap(); router.push('/reminders'); }} activeOpacity={0.85}>
            <Text style={styles.feedbackBtnText}>{T.reminders.button}</Text>
          </TouchableOpacity>
        </Card>

        {/* ── Feedback ── */}
        <Card title={T.feedback.title} titleIcon="✎">
          <Text style={styles.privacyText}>{T.feedback.body}</Text>
          <TouchableOpacity style={styles.feedbackBtn} onPress={() => { H.tap(); router.push('/feedback'); }} activeOpacity={0.85}>
            <Text style={styles.feedbackBtnText}>{T.feedback.button}</Text>
          </TouchableOpacity>
        </Card>

        {/* Invite code — shown to priests and servants */}
        {(profile?.role === 'priest' || profile?.role === 'servant' || profile?.role === 'admin') && profile?.invite_code && (
          <Card title={T.invite.title} titleIcon="◈">
            <Text style={styles.inviteCodeLabel}>
              {profile.role === 'servant' ? T.invite.shareServant : T.invite.sharePriest}
            </Text>
            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCode}>{profile.invite_code}</Text>
            </View>
          </Card>
        )}

        {/* FOC linking — shown to congregants and admins */}
        {(profile?.role === 'congregant' || profile?.role === 'admin' || !profile?.role) && (
          <Card title={T.foc.title} titleIcon="✝︎">
            {profile?.foc_id ? (
              <>
                <View style={styles.linkedRow}>
                  <View>
                    <Text style={styles.linkedName}>{T.foc.linked}</Text>
                    {focName ? <Text style={styles.focNameText}>{focName}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/link-to-foc', params: { type: 'foc' } })}>
                    <Text style={styles.relinkText}>{S.common.change}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.vitalsToggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vitalsToggleLabel}>{T.foc.shareVitals}</Text>
                    <Text style={styles.vitalsToggleHint}>{T.foc.shareVitalsHint}</Text>
                  </View>
                  <Switch
                    value={profile?.vitals_consent === true}
                    onValueChange={async (val) => {
                      if (!user) return;
                      await db.setVitalsConsent(user.id, val);
                      await refreshProfile();
                    }}
                    trackColor={{ false: colors.creamDim, true: 'rgba(201,168,76,0.4)' }}
                    thumbColor={profile?.vitals_consent === true ? colors.gold : colors.faint}
                  />
                </View>
                <PrivacyNote text={PRIVACY_COPY.vitals} />
              </>
            ) : (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => router.push({ pathname: '/link-to-foc', params: { type: 'foc' } })}
              >
                <Text style={styles.linkBtnText}>{T.foc.link}</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Servant linking — shown to congregants */}
        {(profile?.role === 'congregant' || !profile?.role) && (
          <Card title={T.servant.title} titleIcon="◇">
            {profile?.servant_id ? (
              <View style={styles.linkedRow}>
                <Text style={styles.linkedName}>{T.servant.linked}</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/link-to-foc', params: { type: 'servant' } })}>
                  <Text style={styles.relinkText}>{S.common.change}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => router.push({ pathname: '/link-to-foc', params: { type: 'servant' } })}
              >
                <Text style={styles.linkBtnText}>{T.servant.link}</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        <TouchableOpacity style={styles.tutorialBtn} onPress={() => resetAndStartTutorial(effectiveRole)}>
          <Text style={styles.tutorialBtnText}>{T.tutorial}</Text>
        </TouchableOpacity>

        {faceIdAvailable && (
          <View style={styles.demoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoLabel}>{T.faceId.label}</Text>
              <Text style={styles.demoSub}>{T.faceId.hint}</Text>
            </View>
            <Switch
              value={faceIdEnabled}
              onValueChange={toggleFaceId}
              trackColor={{ false: colors.creamDim, true: 'rgba(201,168,76,0.4)' }}
              thumbColor={faceIdEnabled ? colors.gold : colors.faint}
            />
          </View>
        )}

        {/* Demo mode toggle */}
        <View style={styles.demoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoLabel}>{T.demo.label}</Text>
            <Text style={styles.demoSub}>{T.demo.hint}</Text>
          </View>
          <Switch
            value={demoMode}
            onValueChange={setDemoMode}
            trackColor={{ false: colors.creamDim, true: 'rgba(201,168,76,0.4)' }}
            thumbColor={demoMode ? colors.gold : colors.faint}
          />
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>{T.signOut.button}</Text>
        </TouchableOpacity>

        {!demoMode && (
          <TouchableOpacity style={styles.deleteAccountLink} onPress={() => router.push('/delete-account')}>
            <Text style={styles.deleteAccountText}>{T.deleteAccount}</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <ChurchPicker
        visible={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerQuery(undefined); }}
        value={churchChoice}
        onChange={c => {
          const f = churchChoiceToFields(c);
          setChurchId(f.church_id);
          setChurchName(f.church_name);
        }}
        churches={list.churches}
        status={list.status}
        loadError={list.error}
        onRetry={list.reload}
        initialQuery={pickerQuery}
      />
    </SafeAreaView>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  // Back on one side, the house button on the other.
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backRowInBar: { marginBottom: 0, flexShrink: 1 },
  backArrow: { fontFamily: fonts.cormorant, fontSize: 22, color: colors.gold },
  backText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.goldDim, borderWidth: 2, borderColor: colors.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontFamily: fonts.cormorantMedium, fontSize: 28, color: colors.goldLight },
  photoChipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10, marginBottom: 8 },
  photoChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  photoChipText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.gold },
  photoError: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.red, marginBottom: 6, textAlign: 'center' },
  avatarName: { fontFamily: fonts.cormorantMedium, fontSize: 22, color: colors.cream, marginBottom: 4 },
  avatarEmail: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, marginBottom: 8 },
  roleBadge: {
    backgroundColor: colors.goldDim, borderWidth: 1, borderColor: colors.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  roleBadgeText: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.gold },

  sectionHint: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginBottom: 16, opacity: 0.8 },

  field: { gap: 6, marginBottom: 14 },
  label: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted },
  input: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 14, padding: 12,
  },
  inputReadOnly: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: 'rgba(201,168,76,0.1)',
    borderRadius: 8, padding: 12,
  },
  inputReadOnlyText: { fontFamily: fonts.latoLight, fontSize: 14, color: colors.faint },
  fieldHint: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, opacity: 0.6 },
  fieldError: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.red, marginBottom: 8 },

  addressRow: { flexDirection: 'row', gap: 8 },

  stageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  stagePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  stagePillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  stagePillText: { fontFamily: fonts.latoBold, fontSize: 11, letterSpacing: 0.5, color: colors.muted },
  stagePillTextActive: { color: colors.goldLight },

  emptyChildText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, opacity: 0.6, marginBottom: 8 },
  childRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4,
  },
  childName: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream },
  childMeta: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 2 },
  childRemoveBtn: { padding: 8 },
  childRemoveText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.red },

  addChildRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 },
  addChildBtn: { backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14 },
  addChildBtnDisabled: { opacity: 0.35 },
  addChildBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.navy, letterSpacing: 0.8 },

  saveBtn: { backgroundColor: colors.gold, borderRadius: 8, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.navy, letterSpacing: 1 },

  feedbackBtn: { marginTop: 12, alignSelf: 'flex-start' as any, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1, borderColor: colors.gold },
  feedbackBtnText: { fontFamily: fonts.latoBold, fontSize: 12, letterSpacing: 0.4, color: colors.gold },
  privacyLink: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.gold, marginTop: 12 },
  privacyText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 20 },
  themeLabel: { fontFamily: fonts.latoBold, fontSize: 13 },
  // The line under the Appearance and Language switches.
  settingNote: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 10, lineHeight: 16 },

  tutorialBtn: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 8,
  },
  tutorialBtnText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.muted, letterSpacing: 0.5 },

  demoRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, marginTop: 8, marginBottom: 8 },
  demoLabel: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 2 },
  demoSub: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },

  inviteCodeLabel: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, marginBottom: 14, lineHeight: 18 },
  inviteCodeBox: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingVertical: 18, alignItems: 'center',
  },
  inviteCode: { fontFamily: fonts.latoBold, fontSize: 32, color: colors.goldLight, letterSpacing: 10 },

  linkedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkedName: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.green },
  focNameText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, marginTop: 2 },
  relinkText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.gold, letterSpacing: 0.5 },

  linkBtn: {
    backgroundColor: colors.goldDim, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  linkBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.goldLight, letterSpacing: 1 },

  signOutBtn: {
    borderWidth: 1, borderColor: 'rgba(192,57,43,0.4)',
    borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  signOutText: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.red, letterSpacing: 0.5 },
  deleteAccountLink: { alignItems: 'center', paddingVertical: 14 },
  deleteAccountText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, textDecorationLine: 'underline' },

  churchPicker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 12,
  },

  vitalsToggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14,
  },
  vitalsToggleLabel: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, marginBottom: 2 },
  vitalsToggleHint: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted },
}));
