
```javascript
// --- Elements ---
const el = (id) => document.getElementById(id);
const imgEl = el('consensusFrame');
const prevBtn = el('prevConsensus');
const nextBtn = el('nextConsensus');
const dayDisplayEl = el('day-display');
const promptInput = el('animPrompt');
const genNextBtn = el('genNext');
const statusEl = el('status');

// --- State ---
const room = new WebsimSocket();
let currentUserId = null;
let unsubscribeDay = null;
let currentEntry = null; // selected day's winning json {url, comment, ts, user_id}
const DAYS_IN_YEAR = 366;
const YEAR_KEY = new Date().getUTCFullYear();
let dayIndex = dayOfYear();

// --- Utilities ---
function dayOfYear(d = new Date()) {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diff = d - start;
  return Math.floor(diff / 86400000) + 1; // 1-based day index
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- Main Logic ---
function updateDayDisplay() {
    dayDisplayEl.textContent = `Day ${dayIndex} of ${DAYS_IN_YEAR}`;
}

function renderDbHead() {
  if (!currentEntry) {
    imgEl.removeAttribute('src');
    imgEl.alt = `No frame submitted for Day ${dayIndex}`;
    statusEl.textContent = 'No frame yet. Propose one!';
    return;
  }
  imgEl.src = currentEntry.url;
  imgEl.alt = `Consensus frame for Day ${dayIndex}`;
  statusEl.textContent = `Latest submission for Day ${dayIndex}.`;
}

async function subscribeToDay(di) {
  if (unsubscribeDay) {
    unsubscribeDay();
    unsubscribeDay = null;
  }
  
  updateDayDisplay();
  currentEntry = null; // Clear previous state
  renderDbHead(); // Show loading/empty state
  statusEl.textContent = `Loading Day ${di}...`;
  
  const q = room.query(`select r.id as user_id, r.days, r.updated_at from public.nf_row r`);
  
  unsubscribeDay = q.subscribe((rows) => {
    const candidates = [];
    for (const r of (rows || [])) {
      // Handle both numeric and string keys from the DB
      const dayData = r.days && (r.days[di] ?? r.days[String(di)]);
      if (dayData && dayData.url) {
        candidates.push({ ...dayData, user_id: r.user_id || r.id });
      }
    }
    // The consensus is simply the most recent submission
    candidates.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    currentEntry = candidates[0] || null;
    renderDbHead();
  });
}

async function appendEntry(url, comment) {
  const now = Date.now();
  // Fetch the current user's row
  let me = (await room.collection('nf_row').filter({ id: currentUserId }).getList())?.[0];
  const days = Object.assign({}, me?.days || {});
  
  days[dayIndex] = { url, comment: comment || '', ts: now };

  await room.collection('nf_row').upsert({
    id: currentUserId,
    days,
    updated_at: new Date().toISOString(),
  });
}

// --- Event Listeners ---
prevBtn.addEventListener('click', () => {
  dayIndex = (dayIndex - 2 + DAYS_IN_YEAR) % DAYS_IN_YEAR + 1; // 1-based index wrap
  subscribeToDay(dayIndex);
});

nextBtn.addEventListener('click', () => {
  dayIndex = (dayIndex % DAYS_IN_YEAR) + 1; // 1-based index wrap
  subscribeToDay(dayIndex);
});

genNextBtn.addEventListener('click', async () => {
  genNextBtn.disabled = true;
  statusEl.textContent = 'Generating next frame…';
  try {
    const prevUrl = currentEntry?.url || null;
    const prompt = promptInput.value.trim();
    const url = await generateNextFrame(prevUrl, prompt);
    await appendEntry(url, prompt);
    statusEl.textContent = 'Proposed next frame!';
  } catch (e) {
    statusEl.textContent = `Failed: ${e.message || e}`;
    console.error(e);
  } finally {
    genNextBtn.disabled = false;
  }
});

window.addEventListener('load', async () => {
  try {
    currentUserId = (await window.websim.getCurrentUser()).id;
    // Ensure user's row exists, creating it if necessary.
    await room.collection('nf_row').upsert({ id: currentUserId, days: {} });
  } catch (e) {
    statusEl.textContent = "Could not get user. Please log in.";
    console.error("Websim user error:", e);
    genNextBtn.disabled = true;
    return;
  }
  subscribeToDay(dayIndex);
});

// --- AI Generation Helpers ---
let lastAIRequestTime = 0;
async function rateLimitedCall(fn) {
  const minGap = 1200; // ms between AI calls
  const now = Date.now();
  const wait = Math.max(0, lastAIRequestTime + minGap - now);
  if (wait > 0) await sleep(wait);
  lastAIRequestTime = Date.now();
  return fn();
}

async function withRetry(doCall, label) {
  let delay = 1500;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      return await doCall();
    } catch (e) {
      const msg = (e && e.message) || '';
      if (!(e?.status === 429 || /rate|limit|too many|429/i.test(msg))) throw e;
      const jitter = Math.random() * 300;
      statusEl.textContent = `${label} — rate limited. Retrying in ${((delay + jitter) / 1000).toFixed(1)}s (attempt ${attempt}/5)`;
      await sleep(delay + jitter);
      delay = Math.min(delay * 1.8, 10000);
    }
  }
  throw new Error('Exceeded retry attempts for AI generation.');
}

async function generateImageSafe(prompt, opts, label) {
  return withRetry(() => rateLimitedCall(() => websim.imageGen({ prompt, ...opts })), label);
}

async function generateNextFrame(prevDataUrl, prompt) {
  const fullPrompt = `Create the next animation frame with a subtle incremental change. ${prompt || 'Continue the motion, preserving subject and composition.'}`.trim();
  const options = {
    width: 512,
    height: 512,
    image_inputs: prevDataUrl ? [{ url: prevDataUrl }] : undefined,
  };
  return (await generateImageSafe(fullPrompt, options, 'Generating frame')).url;
}