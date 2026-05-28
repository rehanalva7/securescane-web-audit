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
  {
    title: "SQL Injection Scanner",
    type: "success",
    detail: "Tidak ditemukan pola query parameter berisiko tinggi."
  },
  {
    title: "XSS Scanner",
    type: "success",
    detail: "Input reflection dasar tidak terdeteksi pada halaman crawled."
  },
  {
    title: "JWT Security Test",
    type: "warning",
    detail: "Pastikan token memiliki expiry singkat dan algoritma signing kuat."
  },
  {
    title: "CSRF Audit",
    type: "warning",
    detail: "Beberapa form perlu diverifikasi memiliki CSRF token."
  },
  {
    title: "Security Header Check",
    type: "danger",
    detail: "Content-Security-Policy belum terlihat pada simulasi response."
  },
  {
    title: "HTTPS Validation",
    type: "success",
    detail: "URL menggunakan HTTPS dan siap divalidasi oleh backend."
  },
  {
    title: "Session Cookie Audit",
    type: "info",
    detail: "Cookie perlu dicek untuk flag HttpOnly, Secure, dan SameSite."
  },
  {
    title: "Admin Panel Discovery",
    type: "info",
    detail: "Endpoint umum seperti /admin dan /login disiapkan untuk discovery."
  }
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