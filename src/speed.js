// Speed readout and speed run for the original sketch, as every House Party toy has them (/lib/hp-perf.js).
// Readout: F, #fps on the address, or the Speed readout switch on the grown-up base (hold both bottom corners,
// or G). Speed run: the Record a speed run button on that base, or #perfrun on the address. The run plays the
// toy hands off for 40 seconds using its own keys (fingers 1, 3, 5 and 10, shakes, every wave, pausing), with
// its sound, then lets go and shows a report to copy or save. Nothing is sent anywhere.
import { createPerf } from "/lib/hp-perf.js";

const perf = createPerf({ toy: "lightning-fingers" });
perf.watchFrames(); // p5 draws on animation frames

const codes = { " ": 32, w: 87, u: 85, d: 68, g: 71 };
const code = (k) => codes[k] || k.toUpperCase().charCodeAt(0);
const fire = (type, key) => window.dispatchEvent(new KeyboardEvent(type, { key, keyCode: code(key), which: code(key), bubbles: true }));
const hold = (key) => fire("keydown", key);
const lift = (key) => fire("keyup", key);
const tap = (key) => {
  fire("keydown", key);
  fire("keypress", key);
  fire("keyup", key);
};

function spec() {
  const base = document.querySelector(".lfs-base");
  const wasOpen = !!(base && base.classList.contains("open"));
  return {
    seconds: 40,
    steps: [
      { at: 0.5, mark: wasOpen ? "settings closed" : undefined, run: () => wasOpen && tap("g") },
      { at: 2, mark: "3 fingers", run: () => hold("3") },
      { at: 6, mark: "let go", run: () => lift("3") },
      { at: 7, mark: "10 fingers", run: () => hold("0") },
      { at: 10, mark: "shake", run: () => tap(" ") },
      { at: 13, mark: "let go", run: () => lift("0") },
      { at: 14, mark: "next wave", run: () => tap("w") },
      { at: 15, mark: "1 finger", run: () => hold("1") },
      { at: 18, mark: "let go", run: () => lift("1") },
      { at: 19, mark: "5 fingers", run: () => hold("5") },
      { at: 21, mark: "shake", run: () => tap(" ") },
      { at: 23, mark: "let go", run: () => lift("5") },
      { at: 24, mark: "next wave", run: () => tap("w") },
      { at: 25, mark: "10 fingers", run: () => hold("0") },
      { at: 27, mark: "next wave", run: () => tap("w") },
      { at: 28, mark: "next wave, back to the first", run: () => tap("w") },
      { at: 30, mark: "let go", run: () => lift("0") },
      { at: 31, mark: "shake", run: () => tap(" ") },
      { at: 33, mark: "updating paused", run: () => tap("u") },
      { at: 35, mark: "updating resumed", run: () => tap("u") },
      { at: 36, mark: "drawing paused", run: () => tap("d") },
      { at: 38, mark: "drawing resumed", run: () => tap("d") },
    ],
    done: () => {
      ["0", "1", "3", "5"].forEach(lift);
      if (wasOpen && !base.classList.contains("open")) tap("g");
    },
  };
}

// The switch and button go on the grown-up base that switch.js builds, so children don't meet them.
function mount(tries = 0) {
  const base = document.querySelector(".lfs-base");
  if (!base) {
    if (tries < 50) setTimeout(() => mount(tries + 1), 100);
    return;
  }
  const css = document.createElement("style");
  css.textContent =
    ".lfs-base{flex-wrap:wrap;gap:14px}.lf-speed{width:100%;justify-content:center;font-size:13px}" +
    ".lf-speed button{font:inherit;padding:8px 12px;border-radius:10px;border:1px solid #4a443c;background:#26231f;color:#ffb27a;cursor:pointer}" +
    ".lf-speed kbd{font:600 11px ui-monospace,Menlo,monospace;padding:2px 5px;border-radius:4px;border:1px solid #4a443c}";
  document.head.appendChild(css);
  perf.mountControls(base, { spec, rowClass: "lf-speed" });
}
mount();
if (/#perfrun\b/.test(location.hash)) perf.autorun(spec());
