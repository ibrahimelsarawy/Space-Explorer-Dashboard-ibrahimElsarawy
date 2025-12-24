// ============================================
//  NASA API KEY
// ============================================
let planetsMap = {};

const apiKey = "bU7WaOFtMVnWeJGvbySkFHQt5WestD49c69xOgQa";

// ============================================
//   ---------- APOD SECTION ----------
// ============================================
async function loadTodayAPOD() {
  try {
    const today = new Date();
    let attempts = 0;
    let data = null;

    while (attempts < 3) {
      const dateStr = today.toISOString().split("T")[0];

      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${dateStr}`
      );

      data = await res.json();

      if (data.media_type === "image") break;

      today.setDate(today.getDate() - 1);
      attempts++;
    }

    renderAPOD(data);
  } catch (e) {
    console.error("APOD Error", e);
  }
}
function formatDateToUI(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function renderAPOD(data) {
  const formattedDate = formatDateToUI(data.date);
  document.getElementById(
    "apod-date"
  ).textContent = `Astronomy Picture of the Day - ${formattedDate}`;
  document.getElementById("apod-image").src =
    data.media_type === "image" ? data.url : "/assets/images/placeholder.webp";
  document.getElementById("apod-title").textContent = data.title;
  document.getElementById("apod-date-detail").textContent = formattedDate;
  document.getElementById("apod-date-info").textContent = formattedDate;
  document.getElementById("apod-explanation").textContent = data.explanation;
  document.getElementById("apod-media-type").textContent =
    data.media_type || "invalid";
  document.getElementById("apod-copyright").textContent =
    data.copyright || "NASA Public Domain";
}

// Load APOD from NASA:
async function loadAPOD(date = null) {
  try {
    const url = date
      ? `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`
      : `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    renderAPOD(data);
  } catch (err) {
    console.log("APOD Error:", err);
  }
}

// Set date input default to today
const today = new Date().toISOString().split("T")[0];

document.getElementById("apod-date-input").value = today;
document.getElementById("apod-date-input").max = today;

document.getElementById("selected-date-text").textContent =
  formatDateToUI(today);

// Initial load
loadTodayAPOD();


document
  .getElementById("apod-date-input")
  .addEventListener("change", function () {
    if (!this.value) {
      document.getElementById("selected-date-text").textContent = "";
      return;
    }

    document.getElementById("selected-date-text").textContent = formatDateToUI(
      this.value
    );
  });

// Load btn 
document.getElementById("load-date-btn").addEventListener("click", () => {
  const selected = document.getElementById("apod-date-input").value;
  if (!selected) return;

  loadAPOD(selected);
});

// Today btn:
document.getElementById("today-apod-btn").addEventListener("click", () => {
  document.getElementById("apod-date-input").value = today;
  document.getElementById("selected-date-text").textContent =
    formatDateToUI(today);
  loadAPOD();
});

// ============================================
//  ---------- PLANETS SECTION ----------
// ============================================
const planetColors = {
  mercury: "#6b7280",
  venus: "#fb923c",
  earth: "#3b82f6",
  mars: "#ef4444",
  jupiter: "#fdba74",
  saturn: "#fde047",
  uranus: "#22d3ee",
  neptune: "#2563eb",
};

const planetTypes = {
  mercury: { label: "Terrestrial", bg: "#f9731680", color: "#fb923c" },
  venus: { label: "Terrestrial", bg: "#f9731680", color: "#fb923c" },
  earth: { label: "Terrestrial", bg: "#3b82f680", color: "#60a5fa" },
  mars: { label: "Terrestrial", bg: "#f9731680", color: "#fb923c" },
  jupiter: { label: "Gas Giant", bg: "#a855f780", color: "#c084fc" },
  saturn: { label: "Gas Giant", bg: "#a855f780", color: "#c084fc" },
  uranus: { label: "Ice Giant", bg: "#3b82f680", color: "#60a5fa" },
  neptune: { label: "Ice Giant", bg: "#3b82f680", color: "#60a5fa" },
};

async function loadPlanets() {
  try {
    const res = await fetch(
      "https://solar-system-opendata-proxy.vercel.app/api/planets"
    );
    const data = await res.json();

    const planets = data.bodies.filter((b) => b.isPlanet);

    for (const p of planets) {
  planetsMap[p.englishName.toLowerCase()] = p;
}


    document.getElementById("planet-comparison-tbody").innerHTML = planets
      .map((p) => {
        const id = p.englishName.toLowerCase();
        const color = planetColors[id] || "#64748b";
        const type = planetTypes[id] || {
          label: p.bodyType,
          bg: "#64748b80",
          color: "#e5e7eb",
        };

        return `
        <tr class="hover:bg-slate-800/30 transition-colors cursor-pointer"
            data-planet="${id}">

          <!-- Planet -->
          <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
            <div class="flex items-center space-x-2 md:space-x-3">
              <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                   style="background-color:${color}"></div>
              <span class="font-semibold text-sm md:text-base whitespace-nowrap">
                ${p.englishName}
              </span>
            </div>
          </td>

          <!-- Distance -->
          <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 whitespace-nowrap">
            ${(p.semimajorAxis / 149597870).toFixed(2)}
          </td>

          <!-- Diameter -->
          <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 whitespace-nowrap">
            ${(p.meanRadius * 2).toLocaleString()}
          </td>

          <!-- Mass -->
          <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 whitespace-nowrap">
            ${p.mass.massValue.toFixed(3)}
          </td>

          <!-- Orbital Period -->
          <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 whitespace-nowrap">
            ${p.sideralOrbit} days
          </td>

          <!-- Moons -->
          <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 whitespace-nowrap">
            ${p.moons?.length ?? 0}
          </td>

          <!-- Type -->
          <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
            <span class="px-2 py-1 rounded text-xs"
                  style="background-color:${type.bg}; color:${type.color}">
              ${type.label}
            </span>
          </td>

        </tr>`;
      })
      .join("");

    attachPlanetClicks();
    attachPlanetCardClicks();
    updatePlanetDetailsFromAPI("earth");
  } catch (err) {
    console.error("Planet Error:", err);
  }
}

loadPlanets();

function calculateVolumeKm3(radiusKm) {
  const volume = (4 / 3) * Math.PI * Math.pow(radiusKm, 3);
  return volume.toExponential(3) + " km³";
}

function escapeVelocity(massKg, radiusKm) {
  const G = 6.674e-11;
  const r = radiusKm * 1000;
  return Math.sqrt((2 * G * massKg) / r) / 1000;
}

function updatePlanetDetailsFromAPI(id) {
  const p = planetsMap[id];
  if (!p) return;

  // Basic Info
  document.getElementById("planet-detail-name").textContent = p.englishName;

  document.getElementById(
    "planet-detail-image"
  ).src = `/assets/images/${id}.png`;

  document.getElementById(
    "planet-detail-description"
  ).textContent = `${p.englishName} is a ${p.bodyType}. Surface gravity is ${p.gravity} m/s².`;

  // Main Stats
  document.getElementById("planet-distance").textContent =
    (p.semimajorAxis / 1e6).toFixed(1) + "M km";

  document.getElementById("planet-radius").textContent =
    p.meanRadius.toLocaleString() + " km";

  document.getElementById(
    "planet-mass"
  ).textContent = `${p.mass.massValue} × 10^${p.mass.massExponent} kg`;

  document.getElementById("planet-density").textContent = p.density + " g/cm³";

  document.getElementById("planet-orbital-period").textContent =
    p.sideralOrbit + " days";

  document.getElementById("planet-rotation").textContent =
    p.sideralRotation + " hours";

  document.getElementById("planet-moons").textContent = p.moons?.length ?? 0;

  document.getElementById("planet-gravity").textContent = p.gravity + " m/s²";


  // Discovery Info
  document.getElementById("planet-discoverer").textContent =
    p.discoveredBy || "Known since antiquity";

  document.getElementById("planet-discovery-date").textContent =
    p.discoveryDate || "Ancient";

  document.getElementById("planet-body-type").textContent =
    p.bodyType || "Planet";

  document.getElementById("planet-volume").textContent = calculateVolumeKm3(
    p.meanRadius
  );

  // Quick Facts
  document.getElementById("planet-facts").innerHTML = `
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span>Mass: ${p.mass.massValue} × 10^${p.mass.massExponent} kg</span>
    </li>
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span>Surface gravity: ${p.gravity} m/s²</span>
    </li>
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span>Density: ${p.density} g/cm³</span>
    </li>
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span>Axial tilt: ${p.axialTilt ?? "N/A"}°</span>
    </li>
  `;

  // Orbital Characteristics
  document.getElementById("planet-perihelion").textContent =
    (p.perihelion / 1e6).toFixed(1) + "M km";

  document.getElementById("planet-aphelion").textContent =
    (p.aphelion / 1e6).toFixed(1) + "M km";

  document.getElementById("planet-eccentricity").textContent = p.eccentricity;

  document.getElementById("planet-inclination").textContent =
    p.inclination + "°";

  document.getElementById("planet-axial-tilt").textContent =
    (p.axialTilt ?? "N/A") + "°";

  document.getElementById("planet-temp").textContent =
    (p.avgTemp ?? "N/A") + "°C";

  document.getElementById("planet-escape").textContent =
    escapeVelocity(
      p.mass.massValue * Math.pow(10, p.mass.massExponent),
      p.meanRadius
    ).toFixed(2) + " km/s";
}

function attachPlanetClicks() {
  const rows = document.querySelectorAll("[data-planet]");

  for (let i = 0; i < rows.length; i++) {
    rows[i].addEventListener("click", function () {
      updatePlanetDetailsFromAPI(this.dataset.planet);
    });
  }
}
function attachPlanetCardClicks() {
  const cards = document.querySelectorAll(".planet-card");

  for (let i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", function () {
      updatePlanetDetailsFromAPI(this.dataset.planetId);
    });
  }
}

//  ---------- LAUNCHES SECTION ----------

async function loadFeaturedLaunch() {
  const DEFAULT_LAUNCH_IMAGE = "assets/images/launch-placeholder.png";

  const res = await fetch(
    "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=1"
  );

  const data = await res.json();
  const f = data.results[0];

  const launchDate = new Date(f.net);

  const image = f.image?.image_url || DEFAULT_LAUNCH_IMAGE;

  const description =
    f.mission?.description || "No mission description available at this time.";

  document.getElementById("featured-launch").innerHTML = `

    <div class="relative mb-4 bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">

      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">

        <div class="flex flex-col justify-between">

          <div>

            <div class="flex items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star"></i>
                Featured Launch
              </span>

              <span class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                ${f.status?.name || "TBD"}
              </span>
            </div>

            <h3 class="text-3xl font-bold mb-3 leading-tight">
              ${f.name}
            </h3>


            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${
                  f.launch_service_provider?.name || "Unknown Provider"
                }</span>
              </div>

              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${
                  f.rocket?.configuration?.name || "Unknown Rocket"
                }</span>
              </div>
            </div>

            <div class="grid xl:grid-cols-2 gap-4 mb-6">

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-calendar"></i>
                  Launch Date
                </p>
                <p class="font-semibold">
                  ${launchDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-clock"></i>
                  Launch Time
                </p>
                <p class="font-semibold">
                  ${launchDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })} UTC
                </p>
              </div>

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-map-marker-alt"></i>
                  Location
                </p>
                <p class="font-semibold text-sm">
                  ${f.pad?.location?.name || "Unknown"}
                </p>
              </div>

              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-globe"></i>
                  Country
                </p>
                <p class="font-semibold text-sm">
                  ${f.pad?.country?.name || "Unknown"}
                </p>
              </div>

              
       
            </div>

          </div>
   <div class="w-full mt-2 mb-6">
            <p class="text-slate-300 leading-relaxed line-clamp-4 w-full">
              ${description}
            </p>
          </div>
           <div class="flex items-center gap-3 mt-auto">
   <button
  class="flex-1 px-6 py-3 rounded-xl font-semibold
         bg-blue-500
         hover:bg-blue-600
         hover:shadow-lg hover:shadow-blue-500/30
         hover:-translate-y-0.5
         active:translate-y-0
         transition-all duration-200
         flex items-center justify-center gap-2">
  <i class="fas fa-info-circle"></i>
  View Full Details
</button>

      <div class="flex gap-2">
     <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <i class="far fa-heart"></i>
              </button>

              <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <i class="fas fa-bell"></i>
              </button>
      </div>
    </div>

        </div>

        <div class="relative">
          <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
            <img
              src="${image}"
              alt="${f.name}"
              onerror="this.src='${DEFAULT_LAUNCH_IMAGE}'"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>

    </div>
  `;
}

async function loadLaunchesGrid() {
  const DEFAULT_LAUNCH_IMAGE = "assets/images/launch-placeholder.png";

  const res = await fetch(
    "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=12"
  );
  const data = await res.json();

  document.getElementById("launches-grid").innerHTML = data.results
    .map((l) => {
      const date = new Date(l.net);

      const image = l.image?.image_url || DEFAULT_LAUNCH_IMAGE;

      return `
        <div
          class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">

          <div class="relative h-48 bg-slate-900/50 flex items-center justify-center">
            <img 
              src="${image}"
              alt="${l.name}"
              onerror="this.src='${DEFAULT_LAUNCH_IMAGE}'"
              class="w-full h-full object-cover"
            />

            <div class="absolute top-3 right-3">
              <span class="px-3 py-1 bg-green-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
                ${l.status?.name || "Unknown"}
              </span>
            </div>
          </div>

          <div class="p-5">

            <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
              ${l.name}
            </h4>

            <p class="text-sm text-slate-400 flex items-center gap-2">
              <i class="fas fa-building text-xs"></i>
              ${l.launch_service_provider?.name || "Unknown Provider"}
            </p>

            <div class="space-y-2 mb-4">

              <div class="flex items-center gap-2 text-sm">
                <i class="fas fa-calendar text-slate-500 w-4"></i>
                <span class="text-slate-300">
                  ${date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div class="flex items-center gap-2 text-sm">
                <i class="fas fa-clock text-slate-500 w-4"></i>
                <span class="text-slate-300">
                  ${
                    date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }) + " UTC"
                  }
                </span>
              </div>

              <div class="flex items-center gap-2 text-sm">
                <i class="fas fa-rocket text-slate-500 w-4"></i>
                <span class="text-slate-300">
                  ${l.rocket?.configuration?.name || "Unknown Rocket"}
                </span>
              </div>

              <div class="flex items-center gap-2 text-sm">
                <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
                <span class="text-slate-300 line-clamp-1">
                  ${l.pad?.location?.name || "Unknown Location"}
                </span>
              </div>

            </div>

            <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
              <button
                class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
                Details
              </button>

              <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <i class="far fa-heart"></i>
              </button>
            </div>

          </div>
        </div>
      `;
    })
    .join("");
}

document
  .querySelector('[data-section="launches"]')
  .addEventListener("click", async () => {
    const loader = document.getElementById("launches-loading");
    const content = document.getElementById("launches-content");

    loader.classList.remove("hidden");
    content.classList.add("hidden");

    try {
      await loadFeaturedLaunch();
      await loadLaunchesGrid();
    } finally {
      loader.classList.add("hidden");
      content.classList.remove("hidden");
    }
  });


  
//     Nav
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");
for (let i = 0; i < navLinks.length; i++) {
  navLinks[i].addEventListener("click", function () {

    for (let j = 0; j < navLinks.length; j++) {
      navLinks[j].classList.remove("bg-blue-500/10", "text-blue-400");
    }

    this.classList.add("bg-blue-500/10", "text-blue-400");

    for (let k = 0; k < sections.length; k++) {
      sections[k].classList.add("hidden");
    }

    const sectionId = this.getAttribute("data-section");
    document.getElementById(sectionId).classList.remove("hidden");
  });
}

