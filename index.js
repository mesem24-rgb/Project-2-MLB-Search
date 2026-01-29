/******************************************************
 * API CONFIGURATION
 * ----------------------------------------------------
 * Base URL and API key for balldontlie MLB endpoints
 ******************************************************/
const API_BASE = "https://api.balldontlie.io";
const API_KEY = "e838c38b-4333-40f8-aa9e-58395d9df2e7";

/******************************************************
 * BURGER MENU TOGGLE (MOBILE NAV)
 * ----------------------------------------------------
 * Handles opening/closing the hamburger menu
 * Only runs if the menu exists on the page
 ******************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  // Exit early if this page doesn't use the menu
  if (!menuBtn || !navLinks) return;

  // Toggle menu open/close
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
});

/******************************************************
 * DOM ELEMENT REFERENCES
 * ----------------------------------------------------
 * Cache frequently-used elements to avoid repeated
 * DOM queries and improve readability
 ******************************************************/
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const errorDiv = document.getElementById("error");
const loader = document.getElementById("loader");

const filterWrapper = document.getElementById("filter");
const searchQuerySpan = document.getElementById("searchQuery");

// Filter / control elements
const limitSlider = document.getElementById("limitSlider");
const limitValue = document.getElementById("limitValue");
const sortToggle = document.getElementById("sortToggle");

/******************************************************
 * APPLICATION STATE
 * ----------------------------------------------------
 * Stores data and UI state that needs to persist
 * across renders and user interactions
 ******************************************************/
let lastResults = [];        // Most recent API response
let sortDirection = "asc";  // "asc" (A–Z) or "desc" (Z–A)

/******************************************************
 * EVENT LISTENERS
 * ----------------------------------------------------
 * All user-driven interactions
 ******************************************************/

// Trigger search on button click
searchBtn.addEventListener("click", searchPlayers);

// Trigger search when pressing Enter in input
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchPlayers();
});

// Update result limit dynamically via slider
limitSlider.addEventListener("input", () => {
  limitValue.textContent = limitSlider.value;

  // Re-render results using the new limit
  if (lastResults.length > 0) renderResults(lastResults);
});

// Toggle alphabetical sort direction (A–Z / Z–A)
sortToggle.addEventListener("click", () => {
  sortDirection = sortDirection === "asc" ? "desc" : "asc";

  // Update button UI
  sortToggle.textContent =
    sortDirection === "asc" ? "A → Z" : "Z → A";

  sortToggle.classList.toggle("active", sortDirection === "desc");
  sortToggle.setAttribute(
    "aria-pressed",
    sortDirection === "desc"
  );

  // Re-render with new sort order
  if (lastResults.length > 0) {
    renderResults(lastResults);
  }
});

/******************************************************
 * SEARCH FUNCTION
 * ----------------------------------------------------
 * Fetches player data from the API based on
 * user search input
 ******************************************************/
async function searchPlayers() {
  const query = searchInput.value.trim();
  if (!query) return;

  // Display the current search query in the UI
  if (searchQuerySpan) {
    searchQuerySpan.textContent = `"${query}"`;
  }

  // Reset UI state before fetching
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

    // Handle empty results
    if (!data.data || data.data.length === 0) {
      resultsDiv.innerHTML = "<p>No players found.</p>";
      lastResults = [];
      return;
    }

    // Save results and reveal filters
    lastResults = data.data;
    filterWrapper?.classList.add("show");

    // Render initial results
    renderResults(lastResults);

  } catch (err) {
    console.error(err);
    errorDiv.textContent = "Error fetching data. Check API key and endpoint.";
    lastResults = [];
  } finally {
    loader.classList.add("hidden");
  }
}

/******************************************************
 * RENDER FUNCTION
 * ----------------------------------------------------
 * Sorts, limits, and displays player cards
 ******************************************************/
function renderResults(players) {
  resultsDiv.classList.remove("show");
  resultsDiv.innerHTML = "";

  // Number of results to display (slider-controlled)
  const limit = Number(limitSlider.value);
  if (limit === 0) return;

  // Sort players by full name (Last, First)
  const sortedPlayers = [...players].sort((a, b) => {
    const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
    const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();

    return sortDirection === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  // Create and append player cards
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

  // Trigger CSS fade-in animation after DOM update
  requestAnimationFrame(() => {
    resultsDiv.classList.add("show");
  });
}

/******************************************************
 * INITIAL SEARCH FROM URL PARAMS
 * ----------------------------------------------------
 * Allows direct linking to searches:
 * example: ?q=judge
 ******************************************************/
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q");

if (initialQuery) {
  searchInput.value = initialQuery;
  searchPlayers();
}

/******************************************************
 * PAGE FADE TRANSITIONS
 * ----------------------------------------------------
 * Smooth fade-in on load and fade-out on navigation
 ******************************************************/
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");

  // Allow mailto, tel, external, and anchor links
  if (
    !href ||
    href.startsWith("http") ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return;
  }

  e.preventDefault();
  document.body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = href;
  }, 400);
});


