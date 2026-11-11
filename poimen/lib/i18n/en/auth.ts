export const auth = {
  signIn: {
    headingSignIn: 'Sign in to your account',
    headingSignUp: 'Create an account',
    headingMagic: 'Sign in with a link',
    headingReset: 'Reset your password',

    roleCongregantDesc: 'My spiritual life',
    roleServantDesc: 'Sunday school service',
    rolePriestDesc: 'Father of Confession',
    priestNote:
      "You will not see anyone's spiritual life until they choose you. A member enters your invite code and confirms the link before you can see their canon, confession dates, or notes — and they can unlink at any time.",

    fullName: 'Full name',
    email: 'Email',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    forgotPassword: 'Forgot password?',

    submitSignIn: 'SIGN IN',
    submitSignUp: 'CREATE ACCOUNT',
    submitMagic: 'SEND LINK',
    submitReset: 'SEND RESET LINK',

    churchRequired: 'Choose your church — or tap "My church isn\'t listed" and type its name.',
    infoConfirmEmail: 'Check your email to confirm your account, then sign in.',
    infoMagicSent: 'A sign-in link was sent to your email.',
    infoResetSent: 'A password reset link was sent to your email.',

    useMagicLink: 'Use a magic link instead',
    createAccount: 'Create an account',
    haveAccount: 'Already have an account? Sign in',
    backToPassword: 'Back to password sign in',
    backToSignIn: 'Back to sign in',

    footer: 'A ministry of the Coptic Orthodox Church.\nAll spiritual data is private and protected.',
    // The switch shows each language in its own script; this is its label for
    // screen readers.
    languageSwitch: 'Language',
  },

  // Supabase words its sign-in errors in English and the screens show them as
  // they arrive. In another language lib/auth.tsx recognises the common ones
  // (lib/auth-errors.ts) and shows these instead; in English the server's own
  // message is shown untouched, so the text here is only its reference copy.
  errors: {
    invalidCredentials: 'Invalid login credentials',
    emailNotConfirmed: 'Email not confirmed',
    userExists: 'User already registered',
    passwordTooShort: {
      one: 'Password should be at least {n} character.',
      other: 'Password should be at least {n} characters.',
    },
    rateLimitSeconds: {
      one: 'For security purposes, you can only request this after {n} second.',
      other: 'For security purposes, you can only request this after {n} seconds.',
    },
    emailRateLimit: 'Email rate limit exceeded',
    invalidEmail: 'Unable to validate email address: invalid format',
    samePassword: 'New password should be different from the old password.',
    network: 'Network request failed',
    deleteFailedConnection: "Your account couldn't be deleted. Check your connection and try again.",
    deleteFailed: "Your account couldn't be deleted. Please try again.",
  },

  resetPassword: {
    title: 'Set a new password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    submit: 'SAVE PASSWORD',
    errTooShort: 'Password must be at least 6 characters.',
    errMismatch: 'Passwords do not match.',
  },

  // Where a magic link or password-reset link lands while it is exchanged
  // for a session.
  callback: {
    signingIn: 'Signing you in…',
    fallback: 'Taking too long? The link may have expired — back to sign in',
  },

  // The Recovery PIN dialog: set a new PIN, replace an old short one, or
  // enter it on a new device.
  pin: {
    titleSetup: 'Set a Recovery PIN',
    titleUpgrade: 'Strengthen Your Recovery PIN',
    titleRecover: 'Enter Your Recovery PIN',
    bodySetup:
      'If you switch devices, this PIN restores the key that opens your prayer requests, pastoral notes, and confession journal.',
    bodyUpgrade:
      'Nepsis now protects your recovery key more strongly. Choose a new PIN of at least 8 characters — a short phrase works well. Your current PIN will stop working.',
    bodyRecover:
      'Your encryption key is not on this device. Enter your PIN to restore it — without it, this device cannot open your prayer requests, notes, or confession journal.',
    warning:
      'This PIN cannot be recovered or reset — not by your church, and not by Nepsis. If you lose it, everything it protects is gone for good. Write it down and keep it somewhere safe.',

    placeholderNew: { one: 'PIN (at least {n} characters)', other: 'PIN (at least {n} characters)' },
    placeholder: 'PIN',
    confirmPlaceholder: 'Confirm PIN',
    wroteItDown: 'I have written my PIN down and stored it somewhere safe.',

    errTooShort: { one: 'PIN must be at least {n} characters.', other: 'PIN must be at least {n} characters.' },
    errMismatch: 'PINs do not match.',
    errWriteDown: 'Please write your PIN down first, then tick the box.',
    errEmpty: 'Enter your PIN.',
    errIncorrect: 'Incorrect PIN. Try again.',
    errSave: 'Something went wrong saving your PIN. Check your connection and try again.',

    securing: 'SECURING YOUR KEY…',
    unlocking: 'UNLOCKING…',
    save: 'SAVE PIN',
    restore: 'RESTORE',
    remindLater: 'Remind me next time',
    skipForNow: 'Skip for now',
    forgot:
      'I forgot my PIN — start fresh (prayer requests, pastoral notes, and your confession journal from before will be unreadable)',
  },

  // The Face ID gate in front of a session that is already signed in.
  lock: {
    title: 'Nepsis is locked',
    body: 'Use Face ID to continue.',
    unlock: 'UNLOCK',
    // The line the system's own Face ID sheet shows.
    prompt: 'Unlock Nepsis',
  },

  // Shown in place of text that this device cannot open.
  encryption: {
    couldNotDecrypt: '[could not decrypt]',
    noteCouldNotDecrypt: '[note could not be decrypted]',
    noteLockedToDevice: '[note is locked to the device it was written on]',
  },
};
