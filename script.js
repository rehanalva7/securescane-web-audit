const scanForm = document.querySelector("#scanForm");
const targetUrl = document.querySelector("#targetUrl");
const formHint = document.querySelector("#formHint");
const progressText = document.querySelector("#progressText");
const progressPercent = document.querySelector("#progressPercent");
const progressBar = document.querySelector("#progressBar");
const resultSummary = document.querySelector("#resultSummary");
const riskLevel = document.querySelector("#riskLevel");
const riskDescription = document.querySelector("#riskDescription");
const checksGrid = document.querySelector("#checksGrid");
const exportReport = document.querySelector("#exportReport");
const totalScan = document.querySelector("#totalScan");
const highIssues = document.querySelector("#highIssues");
const pagesCrawled = document.querySelector("#pagesCrawled");
const historyTable = document.querySelector("#historyTable");
const heroScore = document.querySelector("#heroScore");

let scanCount = 0;
let latestReport = null;

const scanSteps = [
  "Validasi URL",
  "Crawling halaman internal",
  "Menjalankan SQL Injection Scanner",
  "Menjalankan XSS Scanner",
  "Audit CSRF, JWT, dan API",
  "Cek cookie, header, HTTPS, dan server",
  "Menyusun laporan keamanan"
];

const auditChecks = [
  { title: "SQL Injection Scanner", type: "success", detail: "Tidak ditemukan pola query parameter berisiko tinggi." },
  { title: "XSS Scanner", type: "success", detail: "Input reflection dasar tidak terdeteksi pada halaman crawled." },
  { title: "JWT Security Test", type: "warning", detail: "Pastikan token memiliki expiry singkat dan algoritma signing kuat." },
  { title: "CSRF Audit", type: "warning", detail: "Beberapa form perlu diverifikasi memiliki CSRF token." },
  { title: "Security Header Check", type: "danger", detail: "Content-Security-Policy belum terlihat pada simulasi response." },
  { title: "HTTPS Validation", type: "success", detail: "URL menggunakan HTTPS dan siap divalidasi oleh backend." },
  { title: "Session Cookie Audit", type: "info", detail: "Cookie perlu dicek untuk flag HttpOnly, Secure, dan SameSite." },
  { title: "Admin Panel Discovery", type: "info", detail: "Endpoint umum seperti /admin dan /login disiapkan untuk discovery." }
];

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function setProgress(percent, text) {
  progressText.textContent = text;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}

function renderChecks() {
  checksGrid.innerHTML = auditChecks
    .map(
      (check) => `
        <article class="check-card ${check.type}">
          <span class="status-dot"></span>
          <h3>${check.title}</h3>
          <p>${check.detail}</p>
        </article>
      `
    )
    .join("");
}

function completeScan(url) {
  const score = 82 + Math.floor(Math.random() * 9);
  const crawled = 12 + Math.floor(Math.random() * 18);

  latestReport = { url, score, crawled, checks: auditChecks };

  heroScore.textContent = score >= 88 ? "A" : "B+";
  riskLevel.textContent = "Medium";
  riskDescription.textContent = "Website cukup baik, tetapi masih perlu peningkatan pada security header, CSRF validation, dan hardening session.";
  resultSummary.textContent = `Scan selesai untuk ${url}. ${crawled} halaman berhasil dicrawling dengan skor keamanan ${score}%.`;
  exportReport.disabled = false;

  renderChecks();

  scanCount += 1;
  totalScan.textContent = scanCount;
  highIssues.textContent = "1";
  pagesCrawled.textContent = crawled;

  historyTable.innerHTML = `
    <tr>
      <td>${url}</td>
      <td>${score}%</td>
      <td>Medium</td>
      <td>Completed</td>
    </tr>
  `;

  document.querySelector("#result").scrollIntoView({ behavior: "smooth" });
}

scanForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const url = targetUrl.value.trim();

  if (!isValidUrl(url)) {
    formHint.textContent = "URL belum valid. Gunakan http:// atau https:// di awal alamat.";
    formHint.style.color = "#cf3b3b";
    return;
  }

  formHint.textContent = "URL valid. Scan sedang berjalan.";
  formHint.style.color = "#178c62";
  exportReport.disabled = true;

  let index = 0;
  setProgress(0, scanSteps[index]);

  const timer = setInterval(function () {
    index += 1;
    const percent = Math.min(100, Math.round((index / scanSteps.length) * 100));
    const label = scanSteps[Math.min(index, scanSteps.length - 1)];

    setProgress(percent, label);

    if (percent === 100) {
      clearInterval(timer);
      setTimeout(function () {
        completeScan(url);
      }, 350);
    }
  }, 420);
});

exportReport.addEventListener("click", function () {
  if (!latestReport) return;

  const lines = [
    "SecureScan Web Audit Report",
    `Target: ${latestReport.url}`,
    `Security Score: ${latestReport.score}%`,
    `Pages Crawled: ${latestReport.crawled}`,
    "",
    "Audit Findings:",
    ...latestReport.checks.map((item) => `- ${item.title}: ${item.detail}`)
  ];

  const reportWindow = window.open("", "_blank");
  reportWindow.document.write(`
    <title>SecureScan Report</title>
    <pre style="font: 14px/1.6 Arial, sans-serif; white-space: pre-wrap; padding: 32px;">${lines.join("\n")}</pre>
    <script>window.print();<\/script>
  `);
  reportWindow.document.close();
});
exportReport.addEventListener(
  "click",
  function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!latestReport) {
      alert("Jalankan scan terlebih dahulu.");
      return;
    }

    const oldReport = document.querySelector("#printReport");
    if (oldReport) oldReport.remove();

    const report = document.createElement("section");
    report.id = "printReport";
    report.innerHTML = `
      <h1>SecureScan Web Audit Report</h1>
      <p><strong>Target:</strong> ${latestReport.url}</p>
      <p><strong>Security Score:</strong> ${latestReport.score}%</p>
      <p><strong>Pages Crawled:</strong> ${latestReport.crawled}</p>
      <h2>Audit Findings</h2>
      <ul>
        ${latestReport.checks
          .map((item) => `<li><strong>${item.title}</strong>: ${item.detail}</li>`)
          .join("")}
      </ul>
    `;

    document.body.appendChild(report);

    const style = document.createElement("style");
    style.id = "printStyle";
    style.innerHTML = `
      #printReport { display: none; }
      @media print {
        body > *:not(#printReport) { display: none !important; }
        #printReport {
          display: block;
          padding: 32px;
          font-family: Arial, sans-serif;
          color: #111;
        }
        #printReport h1 { font-size: 28px; margin-bottom: 18px; }
        #printReport h2 { font-size: 20px; margin-top: 24px; }
        #printReport p, #printReport li { font-size: 14px; line-height: 1.6; }
      }
    `;

    document.head.appendChild(style);
    window.print();
  },
  true
);
