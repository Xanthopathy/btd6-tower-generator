import "./style.css";
import faviconDataUrl from "./assets/icon_32px_favicon.png?inline";
import { LEGAL_CROSSPATHS, TOWER_CATEGORIES, TOWERS } from "./crosspaths.js";
import { createDualRange } from "./dual-range.js";

document.querySelector('link[rel="icon"]').href = faviconDataUrl;

const getElement = (id) => document.getElementById(id);
let currentTower = null;
let history = [];
const enabledTowers = new Set(TOWERS);
const towerCheckboxes = new Map();
const categoryCheckboxes = [];

const mainRange = createDualRange(getElement("main"), 0, 5, 0, 5, update);
const secondaryRange = createDualRange(getElement("sec"), 0, 2, 0, 2, update);

function getCrosspathPool() {
  return LEGAL_CROSSPATHS.filter((tiers) => {
    const sortedTiers = tiers.slice().sort((left, right) => right - left);
    if (sortedTiers[0] < mainRange.low || sortedTiers[0] > mainRange.high)
      return false;
    if (
      sortedTiers[1] < secondaryRange.low ||
      sortedTiers[1] > secondaryRange.high
    )
      return false;
    return true;
  });
}

function setTowerEnabled(tower, enabled) {
  if (enabled) enabledTowers.add(tower);
  else enabledTowers.delete(tower);
  towerCheckboxes.get(tower).checked = enabled;
}

function syncCategoryCheckboxes() {
  for (const { box, towers } of categoryCheckboxes) {
    const enabledCount = towers.filter((tower) => enabledTowers.has(tower)).length;
    box.checked = enabledCount === towers.length;
    box.indeterminate = enabledCount > 0 && enabledCount < towers.length;
  }
}

function renderTowers() {
  getElement("towers").replaceChildren(
    ...TOWER_CATEGORIES.map((category) => {
      const group = document.createElement("div");
      group.className = "group";

      const header = document.createElement("div");
      header.className = "ghd";
      const nameLabel = document.createElement("label");
      const categoryBox = document.createElement("input");
      categoryBox.type = "checkbox";
      nameLabel.append(categoryBox, category.name);

      const caret = document.createElement("button");
      caret.type = "button";
      caret.className = "caret";
      caret.setAttribute("aria-expanded", "false");
      caret.setAttribute("aria-label", "Show " + category.name + " towers");
      header.addEventListener("click", (event) => {
        if (event.target.closest("label")) return;
        const expanded = caret.getAttribute("aria-expanded") !== "true";
        caret.setAttribute("aria-expanded", String(expanded));
        chips.hidden = !expanded;
      });
      header.append(nameLabel, caret);

      const chips = document.createElement("div");
      chips.className = "chips";
      chips.hidden = true;
      for (const tower of category.towers) {
        const label = document.createElement("label");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = enabledTowers.has(tower);
        box.addEventListener("change", () => {
          setTowerEnabled(tower, box.checked);
          syncCategoryCheckboxes();
          update();
        });
        towerCheckboxes.set(tower, box);
        label.append(box, tower);
        chips.append(label);
      }

      categoryBox.addEventListener("change", () => {
        for (const tower of category.towers)
          setTowerEnabled(tower, categoryBox.checked);
        syncCategoryCheckboxes();
        update();
      });
      categoryCheckboxes.push({ box: categoryBox, towers: category.towers });

      group.append(header, chips);
      return group;
    }),
  );
  syncCategoryCheckboxes();
}

function getStatusError() {
  if (!enabledTowers.size) return "Enable at least one tower.";
  if (!getCrosspathPool().length)
    return "No crosspath fits both ranges. Widen the secondary range or lower the highest-tier minimum.";
  return "";
}

function update() {
  getElement("mainOut").textContent = mainRange.low + " - " + mainRange.high;
  getElement("secOut").textContent =
    secondaryRange.low + " - " + secondaryRange.high;

  const note = getElement("note");
  const error = getStatusError();
  if (error) {
    note.className = "err";
    note.textContent = error;
    return;
  }

  const count = getCrosspathPool().length;
  note.className = "";
  note.textContent =
    count +
    " legal crosspath" +
    (count === 1 ? " matches" : "s match") +
    " these ranges.";
}

function roll() {
  if (getStatusError()) return;

  const towers = TOWERS.filter((tower) => enabledTowers.has(tower));
  const keepTower =
    getElement("lock").checked && enabledTowers.has(currentTower);
  const tower = keepTower
    ? currentTower
    : towers[Math.floor(Math.random() * towers.length)];
  const pool = getCrosspathPool();
  const tiers = pool[Math.floor(Math.random() * pool.length)];
  const path = tiers.join("-");

  currentTower = tower;
  getElement("tower").textContent = tower;
  getElement("path").textContent = path;

  history = [tower + " " + path, ...history].slice(0, 8);
  const historyElement = getElement("hist");
  historyElement.replaceChildren(
    ...history.map((entry) => {
      const row = document.createElement("div");
      row.className = "row";
      row.textContent = entry;
      return row;
    }),
  );
}

getElement("roll").addEventListener("click", roll);
renderTowers();
update();
