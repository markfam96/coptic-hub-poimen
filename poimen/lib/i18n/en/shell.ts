// The frame around the screens: the drawer, the portal chooser and the
// page shown for a link that leads nowhere.
export const shell = {
  drawer: {
    tagline: 'pastoral care, rooted in Tradition',
    home: 'Home',
    confession: 'Confession',
    appointments: 'Appointments',
    journal: 'Journal',
    prayer: 'Prayer',
    psalms: 'Psalms',
    canon: 'Canon',
  },

  // The buttons at the end of every main screen's top bar
  // (components/ui/HeaderActions.tsx). `profile` is the profile picture's
  // label for screen readers, and `home` the house
  // button on Profile and the screens it opens (components/ui/HomeButton.tsx).
  header: {
    profile: 'Profile',
    home: 'Home',
  },

  notFound: {
    title: 'Page not found',
    body: "That link doesn't lead anywhere in Nepsis.",
    goHome: 'GO HOME',
  },

  portals: {
    title: 'Portals',
    subtitle: 'All three views of the pastoral care system.',
    yourRole: 'YOUR ROLE',

    congregantSubtitle: 'Your personal view',
    congregantDesc: 'Dashboard · Confession prep · Spiritual canon · Journal · Prayer requests',
    priestSubtitle: 'Father of Confession portal',
    priestDesc: 'Member roster · Pastoral encounter log · Canon assignment · Pastoral notes',
    servantSubtitle: 'Sunday school servant portal',
    servantDesc: 'Student roster · Student detail · Assign prayer & scripture canons',

    adminTitle: 'Admin Overview',
    adminSubtitle: 'All users by role',
    adminDesc: 'View all congregants, priests, and servants registered in the system.',
  },
};
