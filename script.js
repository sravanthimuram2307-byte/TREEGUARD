
const alerts = [
  {
    id: "FR-1024",
    zone: "North Forest / Sector 04",
    type: "Chainsaw-like sound",
    time: "10:42 AM",
    confidence: 96,
    status: "Pending",
    location: "16.5120, 80.6210"
  },
  {
    id: "FR-1023",
    zone: "East Forest / Sector 02",
    type: "Unusual acoustic activity",
    time: "10:18 AM",
    confidence: 83,
    status: "Reviewing",
    location: "16.5200, 80.6300"
  },
  {
    id: "FR-1022",
    zone: "South Forest / Sector 07",
    type: "Possible tree-cutting sound",
    time: "09:54 AM",
    confidence: 78,
    status: "Resolved",
    location: "16.4900, 80.6100"
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const escapeHTML = (value) =>
  String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function renderStats() {
  $("#openAlerts").textContent =
    alerts.filter(a => a.status !== "Resolved").length;
  $("#resolvedAlerts").textContent =
    alerts.filter(a => a.status === "Resolved").length;
  $("#navCount").textContent =
    alerts.filter(a => a.status !== "Resolved").length;
}

function renderAlerts() {
  const query = $("#searchInput").value.toLowerCase().trim();

  const filtered = alerts.filter(a =>
    `${a.id} ${a.zone} ${a.type} ${a.status} ${a.location}`
      .toLowerCase()
      .includes(query)
  );

  $("#alertsBody").innerHTML = filtered.map(a => {
    const statusClass = a.status.toLowerCase();

    return `
      <tr>
        <td>
          <strong>${escapeHTML(a.id)}</strong>
          <small class="table-sub">${escapeHTML(a.zone)}</small>
          <small class="table-sub">${escapeHTML(a.location)}</small>
        </td>
        <td>${escapeHTML(a.type)}</td>
        <td>${escapeHTML(a.time)}</td>
        <td>
          <div class="score">
            <div><span style="width:${a.confidence}%"></span></div>
            <small>${a.confidence}%</small>
          </div>
        </td>
        <td><span class="badge ${statusClass}">${escapeHTML(a.status)}</span></td>
        <td>
          ${a.status !== "Resolved"
            ? `<button class="resolve-button" data-resolve="${escapeHTML(a.id)}">✓ Resolve</button>`
            : `<span class="done-text">Reviewed</span>`}
        </td>
      </tr>`;
  }).join("");

  if (!filtered.length) {
    $("#alertsBody").innerHTML =
      '<tr><td colspan="6">No matching alerts found.</td></tr>';
  }

  $("#recordCount").textContent =
    `${filtered.length} sample record${filtered.length === 1 ? "" : "s"} displayed`;

  renderStats();
}

function renderDetectionEvents() {
  $("#detectionEvents").innerHTML = alerts.map(a => `
    <div class="event-row">
      <div class="event-icon">〰</div>
      <div>
        <strong>${escapeHTML(a.type)}</strong>
        <p>${escapeHTML(a.zone)} · ${escapeHTML(a.time)}</p>
      </div>
      <span class="confidence">${a.confidence}% sample score</span>
    </div>
  `).join("");
}

function showPage(page) {
  const pages = {
    dashboard: "Forest Overview",
    detection: "Detection Center",
    alerts: "Incident Alerts"
  };

  $$(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  $("#breadcrumb").textContent = pages[page];
  $("#pageTitle").textContent = pages[page];

  $("#dashboardPage").classList.toggle("hidden", page !== "dashboard");
  $("#detectionPage").classList.toggle("hidden", page !== "detection");
  $("#alertsPanel").classList.toggle("hidden", page === "detection");

  $("#tableTitle").textContent =
    page === "alerts" ? "All Incident Alerts" : "Recent Alerts";

  $("#sidebar").classList.remove("open");

  if (page !== "detection") {
    $("#alertsPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (page === "detection") {
    $("#detectionPage").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

$$(".nav-item").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

$$("[data-goto]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.goto));
});

$("#menuButton").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

$("#searchInput").addEventListener("input", renderAlerts);

$("#clearSearch").addEventListener("click", () => {
  $("#searchInput").value = "";
  renderAlerts();
});

$("#alertsBody").addEventListener("click", event => {
  const button = event.target.closest("[data-resolve]");
  if (!button) return;

  const alert = alerts.find(a => a.id === button.dataset.resolve);
  if (!alert || alert.status === "Resolved") return;

  alert.status = "Resolved";
  renderAlerts();
  renderDetectionEvents();
  showToast(`${alert.id} marked as resolved.`);
});

$$(".map-pin").forEach(pin => {
  pin.addEventListener("click", () => {
    const zone = pin.dataset.zone;
    $("#searchInput").value = zone;
    renderAlerts();
    showPage("alerts");
    showToast(`Showing records matching ${zone}.`);
  });
});

// Illustrative waveform, not real sound analysis.
const waveform = $(".waveform");

for (let i = 0; i < 48; i++) {
  const bar = document.createElement("span");
  bar.style.height = `${12 + ((i * 37 + 13) % 58)}px`;
  waveform.appendChild(bar);
}

$("#currentDate").textContent = "📅 " +
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());

renderAlerts();
renderDetectionEvents();
