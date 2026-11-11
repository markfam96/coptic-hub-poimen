// lib/reminders/phrasing.ts
// The pure half of the reminder feature: how a list of canon items becomes one
// sentence.
//
// Split out from content.ts because that reaches for the psalm and canon
// stores and none of this needs to. A notification's text is the only part of
// the app a member reads without opening it, and it cannot be checked by
// looking at a screen — so it is tested instead.
//
// The time formatting and stepping helpers that used to live here went with
// the hand-rolled ‹ › stepper they existed for: the reminder screen now uses
// the app's own ScrollPicker and formatMinute, the same control and the same
// labels as the priest's availability windows.

// Canon item labels carry UI detail a notification has no room for — "Attend
// Vespers — 1 of 2 this week", "Read 3 chapters · Mon, Wed". The reminder keeps
// the verb and the name and drops the rest.
export function cleanLabel(label: string): string {
  return label.split(' — ')[0].split(' · ')[0].trim();
}

// "Pray the Sixth Hour and attend Vespers." / "…, and 3 more."
//
// Only the first label keeps its capital: the rest are folded into a sentence
// where "Attend Vespers" mid-clause would read as a title. A label that is a
// proper noun ("Agpeya", "Vespers") is left alone, which is what the
// second-character test is for.
//
// The sentences themselves come in as `words`, English unless the caller says
// otherwise (content.ts passes the app's language): this file stays free of
// imports so the tests can load it in plain Node.
export function describeItems(labels: string[], words: ListWords = ENGLISH_LIST): string {
  if (labels.length === 0) return '';
  const first = labels[0];
  if (labels.length === 1) return fill(words.one, first, '');
  const second = words.lowerLater ? lowerFirst(labels[1]) : labels[1];
  if (labels.length === 2) return fill(words.two, first, second);
  return fill(words.more(labels.length - 2), first, second);
}

// The sentences describeItems builds from. {a} and {b} stand for the first two
// labels. `more` is handed the number of items left unnamed and returns the
// sentence for that number, with {a} and {b} still in it — a function because
// in Arabic the words around a count change with the count.
export interface ListWords {
  one: string;
  two: string;
  more: (n: number) => string;
  // English folds a later label into the sentence by dropping its capital.
  // A script without capitals has nothing to fold, and a Latin label inside
  // an Arabic sentence is left as it was written.
  lowerLater: boolean;
}

export const ENGLISH_LIST: ListWords = {
  one: '{a}.',
  two: '{a} and {b}.',
  more: n => `{a}, {b}, and ${n} more.`,
  lowerLater: true,
};

// One pass over the sentence, so a label that itself contains "{b}" is not
// filled a second time.
function fill(sentence: string, a: string, b: string): string {
  return sentence.replace(/\{(a|b)\}/g, (_whole, key: string) => (key === 'a' ? a : b));
}

function lowerFirst(s: string): string {
  if (s.length < 2) return s;
  const startsSentenceCase = s[0] === s[0].toUpperCase() && s[1] === s[1].toLowerCase();
  return startsSentenceCase ? s[0].toLowerCase() + s.slice(1) : s;
}
