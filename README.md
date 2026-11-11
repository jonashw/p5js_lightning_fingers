<img src="lightning_fingers.png" width="300">

[Play now!](//jonashw.github.io/p5js_lightning_fingers) (touch device highly recommended)

## New versions (2026)

Both run on WebGL shaders (ISF) from the House Party toy kit, with no buttons or text on screen. Add `#knobs` to the address to get a control drawer.

- [`shader/`](shader/) is a faithful port of the original: same touch model, C13 chord, sparks, freeze and shake.
- [`plasma/`](plasma/) is a reimagined plasma globe. The bolts are simulated spring chains, fingers arc to each other, notes follow a chord progression, the globe charges up before each chord change, and tapping the core makes a jar that keeps the sparks. Add `#zaps` to turn the music off and keep only the electric sounds, or `#music` to keep the notes and drop the zaps. Add `#lamps` or `#lamps-both` to show the neon-lamp chord indicator.

**Switching versions on a tablet.** Keep one home-screen shortcut to the site root. A grown-up holds both bottom corners of the screen for 3 seconds, and a small black base slides up with a **Toy** switch (Original, Shader, Plasma). On Plasma the switch sits in its settings panel. The choice is saved on that tablet, and from then on the root address opens the chosen version. Add `#original`, `#shader` or `#plasma` to the root address to visit one version without changing the choice. The code is in [`switch.js`](switch.js).
