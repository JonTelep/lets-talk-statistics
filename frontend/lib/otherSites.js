// Shared "Our other sites" list (foot.py). This site is removed when the footer renders.
export const THIS_SITE = 'letstalkstatistics.com';

export const OTHER_SITES = [
  { host: 'telep.io', href: 'https://telep.io/', label: 'telep.io websites for small businesses' },
  { host: 'bloomer.news', href: 'https://bloomer.news/', label: 'Bloomer News, positive AI news' },
  { host: 'starterloot.com', href: 'https://starterloot.com/', label: 'StarterLoot, free AI tools for game devs' },
  { host: 'publaish.com', href: 'https://publaish.com/', label: 'Publaish, AI search visibility tracker' },
  { host: 'openmedina.org', href: 'https://openmedina.org/', label: 'OpenMedina, open government for Medina County' },
  { host: 'letstalkstatistics.com', href: 'https://letstalkstatistics.com/', label: "Let's Talk Statistics, official figures with sources" },
  { host: 'minesswept.com', href: 'https://minesswept.com/', label: 'minesSwept, shared giant minesweeper' },
  { host: 'memes.telep.io', href: 'https://memes.telep.io/', label: 'telep.io memes' },
  { host: 'white.telep.io', href: 'https://white.telep.io/', label: 'white.telep.io, filming light and camera test' },
  { host: 'seo.telep.io', href: 'https://seo.telep.io/', label: 'AskMentions, see if AI answers mention you' },
];

export function otherSiteLinks(self = THIS_SITE) {
  return OTHER_SITES.filter((site) => site.host !== self);
}
