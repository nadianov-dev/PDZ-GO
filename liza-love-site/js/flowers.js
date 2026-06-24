const DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const MONTHS_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});

const flowers = await loadFlowers();
const sortedFlowers = [...flowers].sort(
  (a, b) => new Date(b.date) - new Date(a.date)
);

let currentFilter = "all";
let lightboxIndex = 0;

initPage();

async function loadFlowers() {
  const response = await fetch("./data/flowers.json");
  if (!response.ok) {
    throw new Error("Не удалось загрузить список букетов");
  }
  return response.json();
}

function initPage() {
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  renderStats();
  renderFeatured(sortedFlowers[0]);
  renderTimeline(getFilteredFlowers());
  bindFilters();
  bindLightbox();
}

function getFilteredFlowers() {
  if (currentFilter === "recent") {
    return sortedFlowers.slice(0, 6);
  }
  return sortedFlowers;
}

function renderStats() {
  const count = sortedFlowers.length;
  const firstDate = sortedFlowers[sortedFlowers.length - 1]?.date;
  const latestDate = sortedFlowers[0]?.date;

  const weeks =
    firstDate && latestDate
      ? Math.max(
          1,
          Math.round(
            (new Date(latestDate) - new Date(firstDate)) / (7 * 24 * 60 * 60 * 1000)
          )
        )
      : 0;

  document.getElementById("stat-count").textContent = String(count);
  document.getElementById("stat-weeks").textContent = String(weeks);
  document.getElementById("stat-latest").textContent = latestDate
    ? MONTHS_FORMAT.format(new Date(latestDate))
    : "—";
}

function renderFeatured(flower) {
  if (!flower) return;

  const image = document.getElementById("featured-image");
  image.src = flower.image;
  image.alt = flower.title;
  image.onerror = () => applyFallback(image, flower.title);

  document.getElementById("featured-date").textContent = DATE_FORMAT.format(
    new Date(flower.date)
  );
  document.getElementById("featured-title").textContent = flower.title;
  document.getElementById("featured-caption").textContent = flower.caption;

  document.getElementById("featured-open").onclick = () => {
    openLightbox(sortedFlowers.findIndex((item) => item.id === flower.id));
  };
}

function renderTimeline(items) {
  const timeline = document.getElementById("flower-timeline");
  timeline.innerHTML = items
    .map(
      (flower, index) => `
        <article class="flower-card">
          <button type="button" data-index="${index}" aria-label="Открыть: ${flower.title}">
            <div class="flower-card-inner">
              <div class="flower-card-image-wrap">
                <img
                  class="flower-card-image"
                  src="${flower.image}"
                  alt="${flower.title}"
                  loading="lazy"
                  data-title="${escapeHtml(flower.title)}"
                >
              </div>
              <div class="flower-card-body">
                <time class="flower-card-date">${DATE_FORMAT.format(new Date(flower.date))}</time>
                <h3 class="flower-card-title">${flower.title}</h3>
                <p class="flower-card-caption">${flower.caption}</p>
              </div>
            </div>
          </button>
        </article>
      `
    )
    .join("");

  timeline.querySelectorAll(".flower-card-image").forEach((img) => {
    img.onerror = () => applyFallback(img, img.dataset.title);
  });

  timeline.querySelectorAll("button[data-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const flower = items[index];
      const globalIndex = sortedFlowers.findIndex((item) => item.id === flower.id);
      openLightbox(globalIndex);
    });
  });
}

function bindFilters() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.toggle("is-active", btn === button);
      });
      renderTimeline(getFilteredFlowers());
    });
  });
}

function bindLightbox() {
  const lightbox = document.getElementById("lightbox");

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });
}

function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  document.getElementById("lightbox").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
  document.body.style.overflow = "";
}

function stepLightbox(direction) {
  lightboxIndex = (lightboxIndex + direction + sortedFlowers.length) % sortedFlowers.length;
  updateLightbox();
}

function updateLightbox() {
  const flower = sortedFlowers[lightboxIndex];
  const image = document.getElementById("lightbox-image");

  image.src = flower.image;
  image.alt = flower.title;
  image.onerror = () => applyFallback(image, flower.title);

  document.getElementById("lightbox-date").textContent = DATE_FORMAT.format(
    new Date(flower.date)
  );
  document.getElementById("lightbox-title").textContent = flower.title;
  document.getElementById("lightbox-caption").textContent = flower.caption;
  document.getElementById("lightbox-counter").textContent = `${
    lightboxIndex + 1
  } из ${sortedFlowers.length}`;
}

function applyFallback(image, title) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3d9de"/>
          <stop offset="100%" stop-color="#f6f0ea"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1500" fill="url(#g)"/>
      <text x="600" y="720" text-anchor="middle" fill="#9e3d4f" font-size="72" font-family="Georgia, serif">${escapeSvg(
        title
      )}</text>
      <text x="600" y="810" text-anchor="middle" fill="#6f5f5a" font-size="34" font-family="Arial, sans-serif">добавь фото в images/flowers</text>
    </svg>
  `.trim();

  image.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeSvg(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
