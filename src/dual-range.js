export function createDualRange(
  element,
  min,
  max,
  initialLow,
  initialHigh,
  onChange,
) {
  const state = { low: initialLow, high: initialHigh };
  const percentage = (value) => ((value - min) / (max - min)) * 100;

  let ticks = "";
  for (let value = min; value <= max; value++) {
    ticks +=
      '<span class="tk" style="left:' +
      percentage(value) +
      '%">' +
      value +
      "</span>";
  }

  element.innerHTML =
    '<div class="rail"><div class="trk"><div class="fill"></div></div>' +
    '<div class="h" role="slider" tabindex="0" data-k="low" aria-label="Minimum" aria-valuemin="' +
    min +
    '" aria-valuemax="' +
    max +
    '"></div>' +
    '<div class="h" role="slider" tabindex="0" data-k="high" aria-label="Maximum" aria-valuemin="' +
    min +
    '" aria-valuemax="' +
    max +
    '"></div>' +
    ticks +
    "</div>";

  const rail = element.querySelector(".rail");
  const fill = element.querySelector(".fill");
  const handles = {
    low: element.querySelector('[data-k="low"]'),
    high: element.querySelector('[data-k="high"]'),
  };

  function render() {
    fill.style.left = percentage(state.low) + "%";
    fill.style.width = percentage(state.high) - percentage(state.low) + "%";

    for (const key of ["low", "high"]) {
      handles[key].style.left = percentage(state[key]) + "%";
      handles[key].setAttribute("aria-valuenow", state[key]);
    }
  }

  function set(key, value) {
    value = Math.max(min, Math.min(max, value));
    value =
      key === "low" ? Math.min(value, state.high) : Math.max(value, state.low);
    if (state[key] === value) return;

    state[key] = value;
    render();
    onChange(state);
  }

  function valueAt(clientX) {
    const bounds = rail.getBoundingClientRect();
    return Math.round(
      min + ((clientX - bounds.left) / bounds.width) * (max - min),
    );
  }

  let activeHandle = null;

  rail.addEventListener("pointerdown", (event) => {
    rail.setPointerCapture(event.pointerId);
    const value = valueAt(event.clientX);

    if (value <= state.low && state.low !== state.high) activeHandle = "low";
    else if (value >= state.high && state.low !== state.high)
      activeHandle = "high";
    else if (state.low === state.high) {
      activeHandle =
        value < state.low ? "low" : value > state.high ? "high" : "tie";
    } else {
      activeHandle =
        Math.abs(value - state.low) <= Math.abs(value - state.high)
          ? "low"
          : "high";
    }

    if (activeHandle !== "tie") set(activeHandle, value);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!activeHandle) return;

    const value = valueAt(event.clientX);
    if (activeHandle === "tie") {
      if (value < state.low) activeHandle = "low";
      else if (value > state.high) activeHandle = "high";
      else return;
    }

    set(activeHandle, value);
  });

  const stopDragging = () => {
    activeHandle = null;
  };
  rail.addEventListener("pointerup", stopDragging);
  rail.addEventListener("pointercancel", stopDragging);

  for (const key of ["low", "high"]) {
    handles[key].addEventListener("keydown", (event) => {
      const direction = ["ArrowRight", "ArrowUp"].includes(event.key)
        ? 1
        : ["ArrowLeft", "ArrowDown"].includes(event.key)
          ? -1
          : 0;

      if (direction) {
        event.preventDefault();
        set(key, state[key] + direction);
      }
    });
  }

  render();
  return state;
}
