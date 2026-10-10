# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyone who might hire, recruit, or collaborate with Hemant Thakur, with no single audience ranked first:
- engineering recruiters and hiring managers screening for internships, often on a phone or laptop with about 30 seconds to spare;
- research labs and professors judging depth in systems and ML work;
- freelance clients looking for evidence of polish and a clear way to hire;
- fellow developers who come for the craft of the site itself.

Their job: understand who Hemant is, see proof of skill, and reach him.

## Product Purpose

A personal portfolio for Hemant Thakur, a Computer Engineering student who works across the stack from bare-metal C and ARMv8/OS internals to ML and the browser. Success: a visitor leaves knowing what he builds and contacts him (email, GitHub, LinkedIn, résumé).

## Positioning

He works across silicon and software: hardware-aware systems work together with modern web and graphics. The site itself should show that range by using real GPU techniques (WebGPU, WebGL, three.js), and should not only claim it.

## Capabilities and Constraints

- Next.js 16 static export (`output: "export"`), webpack build, React 19, Tailwind 4.
- One 3D/WebGPU centerpiece in the hero; the rest stays lightweight. It must degrade gracefully on weak devices, without WebGPU, and with `prefers-reduced-motion`.
- The user asked for liquidGL (liquid glass), vgpu (WebGPU), canvas UI, Aceternity-UI-style components and three.js.
- `backend/` (an OTP/accounts API) is separate and not part of the portfolio surface.

## Brand Commitments

- Name: Hemant Thakur. Mark: "HT".
- The redesign fully replaces the previous look. Nothing from it is binding.

## Evidence on Hand

All current content is placeholder and must be visibly replaceable:
- projects NeuralBridge, KernelFlow, QuantumSim and AeroBot (`src/components/PortfolioExperience.tsx`);
- four experience entries (Research Fellow, Predictive ML, Systems Intern, Open Source);
- the email hello@hemant.dev, the GitHub and LinkedIn URLs, and the résumé link (`#`).

Do not invent metrics, employers, dates, testimonials or press beyond what exists.

## Product Principles

1. Proof over adjectives: show the work and the range of the stack.
2. Thirty-second clarity: name, role, what he builds, and contact are all reachable from the first viewport.
3. The craft is the demo: GPU effects carry meaning about silicon and software, and are never decoration only.
4. Fast everywhere: phones and low-end laptops get a complete, quick site.

## Accessibility & Inclusion

WCAG 2.1 AA contrast, full keyboard access, and `prefers-reduced-motion` respected. Content stays readable without WebGL/WebGPU.
