---
date: 2026-11-10
repo: jonashw/p5js_lightning_fingers
kind: correction
area: ui-ux
---
Situation: First reimagining drew bolts per pixel from noise re-picked 14 times a second; a second pass slid the zigzag corners continuously.
Jon said: "I still hope for the lightning simulation to improve here; it is presently too choppy." Then, after the smoothing pass: "The lightning is still too choppy for my taste. what technique have you used for that?"
Observed: Both noise-only versions read as jerky; he asked about the technique, not just the look.
Inferred (my reading): He wants electricity that is actually simulated, with continuity frame to frame. Bolts are now spring chains (24 points with springs, drifting noise, damping and crackle kicks) that the page steps and the shader draws.
