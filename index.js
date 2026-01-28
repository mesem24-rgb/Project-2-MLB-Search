const API_BASE = "https://api.balldontlie.io"
const API_KEY = "e838c38b-4333-40f8-aa9e-58395d9df2e7"; // Replace with your real key

// ==============================
// BURGER MENU TOGGLE
// ==============================
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Optional: hide menu when a link is clicked
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// ==============================
// SEARCH ELEMENTS
// ==============================
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const errorDiv = document.getElementById("error");
const loader = document.getElementById("loader");
const searchQuerySpan = document.getElementById("searchQuery");

// Slider elements
const limitSlider = document.getElementById("limitSlider");
const limitValue = document.getElementById("limitValue");

// ==============================
// STATE
// ==============================
let lastResults = [];

// ==============================
// EVENTS
// ==============================
// Search button
searchBtn.addEventListener("click", searchPlayers);

// Enter key on input
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchPlayers();
});

// Slider input
limitSlider.addEventListener("input", () => {
  limitValue.textContent = limitSlider.value;
  if (lastResults.length > 0) renderResults(lastResults);
});

// ==============================
// SEARCH FUNCTION
// ==============================
async function searchPlayers() {
  const query = searchInput.value.trim();
  if (!query) return;

  if (searchQuerySpan) searchQuerySpan.textContent = `"${query}"`;

  // Reset UI
  resultsDiv.innerHTML = "";
  errorDiv.textContent = "";

  // Show loader
  loader.classList.remove("hidden");

  try {
    const url = `${API_BASE}/mlb/v1/players?search=${encodeURIComponent(query)}&include=team`;

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

  players.slice(0, limit).forEach((player) => {
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

  // Trigger fade-in AFTER DOM paint
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
// FADE IN / OUT TRANSITIONS
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
    }, 400); // match CSS transition time
  }
});
