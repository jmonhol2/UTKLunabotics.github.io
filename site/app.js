const pages = [
  {
    group: "Start Here",
    items: [
      ["How to Use This Wiki", "docs/start-here/how-to-use-this-wiki.md"],
      ["Project Cycle Overview", "docs/start-here/project-cycle-overview.md"],
      ["Roles and Ownership", "docs/start-here/roles-and-ownership.md"],
    ],
  },
  {
    group: "Leadership",
    items: [
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
    ],
  },
  {
    group: "Teams",
    items: [
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
    ],
  },
  {
    group: "Wiki Sections",
    items: [
      ["Subsystems", "docs/subsystems/README.md"],
      ["Processes", "docs/processes/README.md"],
      ["Project Management", "docs/project-management/README.md"],
      ["Testing and Validation", "docs/testing/README.md"],
      ["Competition", "docs/competition/README.md"],
      ["Handoffs", "docs/handoffs/README.md"],
      ["Current Year Handoff", "docs/handoffs/current-year-handoff.md"],
    ],
  },
  {
    group: "Templates",
    items: [
      ["Templates Overview", "templates/README.md"],
      ["Leadership Role Template", "templates/leadership-role.md"],
      ["Team Page Template", "templates/team-page.md"],
      ["Subteam Page Template", "templates/subteam-page.md"],
      ["Subsystem Page Template", "templates/subsystem-page.md"],
      ["Process Page Template", "templates/process-page.md"],
      ["Role Handoff Template", "templates/role-handoff.md"],
      ["Decision Record Template", "templates/decision-record.md"],
      ["Test Report Template", "templates/test-report.md"],
      ["Meeting Notes Template", "templates/meeting-notes.md"],
    ],
  },
];

const nav = document.querySelector("#nav");
const search = document.querySelector("#search");
const home = document.querySelector("#home");
const page = document.querySelector("#page");
const pageContent = document.querySelector("#pageContent");
const sourceLink = document.querySelector("#sourceLink");
const copyPath = document.querySelector("#copyPath");
const repoEditBase = "https://github.com/jmonhol2/UTKLunabotics.github.io/edit/main/";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function renderNav(filter = "") {
  const query = filter.trim().toLowerCase();
  nav.innerHTML = "";

  pages.forEach((section) => {
    const matches = section.items.filter(([label, path]) => {
      return `${label} ${path} ${section.group}`.toLowerCase().includes(query);
    });

    if (!matches.length) return;

    const group = document.createElement("div");
    group.className = "nav-group";
    group.textContent = section.group;
    nav.appendChild(group);

    matches.forEach(([label, path]) => {
      const link = document.createElement("a");
      link.className = "nav-item";
      link.href = `#/${path}`;
      link.dataset.path = path;
      link.textContent = label;
      nav.appendChild(link);
    });
  });

  highlightActive();
}

function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const safeHref = resolveMarkdownHref(href);
    return `<a href="${escapeHtml(safeHref)}">${text}</a>`;
  });
  return output;
}

function resolveMarkdownHref(href) {
  if (/^https?:\/\//.test(href) || href.startsWith("#")) return href;
  if (href.endsWith(".md")) return `#/${normalizePath(href)}`;
  return href;
}

function normalizePath(path) {
  const current = getCurrentPath();
  if (!path.startsWith(".")) return path.replace(/^\//, "");

  const base = current.split("/").slice(0, -1);
  path.split("/").forEach((part) => {
    if (part === "." || part === "") return;
    if (part === "..") base.pop();
    else base.push(part);
  });
  return base.join("/");
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inList = false;
  let inOrderedList = false;
  let inCode = false;
  let inTable = false;

  const closeLists = () => {
    if (inList) html.push("</ul>");
    if (inOrderedList) html.push("</ol>");
    inList = false;
    inOrderedList = false;
  };

  const closeTable = () => {
    if (inTable) html.push("</tbody></table>");
    inTable = false;
  };

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      closeLists();
      closeTable();
      html.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
      return;
    }

    if (inCode) {
      html.push(escapeHtml(line));
      return;
    }

    if (!line.trim()) {
      closeLists();
      closeTable();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeLists();
      closeTable();
      const level = heading[1].length;
      const text = heading[2].trim();
      html.push(`<h${level} id="${slugify(text)}">${inlineMarkdown(text)}</h${level}>`);
      return;
    }

    const tableCells = line.trim().startsWith("|") && line.trim().endsWith("|")
      ? line.trim().slice(1, -1).split("|").map((cell) => cell.trim())
      : null;

    if (tableCells && tableCells.every((cell) => /^:?-{3,}:?$/.test(cell))) return;

    if (tableCells) {
      closeLists();
      if (!inTable) {
        html.push("<table><tbody>");
        inTable = true;
      }
      html.push(`<tr>${tableCells.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`);
      return;
    }

    closeTable();

    const bullet = line.match(/^\s*-\s+(.+)$/);
    if (bullet) {
      if (!inList) {
        closeLists();
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      return;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      if (!inOrderedList) {
        closeLists();
        html.push("<ol>");
        inOrderedList = true;
      }
      html.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      return;
    }

    closeLists();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  });

  closeLists();
  closeTable();
  return html.join("\n");
}

function getCurrentPath() {
  return decodeURIComponent(location.hash.replace(/^#\/?/, ""));
}

function highlightActive() {
  const active = getCurrentPath();
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.path === active);
  });
}

async function loadPage(path) {
  if (!path) {
    home.hidden = false;
    page.hidden = true;
    highlightActive();
    return;
  }

  home.hidden = true;
  page.hidden = false;
  pageContent.innerHTML = "<p>Loading page...</p>";
  sourceLink.href = `${repoEditBase}${path}`;

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path}`);
    const markdown = await response.text();
    pageContent.innerHTML = markdownToHtml(markdown);
  } catch (error) {
    pageContent.innerHTML = `<h1>Page Not Found</h1><p>${escapeHtml(error.message)}</p>`;
  }

  highlightActive();
  window.scrollTo({ top: 0, behavior: "instant" });
}

search.addEventListener("input", () => renderNav(search.value));

copyPath.addEventListener("click", async () => {
  const path = getCurrentPath();
  await navigator.clipboard.writeText(path);
  copyPath.textContent = "OK";
  setTimeout(() => {
    copyPath.textContent = "#";
  }, 1200);
});

window.addEventListener("hashchange", () => loadPage(getCurrentPath()));

renderNav();
loadPage(getCurrentPath());
