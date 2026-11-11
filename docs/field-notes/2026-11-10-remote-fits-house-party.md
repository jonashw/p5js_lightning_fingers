---
date: 2026-11-10
repo: jonashw/p5js_lightning_fingers
kind: preference
area: architecture
---
Situation: Proposed a small relay so a parent's phone could tune the toy on a child's tablet.
Jon said: "Keep the overall build of the House Party app in mind, please."
Observed: House Party already has a Mac bridge, Cloudflare Workers and a planned "phone as controller" step for the Party Wall.
Inferred (my reading): Cross-device features for kids' toys should reuse House Party's controller channel, not add one-off infrastructure; decide it with the scene-composition architecture work.
