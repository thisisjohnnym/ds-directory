export type SectionId = 'work' | 'tools' | 'links' | 'team' | 'system'

export interface SidebarGroup {
  label: string
  items: string[]
}

export interface Section {
  id: SectionId
  index: number
  title: string
  tagline: string
  facts: string[]
  icon: string
  tone: string
  groups: SidebarGroup[]
}

/** Top to bottom on the landing dock. The number counts up from the bottom. */
export const sections: Section[] = [
  {
    id: 'work',
    index: 5,
    title: 'Work\nShowcase',
    tagline: 'UX/UI\nMotion',
    facts: ['4 Proyects', '5 Experiments'],
    icon: 'wall_art',
    tone: 'tone-work',
    groups: [
      { label: 'UI/UX', items: ['Logotype', 'Fonts', 'Colors', 'Imagery'] },
      {
        label: 'Research',
        items: ['PDP', 'PLP', 'Cart & Checkout', 'Home', 'Global Navigation'],
      },
    ],
  },
  {
    id: 'tools',
    index: 4,
    title: 'Tools Of\nThe Trade',
    tagline: 'Whatever Gets\nThe Job Done',
    facts: ['Figma', 'AI Tool'],
    icon: 'sdk',
    tone: 'tone-tools',
    groups: [{ label: 'Studio', items: ['Figma', 'Cursor', 'Claude'] }],
  },
  {
    id: 'links',
    index: 3,
    title: 'Links &\nResources',
    tagline: 'Design\nSystems',
    facts: ['Kate Spade', 'Coach'],
    icon: 'info',
    tone: 'tone-links',
    groups: [{ label: 'Brands', items: ['Kate Spade', 'Coach'] }],
  },
  {
    id: 'team',
    index: 2,
    title: 'Team\nDirectory',
    tagline: 'The Poeple\nBehind The Work',
    facts: ['8 Members', '3 Countries'],
    icon: 'group_add',
    tone: 'tone-team',
    groups: [],
  },
  {
    id: 'system',
    index: 1,
    title: 'Design\nSystems',
    tagline: 'Design Files &\nBrand Assets',
    facts: ['Kate Spade', 'Coach'],
    icon: 'brick',
    tone: 'tone-system',
    groups: [
      { label: 'Guidelines', items: ['Logotype', 'Fonts', 'Colors', 'Imagery'] },
      {
        label: 'Files',
        items: ['PDP', 'PLP', 'Cart & Checkout', 'Home', 'Global Navigation'],
      },
      {
        label: 'Links',
        items: ['Staging Links', 'Submit A Ticket', 'Baymard Connect', 'Github', 'Contact'],
      },
    ],
  },
]

export const sectionIds = sections.map((section) => section.id)

export function findSection(id: SectionId): Section {
  const section = sections.find((item) => item.id === id)
  if (!section) throw new Error(`Unknown section: ${id}`)
  return section
}

export interface Person {
  name: string
  role: string
  discipline: string
  location: string
  bio: string
  email: string
}

const bio =
  'Approaching every project with deep user-centered insight and overt passion for the craft, Sean has been the fresh creative force behind market-defining experiences for Coach and Kate Spade.'

export const people: Person[] = [
  {
    name: 'Johhny Martinez',
    role: 'Senior Visual Designer',
    discipline: 'UI / UX',
    location: 'NY, New York',
    bio,
    email: 'emartinez@tapestry.com',
  },
  {
    name: 'Sean Whitaker',
    role: 'Design Director',
    discipline: 'UI / UX',
    location: 'NY, New York',
    bio,
    email: 'swhitaker@tapestry.com',
  },
  {
    name: 'Amara Osei',
    role: 'Product Designer',
    discipline: 'Product',
    location: 'London, UK',
    bio,
    email: 'aosei@tapestry.com',
  },
  {
    name: 'Luca Ferraro',
    role: 'Motion Designer',
    discipline: 'Motion',
    location: 'Milan, Italy',
    bio,
    email: 'lferraro@tapestry.com',
  },
  {
    name: 'Priya Raman',
    role: 'Design Systems Lead',
    discipline: 'Systems',
    location: 'NY, New York',
    bio,
    email: 'praman@tapestry.com',
  },
  {
    name: 'Tomas Bergstrom',
    role: 'UX Researcher',
    discipline: 'Research',
    location: 'London, UK',
    bio,
    email: 'tbergstrom@tapestry.com',
  },
  {
    name: 'Nia Calloway',
    role: 'Visual Designer',
    discipline: 'UI / UX',
    location: 'NY, New York',
    bio,
    email: 'ncalloway@tapestry.com',
  },
  {
    name: 'Gio Palermo',
    role: 'Prototyper',
    discipline: 'Motion',
    location: 'Milan, Italy',
    bio,
    email: 'gpalermo@tapestry.com',
  },
]

export interface Project {
  title: string
  status: string
  discipline: string
  stage: string
  group: string
}

export const projects: Project[] = [
  {
    title: 'KSNA — PDP 7.0',
    status: 'Project Launched',
    discipline: 'UI / UX',
    stage: 'UI/UX - Live',
    group: 'PDP',
  },
  {
    title: 'PLP 3.0',
    status: 'Project Launched',
    discipline: 'UI / UX',
    stage: 'UI/UX - Live',
    group: 'PLP',
  },
  {
    title: 'Cart Rewrite',
    status: 'In Review',
    discipline: 'UI / UX',
    stage: 'UI/UX - Staging',
    group: 'Cart & Checkout',
  },
  {
    title: 'Home 2.4',
    status: 'In Progress',
    discipline: 'Motion',
    stage: 'Motion - Draft',
    group: 'Home',
  },
]

export interface ResourceRow {
  title: string
  note: string
  action: string
  group: string
}

/** Tools and Links have no open screen in the source file. These rows stand in
    for that content using the copy drawn on their landing banners. */
export const resourceRows: Record<'tools' | 'links', ResourceRow[]> = {
  tools: [
    { title: 'Figma', note: 'Source of truth for UI and specs', action: 'Open', group: 'Figma' },
    { title: 'Cursor', note: 'Design engineering and handoff', action: 'Open', group: 'Cursor' },
    { title: 'Claude', note: 'Research, copy and exploration', action: 'Open', group: 'Claude' },
  ],
  links: [
    {
      title: 'Kate Spade',
      note: 'Staging links, tickets and brand contacts',
      action: 'Open',
      group: 'Kate Spade',
    },
    {
      title: 'Coach',
      note: 'Staging links, tickets and brand contacts',
      action: 'Open',
      group: 'Coach',
    },
  ],
}
