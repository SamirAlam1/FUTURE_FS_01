/* ─── Developer ──────────────────────────────────────────── */

export const DEVELOPER = {
  name: 'Samir Alam',
  firstName: 'Samir',
  title: 'Full-Stack Developer',
  tagline: 'Building scalable web applications with the MERN stack.',
  email: 'sa0409716@gmail.com',
  location: 'India',
  available: true,

  bio: `I'm a full-stack developer focused on building fast, maintainable, and user-centred web applications. I work primarily with the MERN stack — React on the front-end, Node.js and Express on the back-end, and MongoDB for data persistence.

I care about clean architecture, good API design, and interfaces that feel considered. Beyond the code, I'm interested in developer experience, performance optimisation, and the craft of building software that scales.`,

  shortBio:
    'Full-stack developer focused on the MERN stack — building fast, user-centred web applications with clean architecture and good API design.',

  socials: {
    github: 'https://github.com/SamirAlam1',
    linkedin: 'https://linkedin.com/in/samir-alam1',
    twitter: '',
  },

  resumeUrl: '#',
}

/* ─── Skills ─────────────────────────────────────────────── */

export type Skill = {
  id: string
  name: string
  category: string
  proficiency: number
}

export const SKILLS: Skill[] = [
  // Languages
  {
    id: '1',
    name: 'JavaScript',
    category: 'Languages',
    proficiency: 90,
  },
  {
    id: '2',
    name: 'TypeScript',
    category: 'Languages',
    proficiency: 78,
  },
  {
    id: '3',
    name: 'Python',
    category: 'Languages',
    proficiency: 60,
  },

  // Frontend
  {
    id: '4',
    name: 'React',
    category: 'Frontend',
    proficiency: 90,
  },
  {
    id: '5',
    name: 'Next.js',
    category: 'Frontend',
    proficiency: 72,
  },
  {
    id: '6',
    name: 'Tailwind CSS',
    category: 'Frontend',
    proficiency: 88,
  },
  {
    id: '7',
    name: 'HTML & CSS',
    category: 'Frontend',
    proficiency: 92,
  },
  {
    id: '8',
    name: 'Redux',
    category: 'Frontend',
    proficiency: 75,
  },

  // Backend
  {
    id: '9',
    name: 'Node.js',
    category: 'Backend',
    proficiency: 88,
  },
  {
    id: '10',
    name: 'Express.js',
    category: 'Backend',
    proficiency: 86,
  },
  {
    id: '11',
    name: 'REST APIs',
    category: 'Backend',
    proficiency: 90,
  },
  {
    id: '12',
    name: 'JWT / Auth',
    category: 'Backend',
    proficiency: 82,
  },

  // Database
  {
    id: '13',
    name: 'MongoDB',
    category: 'Database',
    proficiency: 85,
  },
  {
    id: '14',
    name: 'Mongoose',
    category: 'Database',
    proficiency: 83,
  },
  {
    id: '15',
    name: 'PostgreSQL',
    category: 'Database',
    proficiency: 55,
  },

  // Tools
  {
    id: '16',
    name: 'Git & GitHub',
    category: 'Tools',
    proficiency: 88,
  },
  {
    id: '17',
    name: 'Docker',
    category: 'Tools',
    proficiency: 55,
  },
  {
    id: '18',
    name: 'Vite',
    category: 'Tools',
    proficiency: 80,
  },
  {
    id: '19',
    name: 'Postman',
    category: 'Tools',
    proficiency: 85,
  },
  {
    id: '20',
    name: 'Vercel / Render',
    category: 'Tools',
    proficiency: 80,
  },
]

export const SKILL_CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend',
  'Database',
  'Tools',
]

/* ─── Education ──────────────────────────────────────────── */

export type Education = {
  id: string
  institution: string
  degree: string
  field: string
  board?: string
  startYear: string
  endYear: string
  grade?: string
  description?: string
}

export const EDUCATION: Education[] = [
  {
    id: '1',
    institution: 'University / Institute',
    degree: 'Bachelor of Technology',
    field: 'Computer Science & Engineering',
    board: '',
    startYear: '2020',
    endYear: '2024',
    grade: '',
    description:
      'Core coursework in data structures, algorithms, operating systems, databases, and web engineering. Final year project focused on full-stack application development.',
  },
]

/* ─── Experience ─────────────────────────────────────────── */

export type Experience = {
  id: string
  company: string
  role: string
  type: string
  startDate: string
  endDate: string
  location: string
  description: string
  highlights: string[]
}

export const EXPERIENCE: Experience[] = [
  {
    id: '1',
    company: 'Company / Organisation',
    role: 'Full-Stack Developer Intern',
    type: 'Internship',
    startDate: 'Jun 2023',
    endDate: 'Aug 2023',
    location: 'Remote',
    description:
      'Developed and maintained features across the full web stack. Contributed to REST API design and front-end component architecture.',
    highlights: [
      'Built and shipped three customer-facing features using React and Node.js',
      'Improved API response time by refactoring data-fetching logic',
      'Collaborated with the design team to implement responsive UI components',
    ],
  },
]

/* ─── Certifications ─────────────────────────────────────── */

export type Certification = {
  id: string
  title: string
  issuer: string
  date: string
  credentialUrl?: string
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: '1',
    title: 'MongoDB Developer Path',
    issuer: 'MongoDB University',
    date: '2023',
    credentialUrl: '',
  },
  {
    id: '2',
    title: 'Node.js Application Developer',
    issuer: 'OpenJS Foundation',
    date: '2023',
    credentialUrl: '',
  },
  {
    id: '3',
    title: 'React — The Complete Guide',
    issuer: 'Udemy / Maximilian Schwarzmüller',
    date: '2022',
    credentialUrl: '',
  },
]

/* ─── Projects ───────────────────────────────────────────── */

export type Project = {
  id: string
  title: string
  description: string
  techStack: string[]
  category: string
  year: string
  featured: boolean
  liveUrl?: string
  githubUrl?: string
  image?: string
  highlights?: string[]
}

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Portfolio CMS',
    description:
      'A full-stack portfolio and content management system built with the MERN stack. Features JWT authentication, a headless admin dashboard, and full CRUD for projects, skills, and education.',
    techStack: [
      'React',
      'Node.js',
      'Express',
      'MongoDB',
      'JWT',
      'Tailwind CSS',
    ],
    category: 'Full-Stack',
    year: '2024',
    featured: true,
    liveUrl: 'https://samiralam-portfolio.vercel.app',
    githubUrl: 'https://github.com/SamirAlam1/FUTURE_FS_01',
    image:
      'https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=800&h=500&fit=crop&auto=format',
    highlights: [
      'JWT-based auth',
      'Admin CMS',
      'MongoDB data models',
      'Vercel deployment',
    ],
  },

  {
    id: '2',
    title: 'E-Commerce Platform',
    description:
      'A full-featured e-commerce application with product catalogue, cart, order management, and Stripe payment integration. Built with MERN and Redux Toolkit for state management.',
    techStack: [
      'React',
      'Redux',
      'Node.js',
      'MongoDB',
      'Stripe',
      'Express',
    ],
    category: 'Full-Stack',
    year: '2024',
    featured: true,
    liveUrl: '',
    githubUrl: '',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop&auto=format',
    highlights: [
      'Stripe integration',
      'Redux state',
      'Order tracking',
      'Admin dashboard',
    ],
  },

  {
    id: '3',
    title: 'Task Management App',
    description:
      'A real-time collaborative task management application with Kanban boards, drag-and-drop ordering, user assignments, and live updates via WebSockets.',
    techStack: [
      'React',
      'Node.js',
      'MongoDB',
      'Socket.io',
      'Express',
    ],
    category: 'Full-Stack',
    year: '2023',
    featured: true,
    liveUrl: '',
    githubUrl: '',
    image:
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=500&fit=crop&auto=format',
    highlights: [
      'Real-time updates',
      'WebSocket integration',
      'Drag-and-drop',
      'Multi-user',
    ],
  },

  {
    id: '4',
    title: 'REST API Boilerplate',
    description:
      'A production-ready Node.js/Express REST API boilerplate with MongoDB, JWT auth, request validation, error handling, rate limiting, and structured logging.',
    techStack: [
      'Node.js',
      'Express',
      'MongoDB',
      'JWT',
      'Joi',
    ],
    category: 'Backend',
    year: '2023',
    featured: true,
    liveUrl: '',
    githubUrl: '',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop&auto=format',
    highlights: [
      'JWT auth',
      'Validation',
      'Rate limiting',
      'Structured logging',
    ],
  },

  {
    id: '5',
    title: 'Blog Platform',
    description:
      'A developer blog platform with markdown support, syntax highlighting, tag-based filtering, and an intuitive writing experience. Optimised for reading performance and SEO.',
    techStack: [
      'Next.js',
      'React',
      'MongoDB',
      'Tailwind CSS',
    ],
    category: 'Frontend',
    year: '2023',
    featured: false,
    liveUrl: '',
    githubUrl: '',
    image:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop&auto=format',
    highlights: [
      'Markdown rendering',
      'Syntax highlighting',
      'Tag filtering',
      'SEO optimised',
    ],
  },

  {
    id: '6',
    title: 'Weather Dashboard',
    description:
      'A responsive weather dashboard aggregating real-time data from the OpenWeatherMap API, showing current conditions, 7-day forecasts, and historical trends.',
    techStack: [
      'React',
      'OpenWeatherMap API',
      'Chart.js',
      'Tailwind CSS',
    ],
    category: 'Frontend',
    year: '2023',
    featured: false,
    liveUrl: '',
    githubUrl: '',
    image:
      'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&h=500&fit=crop&auto=format',
    highlights: [
      'Real-time data',
      '7-day forecast',
      'Data visualisation',
      'Responsive',
    ],
  },
]

export const PROJECT_CATEGORIES = [
  'All',
  'Full-Stack',
  'Frontend',
  'Backend',
]

/* ─── Messages ───────────────────────────────────────────── */

export type Message = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  date: string
  read: boolean
}

export const MESSAGES: Message[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    subject: 'Collaboration opportunity',
    message:
      "Hi Samir, I came across your portfolio and was really impressed by your work on the Portfolio CMS. I'm working on a similar project and would love to discuss a potential collaboration. Would you be open to a quick call?",
    date: '2024-12-10',
    read: false,
  },

  {
    id: '2',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    subject: 'Freelance project inquiry',
    message:
      "Hello! We're looking for a MERN stack developer to build a product management tool for our team. Your projects look relevant — are you available for freelance work?",
    date: '2024-12-08',
    read: true,
  },

  {
    id: '3',
    name: 'Kavya Nair',
    email: 'kavya.nair@example.com',
    subject: 'Question about Portfolio CMS',
    message:
      "Great work on the portfolio! Quick question: how did you handle token refresh in your JWT implementation? I'm running into expiry issues in my own project.",
    date: '2024-12-05',
    read: true,
  },
]

/* ─── Admin stats ────────────────────────────────────────── */

export const ADMIN_STATS = {
  totalProjects: PROJECTS.length,
  publishedProjects: PROJECTS.filter(project => project.featured).length,
  totalSkills: SKILLS.length,
  totalEducation: EDUCATION.length,
  totalMessages: MESSAGES.length,
  unreadMessages: MESSAGES.filter(message => !message.read).length,
}