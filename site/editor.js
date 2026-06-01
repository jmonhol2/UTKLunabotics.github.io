const owner = "jmonhol2";
const repo = "UTKLunabotics.github.io";
const branch = "main";
const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/`;

const editablePages = [
  ["How to Use This Wiki", "docs/start-here/how-to-use-this-wiki.md"],
  ["Project Cycle Overview", "docs/start-here/project-cycle-overview.md"],
  ["Roles and Ownership", "docs/start-here/roles-and-ownership.md"],
  ["Current Year Handoff", "docs/handoffs/current-year-handoff.md"],
  ["Leadership Overview", "docs/leadership/README.md"],
  ["Team Captain / President", "docs/leadership/team-captain-president.md"],
  ["Project Manager", "docs/leadership/project-manager.md"],
  ["Mechanical Lead", "docs/leadership/mechanical-lead.md"],
  ["Electrical Lead", "docs/leadership/electrical-lead.md"],
  ["Software Lead", "docs/leadership/software-lead.md"],
  ["Manufacturing Lead", "docs/leadership/manufacturing-lead.md"],
  ["Testing Lead", "docs/leadership/testing-lead.md"],
  ["Business / Outreach Lead", "docs/leadership/business-outreach-lead.md"],
  ["Safety Lead", "docs/leadership/safety-lead.md"],
  ["Teams Overview", "docs/teams/README.md"],
  ["Mechanical Team", "docs/teams/mechanical/README.md"],
  ["Mechanical: Chassis / Drivetrain", "docs/teams/mechanical/chassis-drivetrain.md"],
  ["Mechanical: Excavation", "docs/teams/mechanical/excavation.md"],
  ["Mechanical: Conveyance", "docs/teams/mechanical/conveyance.md"],
  ["Mechanical: Deposition", "docs/teams/mechanical/deposition.md"],
  ["Mechanical: CAD and Integration", "docs/teams/mechanical/cad-integration.md"],
  ["Electrical Team", "docs/teams/electrical/README.md"],
  ["Electrical: Power Distribution", "docs/teams/electrical/power-distribution.md"],
  ["Electrical: Wiring and Harnessing", "docs/teams/electrical/wiring-harnessing.md"],
  ["Electrical: Sensors", "docs/teams/electrical/sensors.md"],
  ["Electrical: Controls Hardware", "docs/teams/electrical/controls-hardware.md"],
  ["Software Team", "docs/teams/software/README.md"],
  ["Software: Robot Control", "docs/teams/software/robot-control.md"],
  ["Software: Autonomy", "docs/teams/software/autonomy.md"],
  ["Software: Telemetry and Data", "docs/teams/software/telemetry-data.md"],
  ["Software: Developer Tools", "docs/teams/software/developer-tools.md"],
  ["Business and Outreach Team", "docs/teams/business-outreach/README.md"],
  ["Business: Sponsorship", "docs/teams/business-outreach/sponsorship.md"],
  ["Business: Documentation and Reports", "docs/teams/business-outreach/documentation-reports.md"],
  ["Business: Media and Outreach", "docs/teams/business-outreach/media-outreach.md"],
  ["Business: Travel and Logistics", "docs/teams/business-outreach/travel-logistics.md"],
  ["Operations Team", "docs/teams/operations/README.md"],
  ["Operations: Safety", "docs/teams/operations/safety.md"],
  ["Operations: Shop and Tools", "docs/teams/operations/shop-tools.md"],
  ["Operations: Purchasing and Inventory", "docs/teams/operations/purchasing-inventory.md"],
  ["Operations: Competition Operations", "docs/teams/operations/competition-operations.md"],
  ["Subsystems", "docs/subsystems/README.md"],
  ["Processes", "docs/processes/README.md"],
  ["Project Management", "docs/project-management/README.md"],
  ["Testing and Validation", "docs/testing/README.md"],
  ["Competition", "docs/competition/README.md"],
  ["Handoffs", "docs/handoffs/README.md"],
];

const pageSelect = document.querySelector("#pageSelect");
const tokenInput = document.querySelector("#token");
const messageInput = document.querySelector("#message");
const markdownInput = document.querySelector("#markdown");
const preview = document.querySelector("#preview");
const statusEl = document.querySelector("#status");
const openPage = document.querySelector("#openPage");
const loadButton = document.querySelector("#loadPage");
const saveButton = document.querySelector("#savePage");
const clearTokenButton = document.querySelector("#clearToken");

let currentSha = "";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return output;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) html.push("</ul>");
    inList = false;
  };

  lines.forEach((line) => {
    if (!line.trim()) {
      closeList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      html.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
      return;
    }

    const bullet = line.match(/^\s*-\s+(.+)$/);
    if (bullet) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  });

  closeList();
  return html.join("\n");
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function getToken() {
  return tokenInput.value.trim() || sessionStorage.getItem("wikiGithubToken") || "";
}

function rememberToken() {
  const token = tokenInput.value.trim();
  if (token) sessionStorage.setItem("wikiGithubToken", token);
}

function decodeBase64(content) {
  const binary = atob(content.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(content) {
  const bytes = new TextEncoder().encode(content);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function githubRequest(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error("Paste a GitHub token before loading or saving.");

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `GitHub request failed with ${response.status}`);
  }
  return data;
}

async function loadSelectedPage() {
  const path = pageSelect.value;
  rememberToken();
  setStatus(`Loading ${path}...`);
  const data = await githubRequest(`${path}?ref=${branch}`);
  currentSha = data.sha;
  markdownInput.value = decodeBase64(data.content);
  preview.innerHTML = markdownToHtml(markdownInput.value);
  openPage.href = `index.html#/${path}`;
  setStatus(`Loaded ${path}`, "success");
}

async function saveSelectedPage() {
  const path = pageSelect.value;
  const message = messageInput.value.trim() || `Update ${path}`;
  if (!currentSha) throw new Error("Load the page before saving so GitHub can check for conflicts.");

  rememberToken();
  setStatus(`Saving ${path}...`);
  try {
    const data = await githubRequest(path, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: encodeBase64(markdownInput.value),
        sha: currentSha,
        branch,
      }),
    });
    currentSha = data.content.sha;
    setStatus(`Saved ${path}. GitHub Pages may take a minute to update.`, "success");
  } catch (error) {
    if (error.message.includes("does not match")) {
      const latest = await githubRequest(`${path}?ref=${branch}`);
      currentSha = latest.sha;
      throw new Error(
        "GitHub has a newer version of this page. Your edits are still here. Review them, then click Save to GitHub again if you want to overwrite the latest version."
      );
    }
    throw error;
  }
}

editablePages.forEach(([label, path]) => {
  const option = document.createElement("option");
  option.value = path;
  option.textContent = label;
  pageSelect.appendChild(option);
});

const initialPath = new URLSearchParams(location.search).get("path");
if (initialPath && editablePages.some(([, path]) => path === initialPath)) {
  pageSelect.value = initialPath;
}

tokenInput.value = sessionStorage.getItem("wikiGithubToken") || "";
openPage.href = `index.html#/${pageSelect.value}`;

markdownInput.addEventListener("input", () => {
  preview.innerHTML = markdownToHtml(markdownInput.value);
});

pageSelect.addEventListener("change", () => {
  currentSha = "";
  markdownInput.value = "";
  preview.innerHTML = "";
  openPage.href = `index.html#/${pageSelect.value}`;
  setStatus("Page changed. Load it before editing.");
});

loadButton.addEventListener("click", async () => {
  try {
    await loadSelectedPage();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

saveButton.addEventListener("click", async () => {
  try {
    await saveSelectedPage();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

clearTokenButton.addEventListener("click", () => {
  sessionStorage.removeItem("wikiGithubToken");
  tokenInput.value = "";
  setStatus("Token cleared from this browser session.");
});
