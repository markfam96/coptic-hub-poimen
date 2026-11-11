import { PRIVACY_COPY } from '@/lib/privacy-copy';
import { S } from '@/lib/i18n';

const T = S.tutorial;

export type TutorialStep = {
  id: string;
  title: string;
  body: string;
  position: 'top' | 'bottom' | 'center';
};

export type TutorialRole = 'congregant' | 'priest' | 'servant';

// Tutorials attached to one part of the app rather than to a role. They run the
// first time that part is opened, long after the role tour has been taken and
// forgotten, and can be replayed from inside it.
export type TutorialModule = 'confession';

// What the store keys a "seen" flag by. Roles keep their bare names for
// backwards compatibility; modules are prefixed.
export type TutorialKey = TutorialRole | `module:${TutorialModule}`;

export const TUTORIAL_STEPS: Record<TutorialRole, TutorialStep[]> = {
  congregant: [
    {
      id: 'cong-welcome',
      title: T.congregant.welcome.title,
      body: T.congregant.welcome.body,
      position: 'center',
    },
    {
      id: 'cong-dashboard',
      title: T.congregant.dashboard.title,
      body: T.congregant.dashboard.body,
      position: 'top',
    },
    {
      id: 'cong-confession',
      title: T.congregant.confession.title,
      body: T.congregant.confession.body,
      position: 'bottom',
    },
    {
      id: 'cong-journal',
      title: T.congregant.journal.title,
      body: T.congregant.journal.body,
      position: 'bottom',
    },
    {
      id: 'cong-prayer',
      title: T.congregant.prayer.title,
      body: T.congregant.prayer.body,
      position: 'bottom',
    },
    {
      id: 'cong-canon',
      title: T.congregant.canon.title,
      body: T.congregant.canon.body,
      position: 'bottom',
    },
    {
      id: 'cong-privacy',
      title: PRIVACY_COPY.onboardingTitle,
      body: PRIVACY_COPY.onboarding,
      position: 'center',
    },
  ],

  priest: [
    {
      id: 'priest-welcome',
      title: T.priest.welcome.title,
      body: T.priest.welcome.body,
      position: 'center',
    },
    {
      id: 'priest-flock',
      title: T.priest.flock.title,
      body: T.priest.flock.body,
      position: 'top',
    },
    {
      id: 'priest-member',
      title: T.priest.member.title,
      body: T.priest.member.body,
      position: 'bottom',
    },
    {
      id: 'priest-encounter',
      title: T.priest.encounter.title,
      body: T.priest.encounter.body,
      position: 'bottom',
    },
    {
      id: 'priest-canon',
      title: T.priest.canon.title,
      body: T.priest.canon.body,
      position: 'bottom',
    },
  ],

  servant: [
    {
      id: 'servant-welcome',
      title: T.servant.welcome.title,
      body: T.servant.welcome.body,
      position: 'center',
    },
    {
      id: 'servant-students',
      title: T.servant.students.title,
      body: T.servant.students.body,
      position: 'top',
    },
    {
      id: 'servant-student',
      title: T.servant.student.title,
      body: T.servant.student.body,
      position: 'bottom',
    },
    {
      id: 'servant-assign',
      title: T.servant.assign.title,
      body: T.servant.assign.body,
      position: 'bottom',
    },
  ],
};

// ─── Module tutorials ────────────────────────────────────────────────────────

// The Confession tab is the one part of the app a newcomer can open and not
// know what to do with. It has four entry points across two sections, and the
// order they are meant to be used in — journal as life happens, examination
// before you go, notes while you are there — is not visible from the cards
// themselves. Six steps, one per thing worth knowing, in the order someone
// actually meets them.
//
// Two rules govern this copy. It never describes the tab as a substitute for
// the sacrament: Confession is administered by a priest, and what is here only
// prepares someone to receive it. And it never overstates the privacy — the
// one thing that does leave the phone (the date) is named in the same breath
// as the things that do not.
export const MODULE_TUTORIALS: Record<TutorialModule, TutorialStep[]> = {
  confession: [
    {
      id: 'conf-what',
      title: T.confession.what.title,
      body: T.confession.what.body,
      position: 'center',
    },
    {
      id: 'conf-journal',
      title: T.confession.journal.title,
      body: T.confession.journal.body,
      position: 'bottom',
    },
    {
      id: 'conf-examination',
      title: T.confession.examination.title,
      body: T.confession.examination.body,
      position: 'bottom',
    },
    {
      id: 'conf-guidance',
      title: T.confession.guidance.title,
      body: T.confession.guidance.body,
      position: 'bottom',
    },
    {
      id: 'conf-session',
      title: T.confession.session.title,
      body: T.confession.session.body,
      position: 'bottom',
    },
    {
      id: 'conf-history',
      title: T.confession.history.title,
      body: T.confession.history.body,
      position: 'bottom',
    },
    {
      id: 'conf-privacy',
      title: T.confession.privacy.title,
      body: T.confession.privacy.body,
      position: 'center',
    },
  ],
};
