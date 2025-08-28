// Default values
const defaultColors = {
  iconColor: "#0c0c0d",
  bgColor: "#FFFFFF",
  textColor: "#0c0c0d",
  btnBgColor: "rgba(12, 12, 13, 0.1)",
  btnTextColor: "#0c0c0d"
};

// Apply colors visually
function applyVisualStyles(settings) {
  document.body.style.backgroundColor = settings.bgColor;
  document.body.style.color = settings.textColor;

  document.querySelectorAll("button").forEach(btn => {
    btn.style.backgroundColor = settings.btnBgColor;
    btn.style.color = settings.btnTextColor;
  });

  document.querySelectorAll(".svg-icon").forEach(icon => {
    icon.style.fill = settings.iconColor;
  });
}

// Listen for "Reset to default"
document.getElementById("resetColors").addEventListener("click", () => {
  browser.storage.local.set(defaultColors).then(() => {
    applyVisualStyles(defaultColors);
  });
});

// Listen for "Apply colors"
document.getElementById("applyColors").addEventListener("click", () => {
  const settings = {
    iconColor: document.getElementById("iconColor").value,
    bgColor: document.getElementById("bgColor").value,
    textColor: document.getElementById("textColor").value,
    btnBgColor: document.getElementById("btnBgColor").value,
    btnTextColor: document.getElementById("btnTextColor").value
  };

  browser.storage.local.set(settings).then(() => {
  applyVisualStyles(settings);
});
});

// Color palette that shows colors
document.getElementById("colorPicker").addEventListener("input", (e) => {
  document.getElementById("hexPreview").value = e.target.value;
});

// Apply saved settings at load
browser.storage.local.get().then(settings => {
  if (settings && Object.keys(settings).length > 0) {
    applyVisualStyles(settings);
  }
});

