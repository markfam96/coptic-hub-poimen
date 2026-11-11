// The church picker (components/ChurchPicker.tsx), shared by sign-up and
// Profile, and the labels lib/church-display.ts puts beside a distance.
// Church names and addresses come from the directory and are not translated.
export const church = {
  // The collapsed field.
  field: {
    placeholder: 'Choose your church…',
    loading: 'Loading churches…',
    failed: "Couldn't load the church list — tap to retry or type your church",
    // Second line under a church the member typed themselves.
    notInDirectory: 'Not in the directory yet',
    notInDirectoryWithCity: '{city} · Not in the directory yet',
  },

  // The sheet.
  picker: {
    title: 'Select Your Church',
    searchPlaceholder: 'Search by name, nickname or city…',

    sortByNearest: '◎ Sort by nearest',
    locating: 'Finding churches near you…',
    sortedByNearest: 'Sorted by nearest · Show A–Z',
    switchUnit: 'Switch distance unit',
    locationDenied: 'Location is off for Nepsis, so the list stays A–Z. Open Settings →',
    locationDeniedWeb: 'Location is blocked for this site, so the list stays A–Z. Allow it in your browser’s site settings, then tap Sort by nearest again.',
    locationUnavailable: 'Location isn’t available right now, so the list stays A–Z.',

    noMatch: 'No church matches "{query}". Tap "My church isn\'t listed" to add it by name.',
    empty: 'No churches have been added yet.',
    listFailed: "Couldn't load the church list. Check your connection and try again.",

    notListed: "My church isn't listed",
    unlistedName: 'Church name',
    unlistedCity: 'City (optional)',
    unlistedHint: "We'll save the name you type.",
    unlistedSuggest: 'Suggest the church to the directory →',
    useThisName: 'Use this name',

    directoryCredit: 'Church list from the Coptic Orthodox Directory · directory.nihov.org',
  },

  // Passed to formatDistance. `approx` goes straight before the number;
  // `under` is the whole phrase for anything below a tenth of a unit.
  distance: {
    mi: 'mi',
    km: 'km',
    approx: '~',
    under: '< 0.1 {unit}',
  },

  // Passed to precisionLabel: a church the directory could only place at the
  // middle of a city or a state.
  precision: {
    near: 'near {city}',
    inState: 'in {state}',
  },
};
