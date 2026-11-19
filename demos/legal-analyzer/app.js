(function () {
  "use strict";

  const sourceByTab = {};
  let currentContractHtml = "";
  let currentContractType = "";
  let activeTab = "analyse";
  let signatureMode = "draw";
  const signed = { a: false, b: false };

  const contractFields = {
    "Service Agreement": [
      ["party_a_name", "Party A — Full Legal Name", "text", "e.g. Acme Ltd", true],
      ["party_a_address", "Party A — Registered Address", "text", "e.g. 12 High Street, London, EC1A 1BB", false],
      ["party_b_name", "Party B — Full Legal Name", "text", "e.g. Smith Consulting Ltd", true],
      ["party_b_address", "Party B — Registered Address", "text", "e.g. 45 Park Lane, Manchester, M1 2AB", false],
      ["governing_law", "Governing Law & Jurisdiction", "select", ["England and Wales", "Scotland", "Northern Ireland", "Other (specify below)"], true],
      ["start_date", "Contract Start Date", "date", "", false],
      ["services_description", "Description of Services", "textarea", "Describe the services to be provided in detail...", true],
      ["deliverables", "Key Deliverables", "textarea", "List the specific deliverables and outputs expected...", false],
      ["fee_amount", "Fee Amount (£)", "text", "e.g. 5,000", false],
      ["fee_structure", "Fee Structure", "select", ["Fixed fee", "Hourly rate", "Monthly retainer", "Milestone-based", "Other"], false],
      ["payment_terms", "Payment Terms", "select", ["14 days", "30 days", "60 days", "On completion", "In advance", "Other"], false],
      ["duration", "Contract Duration", "text", "e.g. 6 months, 1 year, ongoing", false],
      ["notice_period", "Notice Period for Termination", "select", ["7 days", "14 days", "1 month", "3 months", "Other"], false],
      ["special_terms", "Any Special Terms or Notes", "textarea", "Any additional requirements, restrictions, or special conditions...", false]
    ],
    "Employment Contract": [
      ["party_a_name", "Party A — Full Legal Name", "text", "e.g. Acme Ltd", true],
      ["party_a_address", "Party A — Registered Address", "text", "e.g. 12 High Street, London, EC1A 1BB", false],
      ["party_b_name", "Party B — Full Legal Name", "text", "e.g. Smith Consulting Ltd", true],
      ["party_b_address", "Party B — Registered Address", "text", "e.g. 45 Park Lane, Manchester, M1 2AB", false],
      ["governing_law", "Governing Law & Jurisdiction", "select", ["England and Wales", "Scotland", "Northern Ireland"], true],
      ["start_date", "Contract Start Date", "date", "", false],
      ["employee_job_title", "Job Title", "text", "e.g. Senior Software Engineer", true],
      ["employee_department", "Department", "text", "e.g. Engineering", false],
      ["place_of_work", "Place of Work", "text", "e.g. London office / Remote / Hybrid", false],
      ["salary", "Annual Salary (£)", "text", "e.g. 45,000", true],
      ["pay_frequency", "Pay Frequency", "select", ["Monthly", "Bi-weekly", "Weekly"], false],
      ["hours_per_week", "Hours Per Week", "text", "e.g. 37.5", false],
      ["holiday_entitlement", "Holiday Entitlement (days)", "text", "e.g. 25 days plus bank holidays", false],
      ["probation_period", "Probationary Period", "select", ["None", "1 month", "3 months", "6 months"], false],
      ["notice_period", "Notice Period", "select", ["1 week", "1 month", "3 months", "6 months", "Statutory minimum only"], false],
      ["benefits", "Benefits", "textarea", "e.g. Pension (5% employer), private health, laptop...", false],
      ["restrictive_covenants", "Restrictive Covenants", "textarea", "e.g. 6-month non-compete within the UK...", false]
    ],
    "Non-Disclosure Agreement (NDA)": [
      ["party_a_name", "Party A — Full Legal Name", "text", "e.g. Acme Ltd", true],
      ["party_a_address", "Party A — Registered Address", "text", "", false],
      ["party_b_name", "Party B — Full Legal Name", "text", "e.g. Smith Consulting Ltd", true],
      ["party_b_address", "Party B — Registered Address", "text", "", false],
      ["governing_law", "Governing Law & Jurisdiction", "select", ["England and Wales", "Scotland", "Northern Ireland", "Other (specify below)"], true],
      ["start_date", "Contract Start Date", "date", "", false],
      ["nda_type", "NDA Type", "select", ["Mutual (both parties)", "One-way (disclosing to receiving party only)"], true],
      ["purpose", "Purpose of Disclosure", "textarea", "e.g. Evaluation of a potential business partnership...", true],
      ["confidential_info", "What Counts as Confidential", "textarea", "e.g. Financial data, trade secrets, customer lists...", false],
      ["duration", "Confidentiality Duration", "select", ["1 year", "2 years", "3 years", "5 years", "Indefinite"], false],
      ["permitted_disclosure", "Permitted Disclosures", "textarea", "e.g. May be shared with employees on a need-to-know basis...", false]
    ],
    "Independent Contractor Agreement": [
      ["party_a_name", "Party A — Full Legal Name", "text", "e.g. Acme Ltd", true],
      ["party_a_address", "Party A — Registered Address", "text", "", false],
      ["party_b_name", "Party B — Full Legal Name", "text", "e.g. Smith Consulting Ltd", true],
      ["party_b_address", "Party B — Registered Address", "text", "", false],
      ["governing_law", "Governing Law & Jurisdiction", "select", ["England and Wales", "Scotland", "Northern Ireland", "Other (specify below)"], true],
      ["start_date", "Contract Start Date", "date", "", false],
      ["services_description", "Services to be Provided", "textarea", "Describe the work and services the contractor will provide...", true],
      ["rate", "Rate of Pay", "text", "e.g. £500/day or £75/hour", true],
      ["payment_terms", "Payment Terms", "select", ["14 days", "30 days", "On completion", "Milestone-based"], false],
      ["duration", "Contract Duration", "text", "e.g. 3 months, until project completion", false],
      ["ir35_status", "IR35 Status", "select", ["Outside IR35", "Inside IR35", "Not yet determined"], false],
      ["ip_ownership", "IP / Work Product Ownership", "select", ["Client owns all work product", "Contractor retains IP, grants licence", "Shared ownership"], false],
      ["notice_period", "Notice Period", "select", ["1 week", "2 weeks", "1 month", "None"], false],
      ["special_terms", "Special Terms or Notes", "textarea", "Any additional requirements...", false]
    ],
    "Software Licence Agreement": [
      ["party_a_name", "Party A — Full Legal Name", "text", "", true],
      ["party_a_address", "Party A — Registered Address", "text", "", false],
      ["party_b_name", "Party B — Full Legal Name", "text", "", true],
      ["party_b_address", "Party B — Registered Address", "text", "", false],
      ["governing_law", "Governing Law & Jurisdiction", "select", ["England and Wales", "Scotland", "Northern Ireland", "Other (specify below)"], true],
      ["start_date", "Contract Start Date", "date", "", false],
      ["software_name", "Software / Product Name", "text", "e.g. Acme CRM Platform", true],
      ["licence_type", "Licence Type", "select", ["Perpetual licence", "Subscription (annual)", "Subscription (monthly)", "Site licence", "Per-user licence"], true],
      ["licence_fee", "Licence Fee (£)", "text", "e.g. 1,200/year or 100/month", false],
      ["permitted_users", "Permitted Users / Scope", "text", "e.g. Up to 10 named users", false],
      ["restrictions", "Use Restrictions", "textarea", "e.g. No sublicensing, no reverse engineering...", false],
      ["support_level", "Support & Maintenance", "select", ["None included", "Email support only", "Business hours support", "24/7 support"], false],
      ["special_terms", "Additional Terms", "textarea", "SLAs, data processing terms, update obligations...", false]
    ],
    "Partnership Agreement": [
      ["party_a_name", "Party A — Full Legal Name", "text", "", true],
      ["party_a_address", "Party A — Registered Address", "text", "", false],
      ["party_b_name", "Party B — Full Legal Name", "text", "", true],
      ["party_b_address", "Party B — Registered Address", "text", "", false],
      ["governing_law", "Governing Law & Jurisdiction", "select", ["England and Wales", "Scotland", "Northern Ireland", "Other (specify below)"], true],
      ["start_date", "Contract Start Date", "date", "", false],
      ["partnership_name", "Partnership / Business Name", "text", "e.g. Smith & Jones Partners", false],
      ["business_purpose", "Business Purpose", "textarea", "Describe the nature and purpose of the partnership...", true],
      ["profit_split", "Profit & Loss Split", "text", "e.g. 50/50", true],
      ["capital_contribution", "Capital Contributions", "textarea", "", false],
      ["decision_making", "Decision-Making Process", "select", ["Unanimous consent required", "Majority vote", "Managing partner decides", "Other"], false],
      ["duration", "Partnership Duration", "select", ["Indefinite", "Fixed term (specify in notes)", "Until project completion"], false],
      ["exit_provisions", "Exit & Dissolution Terms", "textarea", "", false]
    ],
    "Consultancy Agreement": [
      ["party_a_name", "Party A — Full Legal Name", "text", "", true],
      ["party_a_address", "Party A — Registered Address", "text", "", false],
      ["party_b_name", "Party B — Full Legal Name", "text", "", true],
      ["party_b_address", "Party B — Registered Address", "text", "", false],
      ["governing_law", "Governing Law & Jurisdiction", "select", ["England and Wales", "Scotland", "Northern Ireland", "Other"], true],
      ["start_date", "Contract Start Date", "date", "", false],
      ["services_description", "Consultancy Services", "textarea", "Describe the consultancy services required...", true],
      ["fee_amount", "Fee / Rate", "text", "e.g. £1,500/day", true],
      ["payment_terms", "Payment Terms", "select", ["14 days", "30 days", "Monthly in advance", "On completion"], false],
      ["duration", "Engagement Duration", "text", "e.g. 12 months, ongoing", false],
      ["exclusivity", "Exclusivity", "select", ["Non-exclusive (consultant may work for others)", "Exclusive within sector", "Fully exclusive"], false],
      ["confidentiality", "Confidentiality Requirements", "textarea", "", false],
      ["notice_period", "Notice Period", "select", ["2 weeks", "1 month", "3 months", "None"], false]
    ],
    "Terms of Service": [
      ["business_name", "Business / Company Name", "text", "e.g. Acme Ltd", true],
      ["website_url", "Website URL", "text", "e.g. https://www.example.com", false],
      ["service_description", "What Your Service Does", "textarea", "Describe what your platform/service provides...", true],
      ["user_obligations", "User Obligations & Rules", "textarea", "e.g. No spam, no illegal content, must be 18+...", false],
      ["payment_terms", "Payment / Subscription Terms", "textarea", "e.g. Monthly subscription...", false],
      ["ip_ownership", "Intellectual Property", "select", ["Company retains all IP", "User retains IP in their content", "Shared / licensed"], false],
      ["governing_law", "Governing Law", "select", ["England and Wales", "Scotland", "Northern Ireland", "Other"], true],
      ["special_terms", "Additional Clauses or Notes", "textarea", "", false]
    ]
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function renderContractFields() {
    const type = document.getElementById("contract-type").value;
    const container = document.getElementById("contract-fields");
    container.innerHTML = "";
    contractFields[type].forEach(field => {
      const [id, label, type, placeholder, required] = field;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<label>${label}${required ? " *" : ""}</label>`;
      let input;
      if (type === "select") {
        input = document.createElement("select");
        placeholder.forEach(option => input.add(new Option(option, option)));
      } else if (type === "textarea") {
        input = document.createElement("textarea");
        input.placeholder = placeholder;
      } else {
        input = document.createElement("input");
        input.type = type;
        input.placeholder = placeholder;
      }
      input.id = "gen-" + id;
      input.dataset.required = required ? "true" : "false";
      wrapper.appendChild(input);
      container.appendChild(wrapper);
    });
  }

  Object.keys(contractFields).forEach(type => document.getElementById("contract-type").add(new Option(type, type)));
  renderContractFields();
  document.getElementById("contract-type").addEventListener("change", renderContractFields);

  document.querySelectorAll(".laa-tab").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".laa-tab").forEach(tab => tab.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll(".laa-panel").forEach(panel => panel.classList.remove("active"));
      activeTab = button.dataset.tab;
      document.getElementById("panel-" + activeTab).classList.add("active");
    });
  });

  document.getElementById("choose-file").addEventListener("click", () => document.getElementById("document-file").click());
  document.getElementById("document-file").addEventListener("change", event => readDocument(event.target.files[0]));

  async function readDocument(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10 MB.");
      return;
    }
    const status = document.getElementById("file-status");
    status.textContent = "Reading " + file.name + "...";
    let text = "";
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      if (!window.pdfjsLib) throw new Error("PDF.js is unavailable.");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const buffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
      const pages = [];
      for (let index = 1; index <= pdf.numPages; index++) {
        const page = await pdf.getPage(index);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => item.str).join(" "));
      }
      text = pages.join("\n\n");
    } else if (file.type === "text/plain" || /\.txt$/i.test(file.name)) {
      text = await file.text();
    } else {
      alert("Only PDF and TXT files are accepted.");
      status.textContent = "";
      return;
    }
    sourceByTab[activeTab] = text;
    document.getElementById("text-" + activeTab).value = text;
    status.textContent = file.name + " loaded (" + text.split(/\s+/).filter(Boolean).length + " words)";
  }

  function snippet(text) {
    let value = escapeHtml(text.trim().slice(0, 140));
    if (text.trim().length > 140) value += "...";
    return value || "the submitted legal text";
  }

  function wordCount(text) {
    return (text || "").match(/\b[\w'-]+\b/g)?.length || 0;
  }

  function banner() {
    return "<div style='background:#f0f9ff;border-left:4px solid #0284c7;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#0c4a6e;'><strong>Portfolio Sandbox Mode:</strong> Displaying local, simulated British legal analysis in this standalone browser demo.</div>";
  }

  function produceAnalysis(type, text) {
    const count = wordCount(text);
    const quote = snippet(text);
    if (type === "risks") {
      return banner() + `<div class='laa-section laa-risks'><h3>Detailed Risk Assessment (${count} words analysed)</h3>
        <p><strong>1. Uncapped Consequential &amp; Indirect Liability</strong> <span class='laa-risk-badge' style='background:#fee2e2;color:#991b1b;'>HIGH RISK</span><br>The submitted clause (<em>&ldquo;${quote}&rdquo;</em>) lacks an explicit financial liability cap under the Unfair Contract Terms Act 1977 (UCTA).<br><strong>Mitigation:</strong> Cap aggregate liability at 100% of fees paid in the preceding 12 months, excluding death, personal injury, or fraud.</p>
        <p><strong>2. Asymmetric Termination Notice Period</strong> <span class='laa-risk-badge' style='background:#fef3c7;color:#92400e;'>MEDIUM RISK</span><br>Termination rights appear weighted towards one party without a mutual cure period for remediable material breaches.<br><strong>Mitigation:</strong> Introduce a mutual 14-day written notice and cure window before termination takes effect.</p>
        <p><strong>3. Governing Law &amp; Jurisdiction</strong> <span class='laa-risk-badge' style='background:#dcfce7;color:#166534;'>LOW RISK</span><br>Standard commercial wording detected; confirm exclusive jurisdiction of the courts of England and Wales.</p></div>`;
    }
    if (type === "missing") {
      return banner() + `<div class='laa-section laa-missing'><h3>Missing Standard Clauses (English Law Review)</h3><ul>
        <li><strong>UK GDPR &amp; Data Protection Schedule (Critical):</strong> No processor obligations under the Data Protection Act 2018 / UK GDPR detected.<br><em>Suggested Language:</em> &ldquo;Each party shall comply with all applicable requirements of the UK GDPR and Data Protection Act 2018.&rdquo;</li>
        <li><strong>Force Majeure Clause (Important):</strong> Document omits relief for events beyond reasonable control.<br><em>Suggested Language:</em> &ldquo;Neither party shall be in breach of this Agreement nor liable for delay in performing obligations resulting from events beyond its reasonable control.&rdquo;</li>
        <li><strong>Third-Party Rights Exclusion (Optional):</strong> Add an explicit exclusion under the Contracts (Rights of Third Parties) Act 1999.</li></ul></div>`;
    }
    if (type === "dates") {
      return banner() + `<div class='laa-section laa-dates'><h3>Extracted Dates &amp; Time-Sensitive Obligations</h3>
        <table class='laa-table'><thead><tr><th>Date / Period</th><th>Obligation</th><th>Responsible Party</th><th>Consequence if Missed</th></tr></thead><tbody>
        <tr><td>14 Days (Cure Window)</td><td>Remedy notified material breach</td><td>Defaulting Party</td><td>Immediate right of termination</td></tr>
        <tr><td>30 Days Net</td><td>Settlement of valid VAT invoices</td><td>Client / Receiving Party</td><td>Statutory interest under Late Payment Act 1998</td></tr>
        <tr><td>5 Years Post-Expiry</td><td>Maintain strict confidentiality</td><td>Receiving Party</td><td>Injunctive relief &amp; damages claim</td></tr></tbody></table></div>`;
    }
    if (type === "summary") {
      return banner() + `<div class='laa-section laa-summary'><h3>Plain-English Executive Summary</h3>
        <p><strong>What This Document Is:</strong> A commercial agreement governing service delivery, payment obligations, and confidentiality between two parties (${count} words reviewed).</p>
        <p><strong>Key Obligations:</strong> The supplying party must deliver agreed outputs on schedule, while the receiving party must pay invoices within standard terms and protect confidential data.</p>
        <p><strong>Overall Fairness Assessment:</strong> <span class='laa-risk-badge' style='background:#fef3c7;color:#92400e;'>BALANCED (WITH MINOR AMENDMENTS)</span> — Core terms follow standard UK commercial practice, though liability caps and mutual notice periods should be confirmed prior to execution.</p></div>`;
    }
    return banner() + `<div class='laa-section laa-overview'><h3>Document Overview</h3><p>Analysed <strong>${count} words</strong> of legal text (<em>&ldquo;${quote}&rdquo;</em>). Structured as a commercial instrument governed under English law.</p></div>
      <div class='laa-section laa-risks'><h3>Risk Assessment</h3><p><strong>MEDIUM:</strong> Liability cap and termination notice reciprocity require verification prior to signing.</p></div>
      <div class='laa-section laa-missing'><h3>Missing Clauses</h3><p>UK GDPR Data Protection clause, Force Majeure, and Third-Party Rights exclusion (Contracts Act 1999).</p></div>
      <div class='laa-section laa-dates'><h3>Key Dates &amp; Deadlines</h3><p>14-day breach cure window; 30-day invoice settlement; 5-year post-termination confidentiality period.</p></div>
      <div class='laa-section laa-recommendations'><h3>Recommendations</h3><ol><li>Insert an explicit aggregate liability cap.</li><li>Ensure termination notice periods are reciprocal.</li><li>Specify exclusive jurisdiction of the courts of England and Wales.</li></ol></div>`;
  }

  function collectFields() {
    const values = {};
    document.querySelectorAll("#contract-fields input, #contract-fields textarea, #contract-fields select").forEach(input => {
      values[input.id.replace("gen-", "")] = input.value.trim();
    });
    return values;
  }

  function generateContract(type, values) {
    const partyA = values.party_a_name || "[PARTY A LEGAL NAME]";
    const partyB = values.party_b_name || "[PARTY B LEGAL NAME]";
    const governingLaw = values.governing_law || "England and Wales";
    const dateLabel = values.start_date ? new Date(values.start_date + "T12:00:00").toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" }) : new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" });
    const details = contractFields[type].map(field => {
      const value = values[field[0]];
      return value ? field[1].replace(/ — /g, ": ").replace(/ \*/g, "") + ": " + escapeHtml(value) : "";
    }).filter(Boolean).join("<br>");
    const services = values.services_description || values.business_purpose || values.service_description || "the services specified in this Agreement";
    return banner() + `<div class='laa-section laa-generated-contract'>
      <h2 style='text-align:center;text-transform:uppercase;'>${escapeHtml(type)} Agreement</h2>
      <p><strong>THIS AGREEMENT</strong> is made on ${dateLabel} between <strong>${escapeHtml(partyA)}</strong> (&ldquo;Party A&rdquo;) and <strong>${escapeHtml(partyB)}</strong> (&ldquo;Party B&rdquo;).</p>
      <p><strong>1. SCOPE OF SERVICES:</strong> Party B shall provide ${escapeHtml(services)}, exercising reasonable skill and care in accordance with the Supply of Goods and Services Act 1982.</p>
      <p><strong>2. CONFIDENTIALITY:</strong> Each party undertakes that it shall not at any time disclose to any person confidential information concerning the business, affairs, or technical systems of the other party.</p>
      <p><strong>3. INTELLECTUAL PROPERTY:</strong> Subject to full payment of all undisputed fees, bespoke deliverables created specifically under this Agreement shall vest in Party A unless otherwise stated below.</p>
      <p><strong>4. LIMITATION OF LIABILITY:</strong> Nothing in this Agreement limits liability for death or personal injury caused by negligence, or for fraud. Subject to this, total aggregate liability shall not exceed 100% of the fees paid under this Agreement.</p>
      <p><strong>5. TERMINATION:</strong> Either party may terminate for a remediable material breach where that breach is not remedied within 14 days of written notice.</p>
      <p><strong>6. GOVERNING LAW:</strong> This Agreement and any dispute arising out of it shall be governed by and construed in accordance with the law of ${escapeHtml(governingLaw)}.</p>
      <p><strong>CONTRACT DETAILS</strong><br>${details}</p>
      <p>[PARTY_A_SIGNATURE_BLOCK]</p><p>[PARTY_B_SIGNATURE_BLOCK]</p></div>`;
  }

  document.querySelectorAll(".laa-action").forEach(button => {
    button.addEventListener("click", () => runAnalysis(button.dataset.action));
  });

  function showLoading(show) {
    document.getElementById("placeholder").hidden = show;
    document.getElementById("loading").hidden = !show;
    document.getElementById("results").hidden = show;
  }

  function runAnalysis(type) {
    let text = sourceByTab[type] || document.getElementById("text-" + type).value.trim();
    if (!text) {
      alert("Please upload a PDF or TXT file, or paste document text.");
      return;
    }
    showLoading(true);
    window.setTimeout(() => {
      const html = produceAnalysis(type, text);
      showLoading(false);
      document.getElementById("results").innerHTML = html;
      document.getElementById("results").hidden = false;
      document.getElementById("open-sign").hidden = true;
    }, 350);
  }

  document.getElementById("generate-contract").addEventListener("click", () => {
    const type = document.getElementById("contract-type").value;
    const values = collectFields();
    const missing = contractFields[type].filter(field => field[4] && !values[field[0]]);
    if (missing.length) {
      alert("Please complete the required fields: " + missing.map(field => field[1]).join(", "));
      return;
    }
    showLoading(true);
    window.setTimeout(() => {
      currentContractType = type;
      currentContractHtml = generateContract(type, values);
      showLoading(false);
      document.getElementById("results").innerHTML = currentContractHtml;
      document.getElementById("results").hidden = false;
      document.getElementById("open-sign").hidden = false;
    }, 350);
  });

  const modal = document.getElementById("signature-modal");
  document.getElementById("open-sign").addEventListener("click", () => {
    modal.hidden = false;
    document.getElementById("party-a-name").value = "";
    document.getElementById("party-b-name").value = "";
    document.getElementById("party-a-email").value = "";
    document.getElementById("party-b-email").value = "";
    ["canvas-a", "canvas-b"].forEach(id => {
      document.getElementById(id).getContext("2d").clearRect(0, 0, 320, 110);
    });
    signed.a = false;
    signed.b = false;
    setupCanvases();
  });
  ["close-sign", "cancel-sign"].forEach(id => document.getElementById(id).addEventListener("click", () => { modal.hidden = true; }));

  document.querySelectorAll(".laa-sign-mode button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".laa-sign-mode button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      signatureMode = button.dataset.mode;
      document.getElementById("draw-mode").hidden = signatureMode !== "draw";
      document.getElementById("type-mode").hidden = signatureMode !== "type";
    });
  });

  function setupCanvas(canvas, party) {
    const context = canvas.getContext("2d");
    context.strokeStyle = "#1a1a2e";
    context.lineWidth = 2.2;
    context.lineCap = "round";
    context.lineJoin = "round";
    let drawing = false;
    function position(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
    }
    canvas.onpointerdown = event => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const point = position(event);
      context.beginPath();
      context.moveTo(point.x, point.y);
    };
    canvas.onpointermove = event => {
      if (!drawing) return;
      const point = position(event);
      context.lineTo(point.x, point.y);
      context.stroke();
      signed[party] = true;
    };
    canvas.onpointerup = canvas.onpointerleave = () => { drawing = false; };
  }

  function setupCanvases() {
    setupCanvas(document.getElementById("canvas-a"), "a");
    setupCanvas(document.getElementById("canvas-b"), "b");
  }

  document.querySelectorAll("[data-clear]").forEach(button => {
    button.addEventListener("click", () => {
      const canvas = document.getElementById(button.dataset.clear);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      signed[button.dataset.clear.endsWith("a") ? "a" : "b"] = false;
    });
  });

  function typedSignature(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 110;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 320, 110);
    context.fillStyle = "#1a1a2e";
    context.font = "italic 48px Georgia, serif";
    context.textBaseline = "middle";
    context.fillText(text, 12, 62);
    return canvas.toDataURL("image/png");
  }

  function getSignatures() {
    if (signatureMode === "draw") {
      if (!signed.a || !signed.b) throw new Error("Both parties must draw their signature.");
      return [
        document.getElementById("canvas-a").toDataURL("image/png"),
        document.getElementById("canvas-b").toDataURL("image/png")
      ];
    }
    const nameA = document.getElementById("type-a").value.trim();
    const nameB = document.getElementById("type-b").value.trim();
    if (!nameA || !nameB) throw new Error("Both parties must type their name to sign.");
    return [typedSignature(nameA), typedSignature(nameB)];
  }

  function signedContractHtml(signatures, nameA, nameB) {
    const signatureA = signatures[0].replace(/^data:image\/png;base64,/, "");
    const signatureB = signatures[1].replace(/^data:image\/png;base64,/, "");
    return currentContractHtml
      .replace("[PARTY_A_SIGNATURE_BLOCK]", `<strong>Signed by Party A:</strong> ${escapeHtml(nameA)}<br><img src="data:image/png;base64,${signatureA}" alt="Party A signature" style="max-width:260px;height:70px">`)
      .replace("[PARTY_B_SIGNATURE_BLOCK]", `<strong>Signed by Party B:</strong> ${escapeHtml(nameB)}<br><img src="data:image/png;base64,${signatureB}" alt="Party B signature" style="max-width:260px;height:70px">`);
  }

  function validateSigning() {
    const nameA = document.getElementById("party-a-name").value.trim();
    const nameB = document.getElementById("party-b-name").value.trim();
    if (!nameA || !nameB) throw new Error("Please enter full legal names for both parties.");
    return { nameA, nameB };
  }

  function prepareSignedContract() {
    const error = document.getElementById("sign-error");
    try {
      const names = validateSigning();
      const signatures = getSignatures();
      error.hidden = true;
      return { html: signedContractHtml(signatures, names.nameA, names.nameB), names };
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
      return null;
    }
  }

  document.getElementById("print-signed").addEventListener("click", () => {
    const prepared = prepareSignedContract();
    if (!prepared) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>Signed Contract</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#1c2b38}h2{text-align:center}img{height:70px}</style></head><body>${prepared.html}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  });

  document.getElementById("download-signed").addEventListener("click", () => {
    const prepared = prepareSignedContract();
    if (!prepared) return;
    if (!window.jspdf) {
      alert("PDF download library is unavailable. Use Print Contract to print or save as PDF.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:"pt", format:"a4" });
    doc.setProperties({ title: currentContractType + " Agreement" });
    const cleanText = prepared.html.replace(/<img[^>]*>/gi, "[signature]").replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&ldquo;|&rdquo;/g, '"').replace(/\n{3,}/g, "\n\n");
    const lines = doc.splitTextToSize(cleanText.trim(), 500);
    let y = 48;
    lines.forEach(line => {
      if (y > 790) { doc.addPage(); y = 48; }
      doc.text(line, 48, y);
      y += 16;
    });
    const signatures = getSignatures();
    try {
      doc.addImage(signatures[0], "PNG", 48, Math.min(y + 12, 710), 220, 75);
      doc.addImage(signatures[1], "PNG", 48, Math.min(y + 100, 798), 220, 75);
    } catch (_) {}
    doc.save(currentContractType.toLowerCase().replace(/\W+/g, "-") + "-signed.pdf");
  });
})();
