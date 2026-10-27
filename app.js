const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

let current = PROBLEMS[0];
let solved = store.get("dsa_solved", {});
let hintLevel = {}; // per problem, how many built-in hints revealed

function renderList() {
  const ul = $("problemList");
  ul.innerHTML = "";
  PROBLEMS.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p.title;
    if (p.id === current.id) li.classList.add("active");
    if (solved[p.id]) li.classList.add("done");
    li.onclick = () => selectProblem(p);
    ul.appendChild(li);
  });
  const n = Object.keys(solved).length;
  $("progress").textContent = `Solved ${n}/${PROBLEMS.length}`;
}

function selectProblem(p) {
  current = p;
  $("pTitle").textContent = p.title;
  $("pDiff").textContent = p.difficulty;
  $("pDiff").className = "badge " + p.difficulty;
  $("pDesc").textContent = p.desc;
  $("pExample").textContent = p.example;
  $("code").value = store.get("dsa_code_" + p.id, p.starter);
  $("results").innerHTML = "";
  $("buddy").classList.add("hidden");
  renderList();
}

$("code").addEventListener("input", () => store.set("dsa_code_" + current.id, $("code").value));
$("code").addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const t = e.target, s = t.selectionStart;
    t.value = t.value.slice(0, s) + "  " + t.value.slice(t.selectionEnd);
    t.selectionStart = t.selectionEnd = s + 2;
  }
});
$("resetBtn").onclick = () => {
  $("code").value = current.starter;
  store.set("dsa_code_" + current.id, current.starter);
};

// ---- Test runner (Web Worker so infinite loops can be killed) ----
function runTests(problem, code) {
  return new Promise((resolve) => {
    const workerSrc = `
      onmessage = (e) => {
        const { code, fn, tests } = e.data;
        const out = [];
        try {
          const f = new Function(code + "\\n; return typeof " + fn + " === 'function' ? " + fn + " : null;")();
          if (!f) { postMessage({ error: "Function '" + fn + "' define nahi hai." }); return; }
          for (const [args, expected] of tests) {
            let got, err = null;
            try { got = f(...JSON.parse(JSON.stringify(args))); } catch (x) { err = String(x); }
            out.push({ args, expected, got, err });
          }
          postMessage({ out });
        } catch (x) { postMessage({ error: String(x) }); }
      };`;
    const url = URL.createObjectURL(new Blob([workerSrc], { type: "text/javascript" }));
    const w = new Worker(url);
    const timer = setTimeout(() => { w.terminate(); resolve({ error: "Timeout (3s): infinite loop ya bahut slow solution." }); }, 3000);
    w.onmessage = (e) => { clearTimeout(timer); w.terminate(); resolve(e.data); };
    w.onerror = (e) => { clearTimeout(timer); w.terminate(); resolve({ error: e.message }); };
    w.postMessage({ code, fn: problem.fn, tests: problem.tests });
  });
}

function same(a, b, p) {
  if (p.normalize === "sortResult" && Array.isArray(a)) a = [...a].sort((x, y) => x - y);
  return JSON.stringify(a) === JSON.stringify(b);
}

let lastReport = "";
async function onRun() {
  $("runBtn").disabled = true;
  const res = await runTests(current, $("code").value);
  $("runBtn").disabled = false;
  const box = $("results");
  box.innerHTML = "";
  if (res.error) {
    box.innerHTML = `<div class="test fail">${escapeHtml(res.error)}</div>`;
    lastReport = "Error: " + res.error;
    return;
  }
  let pass = 0;
  const lines = [];
  res.out.forEach((t, i) => {
    const ok = !t.err && same(t.got, t.expected, current);
    if (ok) pass++;
    const div = document.createElement("div");
    div.className = "test " + (ok ? "pass" : "fail");
    const line = `Test ${i + 1}: ${JSON.stringify(t.args)} -> ` + (ok ? "OK" : (t.err ? "Error " + t.err : `got ${JSON.stringify(t.got)}, expected ${JSON.stringify(t.expected)}`));
    div.textContent = (ok ? "✓ " : "✗ ") + line;
    box.appendChild(div);
    lines.push((ok ? "PASS " : "FAIL ") + line);
  });
  const sum = document.createElement("div");
  sum.className = "summary";
  sum.textContent = `${pass}/${res.out.length} tests passed` + (pass === res.out.length ? " 🎉" : "");
  box.prepend(sum);
  lastReport = lines.join("\n");
  if (pass === res.out.length) { solved[current.id] = true; store.set("dsa_solved", solved); renderList(); }
}
$("runBtn").onclick = onRun;

// ---- Buddy: hints and review ----
function showBuddy(text) {
  $("buddy").classList.remove("hidden");
  $("buddyText").textContent = text;
}

const SYSTEM = `You are a DSA practice buddy for an Indian B.Tech student. Reply in Hinglish (Hindi in Roman script + English terms), short and friendly.
STRICT RULE: never write the complete solution or full working code. Give nudges, concepts, complexity analysis, and point out bugs by describing them (line or idea), not by pasting the fixed code. At most a 1-2 line snippet if essential.`;

async function askAI(userMsg) {
  const key = store.get("dsa_key", "");
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 600, system: SYSTEM, messages: [{ role: "user", content: userMsg }] })
  });
  if (!resp.ok) throw new Error("API error " + resp.status);
  const data = await resp.json();
  return data.content.map((c) => c.text || "").join("");
}

function context() {
  return `Problem: ${current.title}\n${current.desc}\n\nStudent code:\n${$("code").value}\n\nLast test run:\n${lastReport || "(not run yet)"}`;
}

$("hintBtn").onclick = async () => {
  const hasKey = !!store.get("dsa_key", "");
  const lvl = hintLevel[current.id] || 0;
  if (hasKey) {
    $("hintBtn").disabled = true;
    showBuddy("Soch raha hoon...");
    try {
      showBuddy(await askAI(context() + `\n\nGive hint level ${lvl + 1} of 3 (1 = tiny nudge, 3 = approach outline). Do not give the code.`));
      hintLevel[current.id] = Math.min(lvl + 1, 3);
    } catch (e) {
      showBuddy("AI call fail hui (" + e.message + "). Built-in hint:\n" + current.hints[Math.min(lvl, 2)]);
    }
    $("hintBtn").disabled = false;
  } else {
    showBuddy(`Hint ${Math.min(lvl + 1, 3)}/3:\n${current.hints[Math.min(lvl, 2)]}`);
    hintLevel[current.id] = Math.min(lvl + 1, 3);
  }
};

$("reviewBtn").onclick = async () => {
  if (!store.get("dsa_key", "")) {
    showBuddy("Code review ke liye ⚙ AI Settings me API key daalo. Bina key ke sirf hints milte hain.");
    return;
  }
  $("reviewBtn").disabled = true;
  showBuddy("Code padh raha hoon...");
  try {
    showBuddy(await askAI(context() + "\n\nReview this: correctness bugs, time/space complexity, edge cases missed, and style. Don't paste a corrected full solution."));
  } catch (e) {
    showBuddy("Review fail hua: " + e.message + ". Key check karo.");
  }
  $("reviewBtn").disabled = false;
};

// ---- Settings ----
$("settingsBtn").onclick = () => { $("apiKey").value = store.get("dsa_key", ""); $("settings").showModal(); };
$("saveKey").onclick = () => store.set("dsa_key", $("apiKey").value.trim());
$("clearKey").onclick = () => store.set("dsa_key", "");

function escapeHtml(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

selectProblem(PROBLEMS[0]);
