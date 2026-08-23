// barcode.js — Advanced Barcode generator with shapes, frame, presets, and validation

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("#barcodeValue, #barcodeFormat, #barWidth, #barHeight, #barMargin, #barColor, #bgColor, #transparentBg, #showText, #fontFace, #textAlign, #fontSize, #textMargin, #businessName");
  inputs.forEach(el => el.addEventListener("input", tnBarcodeLive));

  document.getElementById("transparentBg")?.addEventListener("change", (e) => {
    const bgWrap = document.getElementById("bgWrapper");
    if(bgWrap) bgWrap.style.opacity = e.target.checked ? "0.5" : "1";
    const bgInput = document.getElementById("bgColor");
    if(bgInput) bgInput.disabled = e.target.checked;
    tnBarcodeLive();
  });

  tnBarcodeLive();
});

function tnBarcodeLive() {
  _generateBarcodeSilent();
}

function tnBarcodeGenerate() {
  const val = document.getElementById("barcodeValue").value.trim();
  if (!val) {
    tnToast("Please enter a barcode value");
    return;
  }
  _generateBarcodeSilent();
  tnToast("Barcode preview generated", "Ready");
}

function _generateBarcodeSilent() {
  const val = document.getElementById("barcodeValue").value.trim();
  const warningEl = document.getElementById("barcodeWarning");
  
  if (warningEl) warningEl.style.display = "none";
  updateBarcodeButtonsState(!!val);

  const out = document.getElementById("barcodeOut");
  if (!val) {
    if(out) out.innerHTML = "";
    return;
  }

  const format = document.getElementById("barcodeFormat").value;
  const width = Number(document.getElementById("barWidth").value) || 2;
  const height = Number(document.getElementById("barHeight").value) || 100;
  const margin = Number(document.getElementById("barMargin").value) || 10;
  const barColor = document.getElementById("barColor").value || "#000000";
  const isTransparent = document.getElementById("transparentBg")?.checked;
  const bgColor = isTransparent ? "transparent" : (document.getElementById("bgColor").value || "#ffffff");
  
  const showText = document.getElementById("showText")?.checked;
  const fontFace = document.getElementById("fontFace").value;
  const textAlign = document.getElementById("textAlign").value;
  const fontSize = Number(document.getElementById("fontSize").value) || 20;
  const textMargin = Number(document.getElementById("textMargin").value) || 2;
  
  const businessName = (document.getElementById("businessName").value || "").trim();

  if (!window.JsBarcode) {
    console.error("JsBarcode library not loaded");
    return;
  }

  // Generate standard barcode SVG
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  
  try {
    JsBarcode(tempSvg, val, {
      format: format,
      width: width,
      height: height,
      displayValue: showText,
      font: fontFace,
      textAlign: textAlign,
      fontSize: fontSize,
      textMargin: textMargin,
      background: bgColor === "transparent" ? "rgba(0,0,0,0)" : bgColor,
      lineColor: barColor,
      margin: margin
    });
  } catch (e) {
    if (warningEl) {
      warningEl.textContent = "Invalid format: " + e.message;
      warningEl.style.display = "block";
    }
    updateBarcodeButtonsState(false);
    if(out) out.innerHTML = "";
    return;
  }

  // Now tempSvg contains the barcode. We can wrap it.
  const rawWidth = parseInt(tempSvg.getAttribute("width")) || 300;
  const rawHeight = parseInt(tempSvg.getAttribute("height")) || 150;
  
  const frameBg = isTransparent ? "none" : bgColor;
  const hasBusinessName = !!businessName;
  
  // Outer frame styling
  const outerPadding = 20;
  const titleFontSize = Math.max(16, Math.floor(rawWidth * 0.06));
  const bNameHeight = hasBusinessName ? (titleFontSize + outerPadding) : 0;
  const footerHeight = 24;
  
  const frameWidth = rawWidth + outerPadding * 2;
  const frameHeight = rawHeight + outerPadding * 2 + bNameHeight + footerHeight;
  const strokeWidth = hasBusinessName ? 4 : 0;
  
  let wrappedSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}" viewBox="0 0 ${frameWidth} ${frameHeight}">
      <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="${outerPadding}" fill="${frameBg}" stroke="${barColor}" stroke-width="${strokeWidth}"/>
      <g transform="translate(${outerPadding}, ${outerPadding})">
        ${tempSvg.outerHTML.replace(/<svg[^>]*>/, `<svg width="${rawWidth}" height="${rawHeight}" viewBox="0 0 ${rawWidth} ${rawHeight}">`)}
      </g>
  `;

  if (hasBusinessName) {
     wrappedSvg += `<text x="${frameWidth/2}" y="${outerPadding + rawHeight + outerPadding + titleFontSize/2}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="${barColor}" text-anchor="middle">${businessName}</text>`;
  }

  const footerY = frameHeight - 10;
  wrappedSvg += `<text x="${frameWidth/2}" y="${footerY}" font-family="sans-serif" font-size="10" font-weight="normal" fill="${barColor}" opacity="0.6" text-anchor="middle">Generated with ToolNepal</text>`;

  wrappedSvg += `</svg>`;
  
  if (out) out.innerHTML = wrappedSvg;
}

function updateBarcodeButtonsState(hasData) {
  const disable = !hasData;
  const ids = ["btnDownloadPng", "btnDownloadHd", "btnDownloadSvg", "btnCopyData"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = disable;
  });
}

function tnBarcodeCopyData() {
  const val = document.getElementById("barcodeValue").value.trim();
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    tnToast("Copied to clipboard", "Success");
  }).catch(() => {
    tnToast("Failed to copy", "Error");
  });
}

function tnBarcodeReset() {
  document.getElementById("barcodeValue").value = "TOOLNEPAL123";
  document.getElementById("businessName").value = "";
  applyBarcodePreset('minimal');
  tnToast("Reset to default", "Ready");
}

function applyBarcodePreset(preset) {
  const s = (id, val) => { const el = document.getElementById(id); if (el) { el.value = val; } };
  const c = (id, checked) => { const el = document.getElementById(id); if (el) { el.checked = checked; el.dispatchEvent(new Event('change')); } };
  
  c('transparentBg', false);

  switch (preset) {
    case 'minimal':
      s('barcodeFormat', 'CODE128');
      s('barWidth', 2);
      s('barHeight', 100);
      s('barColor', '#000000');
      s('bgColor', '#ffffff');
      c('showText', true);
      s('fontFace', 'monospace');
      break;
    case 'retail':
      s('barcodeFormat', 'EAN13');
      s('barcodeValue', '123456789012'); // EAN13 needs 12 digits
      s('barWidth', 2);
      s('barHeight', 120);
      s('barColor', '#111827');
      s('bgColor', '#ffffff');
      c('showText', true);
      s('fontFace', 'sans-serif');
      break;
    case 'modern':
      s('barcodeFormat', 'CODE128');
      s('barWidth', 3);
      s('barHeight', 80);
      s('barColor', '#2563eb');
      s('bgColor', '#eff6ff');
      c('showText', true);
      s('fontFace', 'sans-serif');
      break;
    case 'bold':
      s('barcodeFormat', 'CODE128');
      s('barWidth', 4);
      s('barHeight', 150);
      s('barColor', '#000000');
      s('bgColor', '#f3f4f6');
      c('showText', false);
      break;
  }
  tnBarcodeLive();
}

function tnBarcodeDownload(format) {
  const out = document.getElementById("barcodeOut");
  const svgEl = out.querySelector("svg");
  if (!svgEl) {
    tnToast("Generate barcode first");
    return;
  }
  
  const isHd = format === 'png-hd';
  
  if (isHd) {
    const btn = document.getElementById("btnDownloadHd");
    const originalText = btn.innerText;
    btn.innerText = "Generating HD...";
    btn.disabled = true;
    setTimeout(() => {
      _processBarcodeDownload(svgEl, format);
      btn.innerText = originalText;
      btn.disabled = false;
    }, 300);
  } else {
    _processBarcodeDownload(svgEl, format);
  }
}

function _processBarcodeDownload(svgEl, format) {
  const originalWidth = parseInt(svgEl.getAttribute("width")) || 300;
  const originalHeight = parseInt(svgEl.getAttribute("height")) || 150;

  const isHd = format === 'png-hd';
  const scale = isHd ? 4 : 1;
  const width = originalWidth * scale;
  const height = originalHeight * scale;

  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  
  if (isHd) {
    clone.setAttribute("width", width);
    clone.setAttribute("height", height);
  }

  const svgData = new XMLSerializer().serializeToString(clone);
  
  if (format === 'svg') {
    const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode-toolnepal.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    tnToast("Downloaded", "SVG saved");
  } else {
    const img = new Image();
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = isHd ? "barcode-toolnepal-hd.png" : "barcode-toolnepal.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      tnToast("Downloaded", isHd ? "HD PNG saved" : "PNG saved");
    };
    img.src = url;
  }
}
