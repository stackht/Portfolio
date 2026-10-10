---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/board"]
---

# Surface brief: home (/)

Scope: the single-page portfolio at `/`. Visitor mode: Experience, with Persuade duties (name, role, proof and contact all reachable within 30 seconds).
Audience: recruiters, research labs, freelance clients and fellow developers (see PRODUCT.md). All content is placeholder in `src/content/site.ts`.
Constraints: static export; one three.js hero centerpiece; WebGPU (vgpu) only as progressive enhancement; liquidGL for the project lens; reduced-motion and no-GPU fallbacks render complete content.

History: the user rejected "Populated Board" (the PCB/chip concept and the purple, then black-and-gold palettes) on 2026-10-10. They kept its motion system and the Funnel type, and chose the direction below.

## Direction contract

THESIS: Liquid glass and light. A morphing glass sculpture bends the page's own artwork, and the whole site behaves like light through glass. The page refuses the category default of a dark neon portfolio with a header bar and a bento card grid.

OWN-WORLD: A cool ice ground (#f3f4f6) with ink type (#0d1117) and a single cobalt accent (#2b50ff). Cobalt carries every action and one full-bleed band (the Stack section, with frosted-glass layers). Funnel Display is set tight for display and Funnel Sans for prose. Martian Mono appears only for small data labels. Radii are 12px for interactive elements and 20px for containers. A faint grain sits over everything.

STORY: The visitor sees the name beside a living glass sculpture, reads a statement that lights up word by word, watches the stack layers pull apart on the cobalt band, inspects projects with a glass lens over their generated covers, scrubs the analyser timeline, and contacts him through large link rows over cobalt caustics.

FIRST VIEWPORT: The name in two lines on the left, then a 19-word role line, the cobalt "See the work" and white "Contact" buttons, and the availability dot. On the right, a three.js transmission sculpture in front of an orbiting cobalt ring, refracting a canvas backdrop with live flow lines that bend away from the cursor. Navigation is a glass orb at the top right, with the name pill at the top left.

FORM: Liquid glass, chosen by the user over the particle, terrain and orbiting-object options. Signature interactions: the cursor bends the flow lines through the glass, and the orb stretches left into a glass capsule.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Unresolved: real project details, real links and email, the résumé PDF, and a DESIGN.md for this direction.
