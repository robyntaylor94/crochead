 document.addEventListener("DOMContentLoaded", () => {
 // ----------------------------
  // Grab elements
  // ----------------------------
  const channelSelect = document.getElementById("channelSelect");
  const viewsInput = document.getElementById("viewsInput");
  const engInput = document.getElementById("engInput");
  const erInput = document.getElementById("erInput");

  const checkBtn = document.getElementById("checkBtn");
  const result = document.getElementById("result");
const needle = document.getElementById("needle");
needle.style.setProperty("--needle-angle", "-90deg");
needle.classList.add("hovering");



  const vibesBtn = document.getElementById("vibesBtn");
  const vibesAudio = document.getElementById("vibesAudio");

  // ----------------------------
  // Benchmarks + ER goals (replace with your real sheet numbers)
  // viewsAvg + engAvg are averages (tiered comparisons)
  // erGoal is a goal threshold
  // ----------------------------
  const BENCHMARKS = {
    instagram: { viewsAvg: 5000, engAvg: 800, erGoal: 6.0 },
    tiktok:    { viewsAvg: 7000, engAvg: 900, erGoal: 10.0 },
    facebook:  { viewsAvg: 5500, engAvg: 600, erGoal: 4.0 },
    x:         { viewsAvg: 2000, engAvg: 300, erGoal: 3.0 },
    youtube:   { viewsAvg: 7500, engAvg: 250, erGoal: 4.0 } // placeholder for now
  };

  // Needle mapping (still used for dial positions)
  const thresholds = {
    instagram: [2, 4, 6],
    tiktok:    [4, 7, 10],
    facebook:  [1, 2.5, 4],
    x:         [0.5, 1.5, 3],
    youtube:   [1, 2.5, 4]
  };

  // ----------------------------
  // Helpers
  // ----------------------------
  function tierVsAvg(value, avg, low = 0.8, high = 1.2) {
    if (!Number.isFinite(value) || !Number.isFinite(avg) || avg <= 0) return null;
    const ratio = value / avg;
    if (ratio < low) return "below";
    if (ratio > high) return "above";
    return "onpar";
  }

  function hasAtLeastOneMetric() {
    const views = Number(viewsInput.value);
    const eng = Number(engInput.value);
    const er = Number(erInput.value);

    return (
      (Number.isFinite(views) && views > 0) ||
      (Number.isFinite(eng) && eng > 0) ||
      (Number.isFinite(er) && er > 0)
    );
  }

  function updateGaugeButtonState() {
    const hasChannel = channelSelect.value !== "";
    checkBtn.disabled = !(hasChannel && hasAtLeastOneMetric());
  }

  // ----------------------------
  // VIBES logic
  // ----------------------------
  let vibesTimer = null;
  let isVibing = false;

  function stopVibes() {
    if (vibesTimer) {
      clearTimeout(vibesTimer);
      vibesTimer = null;
    }
    vibesAudio.pause();
    vibesAudio.currentTime = 0;
    isVibing = false;
    vibesBtn.classList.remove("playing");
  }

  function startVibes() {
    vibesAudio.currentTime = 0;

    vibesAudio.play().then(() => {
      isVibing = true;
      vibesBtn.classList.add("playing");

      vibesTimer = setTimeout(() => stopVibes(), 20000);
    }).catch(() => {
      isVibing = false;
      vibesBtn.classList.remove("playing");
      alert("Tap VIBES again to allow audio playback.");
    });
  }

  vibesBtn.addEventListener("click", () => {
    if (isVibing) stopVibes();
    else startVibes();
  });

  // ----------------------------
  // Jibbit rain
  // ----------------------------
  let jibbitInterval = null;

  function startJibbitRain(durationMs = 2200) {
    const rain = document.getElementById("jibbitRain");
    if (!rain) return;

    stopJibbitRain();
    const start = Date.now();

    jibbitInterval = setInterval(() => {
      if (Date.now() - start > durationMs) {
        stopJibbitRain();
        return;
      }

      const count = Math.floor(Math.random() * 3) + 2; // 2–4
      for (let i = 0; i < count; i++) {
        const img = document.createElement("img");
        img.src = "jibbit.png";
        img.className = "jibbit";

        const size = Math.floor(Math.random() * 100) + 70; // 70–170px
        img.style.width = `${size}px`;
        img.style.height = "auto";

        img.style.left = `${Math.random() * 100}vw`;

        const drift = (Math.random() * 120 - 60).toFixed(0);
        const spin = (Math.random() * 360 - 180).toFixed(0);
        img.style.setProperty("--drift", `${drift}px`);
        img.style.setProperty("--spin", `${spin}deg`);

        const fallDuration = (Math.random() * 1.2 + 1.6).toFixed(2);
        img.style.animationDuration = `${fallDuration}s`;

        img.addEventListener("animationend", () => img.remove());
        rain.appendChild(img);
      }
    }, 180);
  }

  function stopJibbitRain() {
    if (jibbitInterval) {
      clearInterval(jibbitInterval);
      jibbitInterval = null;
    }
    const rain = document.getElementById("jibbitRain");
    if (rain) rain.innerHTML = "";
  }

  // ----------------------------
  // Enable/disable inputs + button
  // ----------------------------
  function setInputsEnabled(enabled) {
    viewsInput.disabled = !enabled;
    engInput.disabled = !enabled;
    erInput.disabled = !enabled;
  }

  // Start disabled
  setInputsEnabled(false);
  checkBtn.disabled = true;

  channelSelect.addEventListener("change", () => {
    const hasChannel = channelSelect.value !== "";
    setInputsEnabled(hasChannel);

    // reset fields when switching channel
    viewsInput.value = "";
    engInput.value = "";
    erInput.value = "";

    stopJibbitRain();
    result.textContent = "";
    result.classList.remove("show");

    updateGaugeButtonState();
    if (hasChannel) viewsInput.focus();
  });

  // Re-check button state whenever user types
  [viewsInput, engInput, erInput].forEach((el) => {
    el.addEventListener("input", updateGaugeButtonState);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !checkBtn.disabled) updateMeter();
    });
  });

  checkBtn.addEventListener("click", updateMeter);

  // ----------------------------
  // Main meter update
  // ----------------------------
  function updateMeter() {
    const channel = channelSelect.value;
    if (!channel) {
      alert("Please select a channel first");
      return;
    }

    const bm = BENCHMARKS[channel];
    if (!bm) {
      alert("No benchmarks found for this channel.");
      return;
    }

    const views = viewsInput.value ? Number(viewsInput.value) : null;
    const eng = engInput.value ? Number(engInput.value) : null;
    const erProvided = erInput.value ? Number(erInput.value) : null;

    const hasViews = Number.isFinite(views) && views > 0;
    const hasEng = Number.isFinite(eng) && eng > 0;

    // ER can be user-provided OR calculated from views+eng
    let er = null;
    let erSource = "none";

    if (Number.isFinite(erProvided) && erProvided > 0) {
      er = erProvided;
      erSource = "provided";
    } else if (hasViews && hasEng) {
      er = (eng / views) * 100;
      erSource = "calculated";
    }

    const hasER = Number.isFinite(er);

    // Tiering
    const viewsTier = hasViews ? tierVsAvg(views, bm.viewsAvg) : null;
    const engTier   = hasEng ? tierVsAvg(eng, bm.engAvg) : null;

    // ER goal check
    const erVsGoal = hasER ? (er >= bm.erGoal ? "above" : "below") : null;

    // Reset effects
    stopJibbitRain();
    result.classList.remove("show");

    // Needle logic:
// 1) If ER exists → use ER thresholds (current behavior)
// 2) If ER does NOT exist → use tiers from views/eng to still move the needle
let angle = -90;

if (hasER) {
  const [badMax, goodMax, betterMax] = thresholds[channel];

  if (er < badMax) angle = -90;
  else if (er < goodMax) angle = -30;
  else if (er < betterMax) angle = 30;
  else angle = 90;

} else if (hasViews && viewsTier) {
  // Views-only needle mapping
  if (viewsTier === "below") angle = -60;
  else if (viewsTier === "onpar") angle = 0;
  else angle = 60;

} else if (hasEng && engTier) {
  // Engagements-only needle mapping
  if (engTier === "below") angle = -60;
  else if (engTier === "onpar") angle = 0;
  else angle = 60;

} else {
  angle = -90; // default parked
}

needle.classList.remove("hovering");
needle.style.setProperty("--needle-angle", `${angle}deg`);
needle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

// resume hover after motion finishes
setTimeout(() => {
  needle.classList.add("hovering");
}, 850);




    // Build insight text
    let label = "";
    let microCopy = "";
    let detailLine = "";

    // Case 1: Views + Engagements present (most powerful)
    if (hasViews && hasEng) {
      if (viewsTier === "above" && engTier === "below") {
        label = "Hook landed. Bite didn’t.";
        microCopy = "Views popped but engagement lagged. What got the click — and what didn’t earn the action?";
      } else if (viewsTier === "below" && engTier === "above") {
        label = "Small crowd, big feelings.";
        microCopy = "Engagement is strong for the reach you got. Worth testing new distribution or a stronger opening frame.";
      } else if (viewsTier === "above" && engTier === "above") {
        label = "Certified snapper.";
        microCopy = "Above-average views *and* engagement. Bottle the strategy and run it back.";
      } else if (viewsTier === "below" && engTier === "below") {
        label = "Quiet waters.";
        microCopy = "Below average on both. Worth revisiting hook, format, or who this is really for.";
      } else {
        label = "In the pocket.";
        microCopy = "Near benchmark levels. Small tweaks could push this into ‘above’ territory.";
      }

      if (hasER) {
        detailLine =
          erSource === "calculated"
            ? `Calculated ER: ${er.toFixed(2)}% (Goal: ${bm.erGoal}%)`
            : `ER: ${er.toFixed(2)}% (Goal: ${bm.erGoal}%)`;
      }
    }

    // Case 2: Engagements only
    else if (hasEng && !hasViews && !hasER) {
      label = (engTier === "above") ? "People showed up." : "A lil under.";
      microCopy =
        (engTier === "above")
          ? "Engagement is above benchmark — something’s resonating. What’s the repeatable ingredient?"
          : "Under benchmark — what might be missing: clarity, payoff, or reason to comment/save?";
      detailLine = `Engagement avg: ${bm.engAvg}`;
    }

    // Case 3: Views only
    else if (hasViews && !hasEng && !hasER) {
      label = (viewsTier === "above") ? "Hook did its job." : "Not grabbing yet.";
      microCopy =
        (viewsTier === "above")
          ? "Views are above benchmark — your packaging is working. Next: add a stronger ‘why engage’ beat."
          : "Views are under benchmark — hook, first 1–2 seconds, or targeting might need a tweak.";
      detailLine = `Views avg: ${bm.viewsAvg}`;
    }

    // Case 4: ER only (provided)
    else if (hasER) {
      label = (erVsGoal === "above") ? "Above goal 🐊" : "Under goal 🥴";
      microCopy =
        (erVsGoal === "above")
          ? "ER is above goal — this is performing with intent. What about it feels *save/share worthy*?"
          : "ER is under goal — attention didn’t convert to action. Where’s the drop-off happening?";
      detailLine = `Goal ER: ${bm.erGoal}%`;
    }

    // Nothing entered
    else {
      alert("Enter at least one metric (Views, Engagements, or ER%).");
      return;
    }

    

    // ER above goal = jibbit rain
    if (hasER && erVsGoal === "above") startJibbitRain(2600);

    // Render
    const channelLabel = channelSelect.options[channelSelect.selectedIndex].text;

    setTimeout(() => {
      result.innerHTML = `
        <div>${channelLabel} — ${label}</div>
        <div class="microcopy">${microCopy}</div>
        ${detailLine ? `<div class="microcopy" style="opacity:0.55">${detailLine}</div>` : ""}
      `;
      result.classList.add("show");
    }, 500);
  }

const aboutBtn = document.getElementById("aboutBtn");
const aboutOverlay = document.getElementById("aboutOverlay");
const modalClose = aboutOverlay.querySelector(".modal-close");
const modalCTA = aboutOverlay.querySelector(".modal-cta");

function openModal() {
  aboutOverlay.hidden = false;
}

function closeModal() {
  aboutOverlay.hidden = true;
}

aboutBtn.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
modalCTA.addEventListener("click", closeModal);

// click outside modal closes it
aboutOverlay.addEventListener("click", (e) => {
  if (e.target === aboutOverlay) closeModal();
});

// ESC key closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !aboutOverlay.hidden) {
    closeModal();
  }
});
 });