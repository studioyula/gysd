# Project Routing Notes

Keep this file light. Use it only to decide which deeper instruction file or skill to consult.

## Project Root And Version Policy

This folder is the project root:

`/Users/BOMY/_MASTER/01_Studio_Yula/01_Projects/01_Recent/2026.02_공여사들_시스템,창립자페이지/02_작업/창립자스토리`

- `v1_260605_client` is the client-shared version. Do not edit it unless BOMY explicitly asks.
- `v2_260609_working` is the current local working version. Make ordinary page edits there.
- Do not publish `*_working` folders to GitHub/Vercel.
- Only `*_client` folders and the root `index.html` should be public on Vercel.
- Do not create separate deploy copies in `/private/tmp` or elsewhere. This project root is the GitHub/Vercel source.

## HTML, Prototype, And Vibe Coding

For HTML/CSS/JavaScript prototypes, static pages, local preview work, visual polish, or Vercel/GitHub deploy iteration:

- Use the `html-vibe-coding-workflow` skill first.
- Classify the edit depth before working.
- Keep small text, spacing, image, and simple timing edits scoped and fast.
- Unless BOMY explicitly asks otherwise, section height should default to the browser viewport height.

## Motion And Scroll Interaction Work

For `motion-test-*`, `motion-scroll-*`, SVG motion, shape morphing, scroll-driven animation, visual checkpoints, or timing/key-frame changes:

- Use the `motion-morph-workflow` skill first.
- Detailed rules live at `/Users/BOMY/.codex/skills/motion-morph-workflow/SKILL.md`.
- Preserve confirmed preview files unless the user explicitly asks to replace them.
