(function () {
  "use strict";

  const textArea = document.getElementById("contract-text");
  const results = document.getElementById("results");
  const placeholder = document.getElementById("results-placeholder");
  const analysisControls = document.getElementById("analysis-controls");
  const generatorForm = document.getElementById("generator-form");
  const signatureSection = document.getElementById("signature-section");
  let activeTab = "analysis";
  let contractHtml = "";

  const sampleContract = `SERVICE AGREEMENT
This Agreement is made between Acme Ltd of 12 High Street, London EC1A 1BB ("Client") and Smith Consulting Ltd of 45 Park Lane, Manchester M1 2AB ("Supplier").
The Supplier will provide technical consultancy and software engineering services. The fee is £5,000, payable within 30 days of a valid VAT invoice.
Each party will protect confidential information for five years after termination. The Supplier may terminate on one month's written notice.
Termination is available for material breach after a 14-day cure period. The Agreement is governed by the laws of England and Wales.
The parties acknowledge their obligations under UK GDPR and the Data Protection Act 2018.`;

  document.querySelectorAll(".laa-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".laa-tab").forEach(item => item.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      const generating = activeTab === "generate";
      analysisControls.hidden = generating;
      generatorForm.hidden = !generating;
      signatureSection.hidden = true;
      results.hidden = generating;
      placeholder.hidden = generating;
    });
  });

  document.getElementById("load-sample").addEventListener("click", () => {
    textArea.value = sampleContract;
  });

  document.getElementById("contract-file").addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { textArea.value = reader.result; };
    reader.onerror = () => alert("Unable to read the selected file.");
    reader.readAsText(file);
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);
  }

  function stats(text) {
    const words = (text.match(/\b[\w'-]+\b/g) || []).length;
    const snippet = text.trim().slice(0, 140);
    return { words, snippet: escapeHtml(snippet) + (text.trim().length > 140 ? "..." : "") };
  }

  function analysisOutput(type, text) {
    const s = stats(text);
    const banner = "<div class='laa-result-section'><strong>Portfolio Sandbox Mode:</strong> Simulated British-English legal analysis based on English law principles.</div>";

    if (type === "risk") {
      return banner + `
        <div class="laa-result-section"><h3>Risk Assessment — ${s.words} words analysed</h3>
        <p><strong>1. Uncapped Consequential Liability</strong> <span class="laa-risk high">HIGH RISK</span><br>
        The clause beginning <em>“${s.snippet}”</em> should contain an express financial liability cap under the Unfair Contract Terms Act 1977 (UCTA).<br>
        <strong>Mitigation:</strong> Limit aggregate liability to fees paid in the preceding 12 months, excluding liability that cannot lawfully be limited.</p>
        <p><strong>2. Termination Notice</strong> <span class="laa-risk medium">MEDIUM RISK</span><br>
        Termination rights should be reciprocal and include a 14-day remediation period for remediable material breaches.</p>
        <p><strong>3. Governing Law</strong> <span class="laa-risk low">LOW RISK</span><br>
        Confirm exclusive jurisdiction of the courts of England and Wales.</p></div>`;
    }

    if (type === "missing") {
      return banner + `
        <div class="laa-result-section"><h3>Missing Standard Clauses — English Law Review</h3><ul>
        <li><strong>UK GDPR and Data Protection Schedule (Critical):</strong> Include processor duties under the Data Protection Act 2018 and UK GDPR.</li>
        <li><strong>Force Majeure (Important):</strong> Provide relief for events beyond a party's reasonable control.</li>
        <li><strong>Third-Party Rights Exclusion (Optional):</strong> State the position under the Contracts (Rights of Third Parties) Act 1999.</li></ul></div>`;
    }

    if (type === "dates") {
      return banner + `
        <div class="laa-result-section"><h3>Key Dates and Time-Sensitive Obligations</h3>
        <table class="laa-table"><thead><tr><th>Date / Period</th><th>Obligation</th><th>Responsible Party</th><th>Consequence</th></tr></thead><tbody>
        <tr><td>14 days</td><td>Remedy a material breach</td><td>Defaulting party</td><td>Termination may arise</td></tr>
        <tr><td>30 days net</td><td>Pay valid VAT invoices</td><td>Client</td><td>Interest under the Late Payment Act 1998</td></tr>
        <tr><td>5 years post-expiry</td><td>Maintain confidentiality</td><td>Receiving party</td><td>Injunctive relief or damages</td></tr></tbody></table></div>`;
    }

    if (type === "summary") {
      return banner + `
        <div class="laa-result-section"><h3>Plain-English Executive Summary</h3>
        <p><strong>Purpose:</strong> This is a commercial agreement covering services, payment, confidentiality, termination, and liability.</p>
        <p><strong>Party obligations:</strong> The Supplier must provide the agreed services and protect confidential information; the Client must pay valid invoices.</p>
        <p><strong>Fairness assessment:</strong> <span class="laa-risk medium">BALANCED</span>, with liability, data protection, and termination terms requiring confirmation.</p></div>`;
    }

    return banner + `
      <div class="laa-result-section"><h3>Document Overview</h3><p>Analysed <strong>${s.words} words</strong> (<em>“${s.snippet}”</em>). The document appears to be a commercial agreement governed by English law.</p></div>
      <div class="laa-result-section"><h3>Risk Assessment</h3><p><span class="laa-risk medium">MEDIUM</span> Liability, termination, payment, and confidentiality provisions require review against UCTA 1977 and applicable safeguards.</p></div>
      <div class="laa-result-section"><h3>Missing Clauses</h3><p>Check for UK GDPR and data processing terms, force majeure, third-party rights under the Contracts (Rights of Third Parties) Act 1999, and dispute resolution.</p></div>
      <div class="laa-result-section"><h3>Key Dates and Deadlines</h3><p>14-day breach cure window; 30-day invoice settlement; five-year confidentiality period.</p></div>
      <div class="laa-result-section"><h3>Recommendations</h3><ol><li>Add an express liability cap.</li><li>Use reciprocal termination notice periods.</li><li>Specify the courts of England and Wales as the exclusive jurisdiction.</li></ol></div>`;
  }

  document.getElementById("analyse-button").addEventListener("click", () => {
    const text = textArea.value.trim();
    if (!text) {
      alert("Please paste contract text or upload a .txt/.md file.");
      return;
    }
    placeholder.hidden = true;
    results.innerHTML = analysisOutput(activeTab, text);
    results.hidden = false;
  });

  document.getElementById("generate-button").addEventListener("click", () => {
    const type = document.getElementById("contract-type").value;
    const partyA = document.getElementById("party-a").value.trim();
    const partyB = document.getElementById("party-b").value.trim();
    const details = document.getElementById("scope-details").value.trim();
    if (!partyA || !partyB || !details) {
      alert("Please enter Party A, Party B, and the scope/details.");
      return;
    }
    const date = new Intl.DateTimeFormat("en-GB", { day:"2-digit", month:"long", year:"numeric" }).format(new Date());
    contractHtml = `
      <div class="laa-result-section"><h2 style="text-align:center;text-transform:uppercase">${escapeHtml(type)} Agreement</h2>
      <p><strong>THIS AGREEMENT</strong> is made on ${date} between <strong>${escapeHtml(partyA)}</strong> ("Party A") and <strong>${escapeHtml(partyB)}</strong> ("Party B").</p>
      <p><strong>1. Scope:</strong> Party B shall provide ${escapeHtml(details)}, exercising reasonable skill and care.</p>
      <p><strong>2. Payment:</strong> Valid undisputed invoices shall be paid within 30 days.</p>
      <p><strong>3. Confidentiality:</strong> Each party shall protect confidential information, consistent with the Data Protection Act 2018 and UK GDPR.</p>
      <p><strong>4. Intellectual Property:</strong> Bespoke deliverables shall vest in Party A upon full payment unless otherwise agreed.</p>
      <p><strong>5. Liability:</strong> Liability for death, personal injury, fraud, or liability that cannot lawfully be limited is not excluded. Subject to UCTA 1977, liability is limited to 100% of fees paid.</p>
      <p><strong>6. Termination:</strong> Either party may terminate for a remediable breach not cured within 14 days of written notice.</p>
      <p><strong>7. Governing Law:</strong> This Agreement is governed by English law, with exclusive jurisdiction of the courts of England and Wales.</p>
      <p id="party-a-signature-block"><strong>Party A signature:</strong></p>
      <p id="party-b-signature-block"><strong>Party B signature:</strong></p></div>`;
    results.innerHTML = contractHtml;
    results.hidden = false;
    placeholder.hidden = true;
    signatureSection.hidden = false;
  });

  function setupCanvas(canvas) {
    const context = canvas.getContext("2d");
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#1a1a2e";
    let drawing = false;

    function position(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    canvas.addEventListener("pointerdown", event => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const point = position(event);
      context.beginPath();
      context.moveTo(point.x, point.y);
    });
    canvas.addEventListener("pointermove", event => {
      if (!drawing) return;
      const point = position(event);
      context.lineTo(point.x, point.y);
      context.stroke();
    });
    canvas.addEventListener("pointerup", () => { drawing = false; });
    canvas.addEventListener("pointerleave", () => { drawing = false; });
  }

  setupCanvas(document.getElementById("canvas-a"));
  setupCanvas(document.getElementById("canvas-b"));

  document.querySelectorAll(".laa-clear").forEach(button => {
    button.addEventListener("click", () => {
      const canvas = document.getElementById(button.dataset.canvas);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    });
  });

  document.getElementById("apply-signatures").addEventListener("click", () => {
    const partyA = document.getElementById("canvas-a").toDataURL("image/png");
    const partyB = document.getElementById("canvas-b").toDataURL("image/png");
    const signed = contractHtml
      .replace('<p id="party-a-signature-block"><strong>Party A signature:</strong></p>',
        '<p id="party-a-signature-block"><strong>Party A signature:</strong><br><img src="' + partyA + '" alt="Party A signature" style="max-width:260px;height:75px"></p>')
      .replace('<p id="party-b-signature-block"><strong>Party B signature:</strong></p>',
        '<p id="party-b-signature-block"><strong>Party B signature:</strong><br><img src="' + partyB + '" alt="Party B signature" style="max-width:260px;height:75px"></p>');
    results.innerHTML = signed;
    window.print();
  });
})();
