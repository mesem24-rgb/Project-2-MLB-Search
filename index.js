const API_BASE = "https://api.balldontlie.io";
const API_KEY = "e838c38b-4333-40f8-aa9e-58395d9df2e7";

// ==============================
// BURGER MENU TOGGLE
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
});

// ==============================
// ELEMENTS
// ==============================
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const errorDiv = document.getElementById("error");
const loader = document.getElementById("loader");

const filterWrapper = document.getElementById("filter");
const searchQuerySpan = document.getElementById("searchQuery");

// Controls
const limitSlider = document.getElementById("limitSlider");
const limitValue = document.getElementById("limitValue");
const sortToggle = document.getElementById("sortToggle");

// ==============================
// STATE
// ==============================
let lastResults = [];
let sortDirection = "asc"; // "asc" | "desc"

// ==============================
// EVENTS
// ==============================
searchBtn.addEventListener("click", searchPlayers);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchPlayers();
});

limitSlider.addEventListener("input", () => {
  limitValue.textContent = limitSlider.value;
  if (lastResults.length > 0) renderResults(lastResults);
});

sortToggle.addEventListener("click", () => {
  sortDirection = sortDirection === "asc" ? "desc" : "asc";

  sortToggle.textContent =
    sortDirection === "asc" ? "A → Z" : "Z → A";

  sortToggle.classList.toggle("active", sortDirection === "desc");
  sortToggle.setAttribute(
    "aria-pressed",
    sortDirection === "desc"
  );

  if (lastResults.length > 0) {
    renderResults(lastResults);
  }
});

// ==============================
// SEARCH FUNCTION
// ==============================
async function searchPlayers() {
  const query = searchInput.value.trim();
  if (!query) return;

  if (searchQuerySpan) {
    searchQuerySpan.textContent = `"${query}"`;
  }

  // Reset UI
  resultsDiv.innerHTML = "";
  errorDiv.textContent = "";
  filterWrapper?.classList.remove("show");
  loader.classList.remove("hidden");

  try {
    const url = `${API_BASE}/mlb/v1/players?search=${encodeURIComponent(
      query
    )}&include=team`;

    const response = await fetch(url, {
      headers: { Authorization: API_KEY },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      resultsDiv.innerHTML = "<p>No players found.</p>";
      lastResults = [];
      return;
    }

    lastResults = data.data;
    filterWrapper?.classList.add("show");
    renderResults(lastResults);

  } catch (err) {
    console.error(err);
    errorDiv.textContent = "Error fetching data. Check API key and endpoint.";
    lastResults = [];
  } finally {
    loader.classList.add("hidden");
  }
}

// ==============================
// RENDER FUNCTION
// ==============================
function renderResults(players) {
  resultsDiv.classList.remove("show");
  resultsDiv.innerHTML = "";

  const limit = Number(limitSlider.value);
  if (limit === 0) return;

  const sortedPlayers = [...players].sort((a, b) => {
    const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
    const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();

    return sortDirection === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  sortedPlayers.slice(0, limit).forEach(player => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${player.first_name} ${player.last_name}</h3>
      <p><strong>Team:</strong> ${player.team?.display_name || "N/A"}</p>
      <p><strong>Position:</strong> ${player.position || "N/A"}</p>
      <p><strong>Jersey:</strong> ${player.jersey || "N/A"}</p>
      <p><strong>Height:</strong> ${player.height || "N/A"}</p>
      <p><strong>Weight:</strong> ${player.weight || "N/A"}</p>
    `;

    resultsDiv.appendChild(card);
  });

  requestAnimationFrame(() => {
    resultsDiv.classList.add("show");
  });
}

// ==============================
// INITIAL QUERY FROM URL
// ==============================
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q");
if (initialQuery) {
  searchInput.value = initialQuery;
  searchPlayers();
}

// ==============================
// PAGE FADE TRANSITIONS
// ==============================
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (href && !href.startsWith("http") && !href.startsWith("#")) {
    e.preventDefault();
    document.body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = href;
    }, 400);
  }
});

