// All visitor-facing content lives here. Projects, experience, email and links
// are placeholders — replace them with real details before publishing.

export const PERSON = {
  name: "Hemant Thakur",
  initials: "HT",
  role: "Engineer, writer and composer",
  summary:
    "Computer engineering student building across the stack, from bare-metal C to the browser, and writing verses in between.",
  status: "Open to internships and research",
}

export const LINKS: {
  email: string
  github: string
  linkedin: string
  /** Path or URL to the résumé PDF; null shows a "coming soon" state instead of a dead link. */
  resume: string | null
  /** While true, the contact section says the email is a placeholder. Set to false once it is real. */
  placeholder: boolean
} = {
  email: "hello@hemant.dev",
  github: "https://github.com/hemantthakur",
  linkedin: "https://linkedin.com/in/hemantthakur",
  resume: null,
  placeholder: true,
}

export const NAV = [
  { ref: "U1", id: "about", label: "About" },
  { ref: "U2", id: "stack", label: "Stack" },
  { ref: "U3", id: "work", label: "Work" },
  { ref: "U4", id: "log", label: "Log" },
  { ref: "U5", id: "writing", label: "Writing" },
  { ref: "J1", id: "contact", label: "Contact" },
] as const

export const ABOUT = {
  heading: "Curious by design.",
  body: [
    "I'm Hemant, a Computer Engineering student working where hardware meets software: custom OS internals, multi-core ARMv8, predictive models, and interfaces people actually enjoy using.",
    "I learn by building, and when the code sleeps I write: shayari, poems, and songs I compose myself. Both are about finding the exact word, or the exact line, that makes the whole thing work.",
  ],
  question: "What becomes possible when every layer of the stack is genuinely understood?",
  specs: [
    ["Discipline", "Computer Engineering"],
    ["Works across", "Systems · ML · Web & graphics"],
    ["Also writes", "Shayari · poems · songs"],
    ["Looking for", "Internships, research, hard problems"],
  ] as const,
}

/** The stack as a PCB layer stackup: top layer is closest to the user, bottom is closest to the metal. */
export const STACKUP = [
  {
    id: "L1",
    name: "Interface",
    note: "What people touch",
    parts: [
      { ref: "U11", part: "TypeScript", pkg: "Language" },
      { ref: "U12", part: "React", pkg: "UI" },
      { ref: "U13", part: "Next.js", pkg: "Framework" },
      { ref: "U14", part: "Three.js", pkg: "3D" },
      { ref: "U15", part: "WebGL", pkg: "Graphics" },
    ],
  },
  {
    id: "L2",
    name: "Services",
    note: "What keeps it running",
    parts: [
      { ref: "U21", part: "Node.js", pkg: "Runtime" },
      { ref: "U22", part: "PostgreSQL", pkg: "Data" },
      { ref: "U23", part: "Docker", pkg: "DevOps" },
    ],
  },
  {
    id: "L3",
    name: "Intelligence",
    note: "What learns from it",
    parts: [{ ref: "U31", part: "Python", pkg: "ML · Tools" }],
  },
  {
    id: "L4",
    name: "Systems",
    note: "Closest to the silicon",
    parts: [
      { ref: "U41", part: "C", pkg: "Systems" },
      { ref: "U42", part: "C++", pkg: "Systems" },
      { ref: "U43", part: "Rust", pkg: "Systems" },
      { ref: "U44", part: "Linux", pkg: "OS" },
      { ref: "U45", part: "Git", pkg: "Tooling" },
    ],
  },
] as const

export const PROJECTS = [
  {
    id: "neuralbridge",
    title: "NeuralBridge",
    domain: "ML · Embedded",
    year: "2024",
    desc: "Predictive machine learning for heavy industrial machinery. Deployed models, not demos.",
    points: ["The problem", "Data pipeline", "Model training", "Deployment", "Field results"],
  },
  {
    id: "kernelflow",
    title: "KernelFlow",
    domain: "Systems · ARMv8",
    year: "2024",
    desc: "Low-level tooling for multi-core ARMv8 architectures and custom OS internals.",
    points: ["Architecture", "Scheduler", "IPC", "ARMv8 port", "Benchmarks"],
  },
  {
    id: "quantumsim",
    title: "QuantumSim",
    domain: "Research · Simulation",
    year: "2023",
    desc: "A quantum circuit simulator built to make simulation accessible to curious minds.",
    points: ["Qubits", "Gates", "State vector", "WebGL view", "UX"],
  },
  {
    id: "aerobot",
    title: "AeroBot",
    domain: "Robotics · Autonomy",
    year: "2023",
    desc: "An autonomous drone platform with perception and control, deployed on ARM targets.",
    points: ["Perception", "SLAM", "Control", "ARM target", "Flight logs"],
  },
] as const

export const EXPERIENCE = [
  {
    ch: "CH0",
    title: "Research Fellow",
    copy: "Built accessible tooling for a research group, turning internal workflows into something anyone could use.",
  },
  {
    ch: "CH1",
    title: "Predictive ML",
    copy: "Designed predictive models for heavy industrial machinery to cut unplanned downtime.",
  },
  {
    ch: "CH2",
    title: "Systems Intern",
    copy: "Worked on multi-core ARMv8 architectures and custom OS internals, where silicon meets software.",
  },
  {
    ch: "CH3",
    title: "Open Source",
    copy: "Contributed to open research projects, making complex systems legible and reproducible.",
  },
] as const

export type WritingForm = "Shayari" | "Poem" | "Song"

/**
 * SAMPLE PIECES: written as stand-ins so the section can be designed. Replace them with your
 * own shayari, poems and songs, then set WRITING_IS_SAMPLE to false.
 * Lines can be in any script (Devanagari and Roman Hindi both work).
 */
export const WRITING: {
  id: string
  form: WritingForm
  title: string
  year: string
  lang: string
  /** Songs: the composer's sheet details. */
  key?: string
  tempo?: string
  /** Blank strings separate stanzas; lines starting with "[" are section labels (e.g. [Chorus]). */
  lines: string[]
}[] = [
  {
    id: "semicolon",
    form: "Shayari",
    title: "Semicolon",
    year: "2025",
    lang: "Roman Hindi",
    lines: [
      "Raat bhar code likha, subah tak bug na mila,",
      "tumhari yaad ka ek semicolon chhoot gaya tha.",
    ],
  },
  {
    id: "khamoshi",
    form: "Shayari",
    title: "खामोशी",
    year: "2024",
    lang: "Hindi",
    lines: ["बातें तो बहुत थीं, लफ़्ज़ कम पड़ गए,", "ख़ामोशी ने कह दिया जो हम कह न सके।"],
  },
  {
    id: "compile",
    form: "Poem",
    title: "Compile",
    year: "2025",
    lang: "English",
    lines: [
      "I write the way I build:",
      "a line, a test, a quiet wait",
      "for something small to hold its weight.",
      "",
      "Some nights the words won't run.",
      "I read them back, I trace the call,",
      "and find the one that broke them all.",
      "",
      "Then morning, and it compiles,",
      "not perfect, only true enough",
      "to send into the world, and love.",
    ],
  },
  {
    id: "monsoon-signal",
    form: "Song",
    title: "Monsoon Signal",
    year: "2025",
    lang: "Hindi · English",
    key: "D minor",
    tempo: "84 BPM",
    lines: [
      "[Verse]",
      "Bheegi si sadkon pe tera naam likha,",
      "har boond mein ek purana paigaam likha.",
      "",
      "[Chorus]",
      "Signal kho jaaye, tu paas rehna,",
      "baarish ke shor mein bhi mujhse kehna.",
      "",
      "[Verse]",
      "City lights blur into a slower song,",
      "I've been waiting for the rain all along.",
    ],
  },
  {
    id: "neend",
    form: "Song",
    title: "Neend",
    year: "2024",
    lang: "Hindi",
    key: "A major",
    tempo: "72 BPM",
    lines: [
      "[Verse]",
      "Chaand ki khidki pe baithi hai raat,",
      "dheere se kehti hai poori baat.",
      "",
      "[Chorus]",
      "So ja, so ja, sapnon ke paar,",
      "subah tak rakh lenge hum intezaar.",
    ],
  },
]
export const WRITING_IS_SAMPLE = true
