import type { Localized } from '../core';
import type { en } from '../en';
import { common } from './common';
import { auth } from './auth';
import { shell } from './shell';
import { church } from './church';
import { account } from './account';
import { home } from './home';
import { survey } from './survey';
import { feedback } from './feedback';
import { confession } from './confession';
import { examination } from './examination';
import { canon } from './canon';
import { canonEditor } from './canonEditor';
import { psalms } from './psalms';
import { prayer } from './prayer';
import { journal } from './journal';
import { appointments } from './appointments';
import { reminders } from './reminders';
import { profile } from './profile';
import { privacy } from './privacy';
import { support } from './support';
import { priest } from './priest';
import { schedule } from './schedule';
import { servant } from './servant';
import { tutorial } from './tutorial';
import { calendar } from './calendar';
import { demo } from './demo';

export const ar: Localized<typeof en> = {
  common,
  auth,
  shell,
  church,
  account,
  home,
  survey,
  feedback,
  confession,
  examination,
  canon,
  canonEditor,
  psalms,
  prayer,
  journal,
  appointments,
  reminders,
  profile,
  privacy,
  support,
  priest,
  schedule,
  servant,
  tutorial,
  calendar,
  demo,
};
