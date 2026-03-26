// qr.js — WORKING QR generator + PNG download (QRCode.js / cdnjs)

let _qrInstance = null;

function tnQrGenerate() {
  const text = (document.getElementById("qrText").value || "").trim();
  const size = Math.max(128, Math.min(1024, Number(document.getElementById("qrSize").value || 256)));
  const fg = document.getElementById("qrFg").value || "#000000";
  const bg = document.getElementById("qrBg").value || "#ffffff";
  const out = document.getElementById("qrOut");

  if (!text) {
    tnToast("Enter text or URL");
    return;
  }

  if (!window.QRCode) {
    tnToast("QR failed", "Library not loaded");
    return;
  }

  // Clear old
  out.innerHTML = "";

  // Generate
  _qrInstance = new QRCode(out, {
    text: text,
    width: size,
    height: size,
    colorDark: fg,
    colorLight: bg,
    correctLevel: QRCode.CorrectLevel.M
  });

  tnToast("QR generated", "Ready");
  tnOpenModal("QR Generated ✅", "<p class='help'>Now click <b>Download PNG</b>.</p>");
}

function tnQrDownload() {
  const out = document.getElementById("qrOut");
  if (!out || !out.firstChild) {
    tnToast("Generate QR first");
    return;
  }

  // QRCode.js usually renders a canvas (sometimes img). Handle both.
  const canvas = out.querySelector("canvas");
  const img = out.querySelector("img");

  let dataUrl = "";

  if (canvas) {
    dataUrl = canvas.toDataURL("image/png");
  } else if (img && img.src) {
    dataUrl = img.src; // already a PNG data url
  } else {
    tnToast("Download failed");
    return;
  }

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "qr-toolnepal.png";
  document.body.appendChild(a);
  a.click();
  a.remove();

  tnToast("Downloaded", "PNG saved");
  tnOpenModal("Download started ✅", "<p class='help'>Your QR PNG download has started.</p>");
}
