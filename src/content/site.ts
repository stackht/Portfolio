// All visitor-facing content lives here. Projects, experience, email and links
// are placeholders — replace them with real details before publishing.

export const PERSON = {
  name: "Hemant Thakur",
  initials: "HT",
  role: "Computer Engineering student",
  summary:
    "I build across the whole stack, from bare-metal C and OS internals to machine learning and the browser.",
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
  { ref: "J1", id: "contact", label: "Contact" },
] as const

export const ABOUT = {
  heading: "Curious by design.",
  body: [
    "I'm Hemant, a Computer Engineering student working where hardware meets software: custom OS internals, multi-core ARMv8, predictive models, and interfaces people actually enjoy using.",
    "I learn by building, and I build things I would use myself. Precise, deliberate, and measured by outcomes rather than demos.",
  ],
  question: "What becomes possible when every layer of the stack is genuinely understood?",
  specs: [
    ["Discipline", "Computer Engineering"],
    ["Works across", "Systems · ML · Web & graphics"],
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
