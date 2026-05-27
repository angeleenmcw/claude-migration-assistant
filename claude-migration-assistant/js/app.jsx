const { useState } = React;

const STEPS = [
  { id: "a1", track: "A", n: 1, label: "Choose export type", ai: false },
  { id: "a2", track: "A", n: 2, label: "Upload & process export", ai: false },
  { id: "a3", track: "A", n: 3, label: "Generate context doc", ai: true },
  { id: "a4", track: "A", n: 4, label: "Review artifacts", ai: true },
  { id: "b1", track: "B", n: 1, label: "Capture memory", ai: true },
  { id: "b2", track: "B", n: 2, label: "Capture project blueprints", ai: true },
  { id: "b3", track: "B", n: 3, label: "Restore memory", ai: true },
  { id: "b4", track: "B", n: 4, label: "Recreate projects", ai: true },
  { id: "b5", track: "B", n: 5, label: "Upload artifacts", ai: false },
  { id: "b6", track: "B", n: 6, label: "Validate migration", ai: true },
];

function App()  {
  const [activeStep, setActiveStep] = useState("a1");
  const [done, setDone] = useState(new Set());
  const [exportType, setExportType] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const markDone = (id) => setDone((prev) => new Set([...prev, id]));

  const goNext = () => {
    const idx = STEPS.findIndex((s) => s.id === activeStep);
    if (idx < STEPS.length - 1) setActiveStep(STEPS[idx + 1].id);
  };

  const callAI = async (prompt, key) => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "No response generated.";
      setResults((prev) => ({ ...prev, [key]: text }));
    } catch (e) {
      setResults((prev) => ({ ...prev, [key]: `Error: ${e.message}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setUploadedData(JSON.parse(ev.target.result));
      } catch {
        setUploadedData({ raw: ev.target.result?.slice(0, 5000) });
      }
    };
    reader.readAsText(file);
  };

  const dataSnippet = uploadedData ? JSON.stringify(uploadedData).slice(0, 3000) : null;
  const currentMeta = STEPS.find((s) => s.id === activeStep);

  const C = {
    sidebar: { width: 232, background: "var(--color-background-secondary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", flexShrink: 0 },
    logoWrap: { padding: "20px 16px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" },
    logoName: { fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "-0.01em" },
    logoSub: { fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 },
    badge: { display: "inline-block", fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-warning)", color: "var(--color-text-warning)", marginTop: 8 },
    navSection: { padding: "12px 10px 4px" },
    navLabel: { fontSize: 10, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 6px", marginBottom: 4, display: "block" },
    navItem: (active, finished) => ({ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 12, fontWeight: active ? 500 : 400, color: active ? "var(--color-text-primary)" : finished ? "var(--color-text-secondary)" : "var(--color-text-tertiary)", background: active ? "var(--color-background-primary)" : "transparent", border: active ? "0.5px solid var(--color-border-secondary)" : "0.5px solid transparent", marginBottom: 1 }),
    navDot: (active, finished) => ({ width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 500, flexShrink: 0, background: finished ? "var(--color-background-success)" : active ? "var(--color-background-info)" : "var(--color-background-primary)", border: finished || active ? "none" : "0.5px solid var(--color-border-secondary)", color: finished ? "var(--color-text-success)" : active ? "var(--color-text-info)" : "var(--color-text-tertiary)" }),
    main: { flex: 1, padding: "32px 40px", overflowY: "auto" },
    trackBadge: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: "var(--border-radius-md)", marginBottom: 16, background: currentMeta?.ai ? "var(--color-background-warning)" : "var(--color-background-secondary)", color: currentMeta?.ai ? "var(--color-text-warning)" : "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" },
    h1: { fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "-0.02em" },
    desc: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 20 },
    card: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "16px 20px", marginBottom: 12 },
    aiBanner: { background: "var(--color-background-warning)", border: "0.5px solid var(--color-border-warning)", borderRadius: "var(--border-radius-lg)", padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10 },
    resultBox: { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", padding: 16, marginTop: 16 },
    resultLabel: { fontSize: 10, fontWeight: 500, color: "var(--color-text-warning)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 },
    resultText: { fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)" },
    btnPrimary: { padding: "9px 20px", background: "var(--color-background-warning)", color: "var(--color-text-warning)", border: "0.5px solid var(--color-border-warning)", borderRadius: "var(--border-radius-md)", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 },
    btnSecondary: { padding: "9px 20px", background: "transparent", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 },
    btnSm: { padding: "5px 12px", background: "transparent", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 11, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 },
  };

  const AIBanner = () => (
    <div style={C.aiBanner}>
      <i className="ti ti-sparkles" style={{ fontSize: 16, color: "var(--color-text-warning)", flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-warning)", marginBottom: 2 }}>AI-powered step</div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>Automated via the Anthropic API — no manual copy-pasting into Claude required.</div>
      </div>
    </div>
  );

  const AIBtn = ({ label, onClick }) => (
    <button style={C.btnPrimary} onClick={onClick} disabled={loading}>
      <i className="ti ti-sparkles" aria-hidden="true" />
      {loading ? "Generating..." : label}
    </button>
  );

  const ResultBox = ({ k }) =>
    results[k] ? (
      <div style={C.resultBox}>
        <div style={C.resultLabel}>AI-generated output</div>
        <div style={C.resultText}>{results[k]}</div>
        <div style={{ marginTop: 12 }}>
          <button style={C.btnSm} onClick={() => navigator.clipboard?.writeText(results[k])}>
            <i className="ti ti-copy" style={{ fontSize: 12 }} aria-hidden="true" /> Copy to clipboard
          </button>
        </div>
      </div>
    ) : null;

  const NextBtn = ({ label = "Continue", stepId }) => (
    <button style={{ ...C.btnSecondary, marginTop: 16 }} onClick={() => { if (stepId) markDone(stepId); goNext(); }}>
      {label} <i className="ti ti-arrow-right" aria-hidden="true" />
    </button>
  );

  function StepContent() {
    if (activeStep === "a1") return (
      <div>
        <h2 style={C.h1}>Choose your export type</h2>
        <p style={C.desc}>Select how you exported your Claude data — this determines how the tool processes your files.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { id: "personal", icon: "ti-user", title: "Personal export", desc: "Claude Settings → Privacy → Export Data. Downloads as a ZIP file." },
            { id: "admin", icon: "ti-users", title: "Admin team export", desc: "Multiple JSON files: conversations, users, memories, and projects." },
          ].map((opt) => (
            <div key={opt.id} onClick={() => setExportType(opt.id)} style={{ ...C.card, cursor: "pointer", border: exportType === opt.id ? "2px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)" }}>
              <i className={`ti ${opt.icon}`} style={{ fontSize: 20, color: exportType === opt.id ? "var(--color-text-info)" : "var(--color-text-secondary)", marginBottom: 10, display: "block" }} aria-hidden="true" />
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{opt.desc}</div>
              {exportType === opt.id && <div style={{ marginTop: 10, fontSize: 11, color: "var(--color-text-info)", fontWeight: 500 }}><i className="ti ti-check" aria-hidden="true" /> Selected</div>}
            </div>
          ))}
        </div>
        {exportType && (
          <button style={C.btnSecondary} onClick={() => { markDone("a1"); goNext(); }}>
            Continue with {exportType === "personal" ? "personal" : "admin"} export <i className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>
    );

    if (activeStep === "a2") return (
      <div>
        <h2 style={C.h1}>Upload & process export</h2>
        <p style={C.desc}>{exportType === "admin" ? "Upload the admin export JSON files (conversations.json, users.json, memories.json, projects.json)." : "Upload your Claude export ZIP or drop in conversations.json directly."}</p>
        <label htmlFor="fileInput" style={{ ...C.card, display: "flex", flexDirection: "column", alignItems: "center", padding: 32, cursor: "pointer", border: "0.5px dashed var(--color-border-secondary)", textAlign: "center", gap: 10 }}>
          <i className="ti ti-cloud-upload" style={{ fontSize: 28, color: "var(--color-text-tertiary)" }} aria-hidden="true" />
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Drop file here or click to browse</div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>.json or .zip accepted</div>
        </label>
        <input type="file" id="fileInput" accept=".json,.zip" onChange={handleFile} style={{ display: "none" }} />
        {uploadedData && (
          <div style={{ ...C.card, border: "0.5px solid var(--color-border-success)", marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="ti ti-circle-check" style={{ color: "var(--color-text-success)", fontSize: 16 }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-success)" }}>File loaded successfully</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{uploadedData.raw ? `Text file: ${uploadedData.raw.length.toLocaleString()} characters` : `JSON with ${Object.keys(uploadedData).length} top-level keys`}</div>
            <button style={{ ...C.btnSecondary, marginTop: 12 }} onClick={() => { markDone("a2"); goNext(); }}>
              Process & continue <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    );

    if (activeStep === "a3") return (
      <div>
        <h2 style={C.h1}>Generate context document</h2>
        <p style={C.desc}>Claude analyzes your exported data and produces a structured summary of conversation history, topics, and usage patterns.</p>
        <AIBanner />
        <div style={C.card}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 10 }}>What gets analyzed</div>
          {["Conversation themes and recurring topics", "Project usage and key contexts", "Writing style and tone preferences", "Important outputs and decisions"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
              <i className="ti ti-minus" style={{ fontSize: 10, color: "var(--color-text-tertiary)" }} aria-hidden="true" />{item}
            </div>
          ))}
        </div>
        <AIBtn label="Generate context document" onClick={() => callAI(`Analyze this Claude account export and generate a structured context document.${dataSnippet ? ` Export data: ${dataSnippet}` : " No data uploaded — generate a template."}

Produce a context document with these sections:
1. ACCOUNT OVERVIEW — usage patterns and key themes
2. KEY TOPICS & PROJECTS — main areas of work  
3. COMMUNICATION STYLE — tone and preferences
4. IMPORTANT CONTEXTS — critical background to preserve
5. MIGRATION NOTES — what to prioritize in the new account

Use clear headers and bullets. Be specific and actionable.`, "context")} />
        <ResultBox k="context" />
        {results.context && <NextBtn label="Looks good, continue" stepId="a3" />}
      </div>
    );

    if (activeStep === "a4") return (
      <div>
        <h2 style={C.h1}>Review artifacts</h2>
        <p style={C.desc}>Claude identifies and categorizes artifacts — code, documents, prompts, and outputs — from your export that are worth preserving.</p>
        <AIBanner />
        <AIBtn label="Identify critical artifacts" onClick={() => callAI(`Review this Claude account export and identify artifacts worth preserving.${dataSnippet ? ` Data: ${dataSnippet}` : " No data — generate examples for a digital agency account."}

List artifacts in these categories:
1. CODE & SCRIPTS — reusable code snippets and programs
2. DOCUMENTS & TEMPLATES — written docs, reports, frameworks
3. PROMPTS & INSTRUCTIONS — useful prompts to recreate
4. DATA & ANALYSIS — datasets, analyses, key insights

For each: name, description, priority (high/medium/low), and migration action.`, "artifacts")} />
        <ResultBox k="artifacts" />
        {results.artifacts && <NextBtn label="Continue to Track B" stepId="a4" />}
      </div>
    );

    if (activeStep === "b1") return (
      <div>
        <h2 style={C.h1}>Capture memory</h2>
        <p style={C.desc}>Generates a complete memory profile — all the key facts, preferences, and context Claude has learned about you — ready to restore in the new account.</p>
        <AIBanner />
        <AIBtn label="Generate memory profile" onClick={() => callAI(`Generate a MEMORY PROFILE for Claude account migration.${dataSnippet ? ` Conversation data: ${dataSnippet}` : " No data — generate a template for a digital marketing professional."}

Include:
**PERSONAL & PROFESSIONAL CONTEXT** — name, role, organization, responsibilities
**WORK PREFERENCES** — communication style, response format, technical level  
**ONGOING PROJECTS & CONTEXTS** — active projects, stakeholders, status
**KEY FACTS TO REMEMBER** — critical recurring details, constraints
**GOALS & PRIORITIES** — current priorities and what they're working toward

Format as a clean document ready to paste into a new Claude account's memory settings.`, "memory")} />
        <ResultBox k="memory" />
        {results.memory && <NextBtn label="Memory captured, continue" stepId="b1" />}
      </div>
    );

    if (activeStep === "b2") return (
      <div>
        <h2 style={C.h1}>Capture project blueprints</h2>
        <p style={C.desc}>Generates structured blueprints for each project so they can be recreated identically in the new account.</p>
        <AIBanner />
        <AIBtn label="Generate project blueprints" onClick={() => callAI(`Generate PROJECT BLUEPRINTS for Claude account migration.${dataSnippet ? ` Data: ${dataSnippet}` : " No data — create templates for a digital agency (client work, content, internal ops)."}

For each project:
**PROJECT NAME**
**PURPOSE** — what this project is for
**CUSTOM INSTRUCTIONS** — the system prompt to use
**KNOWLEDGE BASE** — documents/context to upload
**TONE & STYLE** — how Claude should respond here
**KEY WORKFLOWS** — common tasks performed
**RECREATION STEPS** — step-by-step setup guide`, "projects")} />
        <ResultBox k="projects" />
        {results.projects && <NextBtn label="Blueprints captured, continue" stepId="b2" />}
      </div>
    );

    if (activeStep === "b3") return (
      <div>
        <h2 style={C.h1}>Restore memory</h2>
        <p style={C.desc}>Generates the exact prompt to paste into your new Claude account to restore your full memory context.</p>
        <AIBanner />
        {!results.memory && (
          <div style={{ ...C.card, borderLeft: "3px solid var(--color-border-warning)", marginBottom: 16, borderRadius: 0 }}>
            <div style={{ fontSize: 12, color: "var(--color-text-warning)", display: "flex", gap: 8, alignItems: "center" }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 14 }} aria-hidden="true" />
              No memory profile yet — go back to B1 first for best results.
            </div>
          </div>
        )}
        <AIBtn label="Generate memory restore prompt" onClick={() => callAI(`Create a MEMORY RESTORE PROMPT for a new Claude account.

${results.memory ? `Memory profile:\n${results.memory}` : "No profile captured — generate a template for a digital marketing professional."}

Write a single message to paste into a new Claude account that:
1. Starts with "Please remember the following about me:"
2. Presents all information naturally and conversationally  
3. Ends asking Claude to confirm its memory is updated
4. Is complete yet concise`, "restore")} />
        <ResultBox k="restore" />
        {results.restore && <NextBtn label="Memory restored, continue" stepId="b3" />}
      </div>
    );

    if (activeStep === "b4") return (
      <div>
        <h2 style={C.h1}>Recreate projects</h2>
        <p style={C.desc}>Generates step-by-step setup guides for recreating each project in the new account.</p>
        <AIBanner />
        <AIBtn label="Generate project setup guides" onClick={() => callAI(`Create STEP-BY-STEP PROJECT SETUP GUIDES for a new Claude account.

${results.projects ? `Project blueprints:\n${results.projects}` : "No blueprints — generate guides for a typical digital agency account."}

For each project:
**SETUP CHECKLIST**
□ Project name to use
□ Custom instructions to paste
□ Files to upload
□ Test conversation to verify setup

**CUSTOM INSTRUCTIONS** — exact text to paste as the system prompt

**VERIFICATION TEST** — a quick prompt to confirm correct setup

Format as a practical checklist a team member could follow with no prior knowledge.`, "recreation")} />
        <ResultBox k="recreation" />
        {results.recreation && <NextBtn label="Projects ready, continue" stepId="b4" />}
      </div>
    );

    if (activeStep === "b5") return (
      <div>
        <h2 style={C.h1}>Upload artifacts</h2>
        <p style={C.desc}>Manually re-upload critical files to your new Claude projects. Check each off as you go.</p>
        <div style={C.card}>
          {["Code snippets and scripts", "Document templates and frameworks", "Brand guidelines or style references", "Reference materials and research", "Custom prompts and instructions"].map((item, i, arr) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < arr.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
              <input type="checkbox" style={{ accentColor: "orange", width: 14, height: 14, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{item}</span>
            </div>
          ))}
        </div>
        <NextBtn label="Artifacts uploaded, continue" stepId="b5" />
      </div>
    );

    if (activeStep === "b6") return (
      <div>
        <h2 style={C.h1}>Validate migration</h2>
        <p style={C.desc}>AI generates a final validation report checking completeness and providing a handoff summary.</p>
        <AIBanner />
        <div style={{ ...C.card, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 10 }}>Migration checklist</div>
          {[
            ["Context document", !!results.context],
            ["Memory profile", !!results.memory],
            ["Project blueprints", !!results.projects],
            ["Memory restore prompt", !!results.restore],
            ["Project setup guides", !!results.recreation],
          ].map(([label, complete]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12 }}>
              <i className={`ti ${complete ? "ti-circle-check" : "ti-circle-x"}`} style={{ fontSize: 14, color: complete ? "var(--color-text-success)" : "var(--color-text-tertiary)" }} aria-hidden="true" />
              <span style={{ color: complete ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{label}</span>
            </div>
          ))}
        </div>
        <AIBtn label="Generate validation report" onClick={() => {
          const status = [
            results.context ? "✓ Context document generated" : "✗ Context document missing",
            results.memory ? "✓ Memory profile captured" : "✗ Memory profile missing",
            results.projects ? "✓ Project blueprints created" : "✗ Project blueprints missing",
            results.restore ? "✓ Memory restore prompt ready" : "✗ Memory restore missing",
            results.recreation ? "✓ Project setup guides created" : "✗ Setup guides missing",
          ].join("\n");
          callAI(`Generate a MIGRATION VALIDATION REPORT for a Mindgruve/Moontide team member migrating their Claude account.

Status:\n${status}

Include:
**MIGRATION SUMMARY** — what transferred, what's missing, completeness score (X/10)
**VERIFICATION CHECKLIST** — 5 quick tests to run in the new account
**FOLLOW-UP ACTIONS** — any remaining tasks  
**QUICK WINS** — 3 tips to get productive in the new account immediately

End with a brief congratulatory note if the migration looks complete.`, "validation");
        }} />
        <ResultBox k="validation" />
        {results.validation && (
          <div style={{ ...C.card, border: "0.5px solid var(--color-border-success)", marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="ti ti-confetti" style={{ fontSize: 18, color: "var(--color-text-success)" }} aria-hidden="true" />
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-success)" }}>Migration complete</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12 }}>All AI-generated documents are above — paste them into your new Claude account to complete the migration.</div>
            <button style={C.btnSecondary} onClick={() => markDone("b6")}>
              <i className="ti ti-check" aria-hidden="true" /> Mark as complete
            </button>
          </div>
        )}
      </div>
    );

    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      <h2 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", margin: -1 }}>
        Account migration assistant — step {activeStep}
      </h2>
      {/* Sidebar */}
      <div style={C.sidebar}>
        <div style={C.logoWrap}>
          <div style={C.logoName}>Mindgruve × Moontide</div>
          <div style={C.logoSub}>Account migration assistant</div>
          <span style={C.badge}>Claude-powered</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={C.navSection}>
            <span style={C.navLabel}>Track A — Export processing</span>
            {STEPS.filter((st) => st.track === "A").map((st) => {
              const active = activeStep === st.id;
              const finished = done.has(st.id);
              return (
                <div key={st.id} onClick={() => setActiveStep(st.id)} style={C.navItem(active, finished)}>
                  <div style={C.navDot(active, finished)}>
                    {finished ? <i className="ti ti-check" style={{ fontSize: 9 }} aria-hidden="true" /> : st.n}
                  </div>
                  <span style={{ flex: 1 }}>{st.label}</span>
                  {st.ai && !active && <i className="ti ti-sparkles" style={{ fontSize: 11, color: "var(--color-text-warning)" }} aria-hidden="true" />}
                </div>
              );
            })}
          </div>
          <div style={{ ...C.navSection, paddingTop: 8, borderTop: "0.5px solid var(--color-border-tertiary)", marginTop: 4 }}>
            <span style={C.navLabel}>Track B — AI-powered migration</span>
            {STEPS.filter((st) => st.track === "B").map((st) => {
              const active = activeStep === st.id;
              const finished = done.has(st.id);
              return (
                <div key={st.id} onClick={() => setActiveStep(st.id)} style={C.navItem(active, finished)}>
                  <div style={C.navDot(active, finished)}>
                    {finished ? <i className="ti ti-check" style={{ fontSize: 9 }} aria-hidden="true" /> : st.n}
                  </div>
                  <span style={{ flex: 1 }}>{st.label}</span>
                  {st.ai && !active && <i className="ti ti-sparkles" style={{ fontSize: 11, color: "var(--color-text-warning)" }} aria-hidden="true" />}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "12px 10px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
          <button style={{ ...C.btnSecondary, width: "100%", fontSize: 11, padding: 7, justifyContent: "center" }}
            onClick={() => { setDone(new Set()); setResults({}); setUploadedData(null); setExportType(null); setActiveStep("a1"); }}>
            <i className="ti ti-refresh" aria-hidden="true" /> Reset session
          </button>
        </div>
      </div>
      {/* Main */}
      <div style={C.main}>
        <div style={C.trackBadge}>
          <i className={`ti ${currentMeta?.ai ? "ti-sparkles" : "ti-settings"}`} style={{ fontSize: 12 }} aria-hidden="true" />
          Track {currentMeta?.track} — {currentMeta?.ai ? "AI-powered" : "manual"} step
        </div>
        <StepContent />
      </div>
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);