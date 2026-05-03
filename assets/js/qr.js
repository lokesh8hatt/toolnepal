// qr.js — Advanced QR generator with shapes, eyes, gradients, logo, frame, presets, validation, reset, and HD export

let _qrInstance = null;
let _qrLogoUrl = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("qrLogo")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        _qrLogoUrl = e.target.result;
        tnQrLive();
      };
      reader.readAsDataURL(file);
    } else {
      _qrLogoUrl = null;
      tnQrLive();
    }
  });

  // Attach live preview listeners to all inputs
  const inputs = document.querySelectorAll("#qrSize, #errorCorrection, #businessName, #transparentBg, #dotShape, #eyeShape, #qrFg, #qrFg2, #gradientType, #qrBg");
  inputs.forEach(el => el.addEventListener("input", tnQrLive));

  const typeInputs = document.querySelectorAll("#dynamicInputs input, #dynamicInputs textarea, #dynamicInputs select");
  typeInputs.forEach(el => el.addEventListener("input", tnQrLive));
  
  document.getElementById("transparentBg")?.addEventListener("change", (e) => {
    const bgWrap = document.getElementById("bgWrapper");
    if(bgWrap) bgWrap.style.opacity = e.target.checked ? "0.5" : "1";
    const bgInput = document.getElementById("qrBg");
    if(bgInput) bgInput.disabled = e.target.checked;
    tnQrLive();
  });

  // Initial setup
  handleTypeChange();
});

function handleTypeChange() {
  const type = document.getElementById("qrType").value;
  const sections = ["url", "wifi", "phone", "sms", "email", "whatsapp", "google_review", "text"];
  sections.forEach(sec => {
    const el = document.getElementById("input-" + sec);
    if (el) el.style.display = (sec === type) ? "block" : "none";
  });
  tnQrLive();
}

function getQrData() {
  const type = document.getElementById("qrType").value;
  let data = "";

  if (type === "url" || type === "google_review") {
    const id = type === "url" ? "qrText" : "grLink";
    let val = (document.getElementById(id).value || "").trim();
    if (val && !/^https?:\/\//i.test(val)) {
      val = "https://" + val;
    }
    data = val;
  } else if (type === "wifi") {
    const ssid = (document.getElementById("wifiSsid").value || "").trim();
    const pass = document.getElementById("wifiPass").value || "";
    const enc = document.getElementById("wifiEnc").value || "WPA";
    if (ssid) {
      data = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    }
  } else if (type === "phone") {
    const val = (document.getElementById("phoneNum").value || "").trim();
    if (val) data = `tel:${val}`;
  } else if (type === "sms") {
    const val = (document.getElementById("smsNum").value || "").trim();
    const msg = document.getElementById("smsMsg").value || "";
    if (val) data = `SMSTO:${val}:${msg}`;
  } else if (type === "email") {
    const val = (document.getElementById("emailAddr").value || "").trim();
    if (val) data = `mailto:${val}`;
  } else if (type === "whatsapp") {
    let val = (document.getElementById("waNum").value || "").trim();
    val = val.replace(/[^0-9+]/g, '');
    if (val) data = `https://wa.me/${val}`;
  } else if (type === "text") {
    data = document.getElementById("plainText").value || "";
  }

  const warningEl = document.getElementById("qrWarning");
  if (warningEl) {
    warningEl.style.display = "none"; // Validation message if any
  }

  return data;
}

function updateButtonsState(hasData) {
  const disable = !hasData;
  const ids = ["btnDownloadPng", "btnDownloadHd", "btnDownloadSvg", "btnCopyData"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = disable;
  });
}

function tnQrCopyData() {
  const data = getQrData();
  if (!data) return;
  navigator.clipboard.writeText(data).then(() => {
    tnToast("Copied to clipboard", "Success");
  }).catch(() => {
    tnToast("Failed to copy", "Error");
  });
}

function tnQrReset() {
  document.getElementById("qrType").value = "url";
  document.getElementById("businessName").value = "";
  
  const logoInput = document.getElementById("qrLogo");
  if (logoInput) logoInput.value = "";
  _qrLogoUrl = null;
  
  const allInputs = document.querySelectorAll("#dynamicInputs input, #dynamicInputs textarea");
  allInputs.forEach(el => el.value = "");
  
  applyPreset('minimal');
  handleTypeChange();
  tnToast("Reset to default", "Ready");
}

function applyPreset(preset) {
  const s = (id, val) => { const el = document.getElementById(id); if (el) { el.value = val; } };
  const c = (id, checked) => { const el = document.getElementById(id); if (el) { el.checked = checked; el.dispatchEvent(new Event('change')); } };
  
  c('transparentBg', false);
  s('errorCorrection', 'H');

  switch (preset) {
    case 'minimal':
      s('dotShape', 'square');
      s('eyeShape', 'square');
      s('qrFg', '#000000');
      s('gradientType', 'none');
      s('qrBg', '#ffffff');
      break;
    case 'gradient':
      s('dotShape', 'rounded');
      s('eyeShape', 'extra-rounded');
      s('qrFg', '#2563eb');
      s('qrFg2', '#9333ea');
      s('gradientType', 'linear');
      s('qrBg', '#ffffff');
      break;
    case 'restaurant':
      s('dotShape', 'dots');
      s('eyeShape', 'rounded');
      s('qrFg', '#d97706');
      s('gradientType', 'none');
      s('qrBg', '#fffbeb');
      break;
    case 'payment':
      s('dotShape', 'extra-rounded');
      s('eyeShape', 'dot');
      s('qrFg', '#16a34a');
      s('gradientType', 'none');
      s('qrBg', '#f0fdf4');
      s('errorCorrection', 'H');
      break;
    case 'classic':
      s('dotShape', 'square');
      s('eyeShape', 'square');
      s('qrFg', '#111827');
      s('gradientType', 'none');
      s('qrBg', '#f3f4f6');
      break;
  }
  tnQrLive();
}

function tnQrLive() {
  _generateSilent();
}

function tnQrGenerate() {
  const data = getQrData();
  if (!data) {
    tnToast("Please fill in the required fields");
    return;
  }
  _generateSilent();
  tnToast("QR preview generated", "Ready");
}

function _generateSilent() {
  const data = getQrData();
  updateButtonsState(!!data);
  if (!data) {
    const out = document.getElementById("qrOut");
    if(out) out.innerHTML = "";
    return;
  }

  const size = Math.max(128, Math.min(1024, Number(document.getElementById("qrSize").value || 300)));
  const ec = document.getElementById("errorCorrection").value || "H";
  const fg = document.getElementById("qrFg").value || "#000000";
  const fg2 = document.getElementById("qrFg2").value || "#000000";
  const gradientType = document.getElementById("gradientType").value || "none";
  const isTransparent = document.getElementById("transparentBg")?.checked;
  const bg = isTransparent ? "transparent" : (document.getElementById("qrBg").value || "#ffffff");
  const dotShape = document.getElementById("dotShape").value || "square";
  const eyeShape = document.getElementById("eyeShape").value || "square";
  const businessName = (document.getElementById("businessName").value || "").trim();
  const out = document.getElementById("qrOut");

  // Logo warning
  const logoWarning = document.getElementById("logoWarning");
  if (logoWarning) {
    if (_qrLogoUrl && ec !== "H") {
      logoWarning.style.display = "block";
    } else {
      logoWarning.style.display = "none";
    }
  }

  if (!window.QRCodeStyling) {
    console.error("qr-code-styling library not loaded");
    return;
  }

  if (out) out.innerHTML = "";

  const dotsOptions = {
    color: fg,
    type: dotShape
  };

  if (gradientType !== "none") {
    dotsOptions.gradient = {
      type: gradientType,
      rotation: 0,
      colorStops: [{ offset: 0, color: fg }, { offset: 1, color: fg2 }]
    };
  }

  let cornersType = eyeShape;
  if (cornersType === "circle") cornersType = "dot"; 

  const options = {
    width: size,
    height: size,
    data: data,
    image: _qrLogoUrl,
    qrOptions: {
      errorCorrectionLevel: ec
    },
    dotsOptions: dotsOptions,
    cornersSquareOptions: {
      type: cornersType,
      color: fg
    },
    backgroundOptions: {
      color: bg === "transparent" ? "rgba(0,0,0,0)" : bg,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: Math.floor(size * 0.05) 
    }
  };

  _qrInstance = new QRCodeStyling(options);
  
  _qrInstance.getRawData("svg").then((blob) => {
    blob.text().then(svgText => {
      if (!out) return;
      
      const padding = Math.max(20, Math.floor(size * 0.1));
      const fontSize = Math.max(16, Math.floor(size * 0.08));
      const frameBg = isTransparent ? "none" : bg;
      
      const hasBusinessName = !!businessName;
      const bNameHeight = hasBusinessName ? (fontSize + padding) : 0;
      const footerHeight = 24;
      
      const frameHeight = size + padding * 2 + bNameHeight + footerHeight;
      const frameWidth = size + padding * 2;
      const strokeWidth = hasBusinessName ? 4 : 0;
      
      let wrappedSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}" viewBox="0 0 ${frameWidth} ${frameHeight}">
          <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="${padding}" fill="${frameBg}" stroke="${fg}" stroke-width="${strokeWidth}"/>
          <g transform="translate(${padding}, ${padding})">
            ${svgText.replace(/<svg[^>]*>/, '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">')}
          </g>
      `;

      if (hasBusinessName) {
         wrappedSvg += `<text x="${frameWidth/2}" y="${padding + size + padding + fontSize/2}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="${fg}" text-anchor="middle">${businessName}</text>`;
      }

      const footerY = frameHeight - 12;
      wrappedSvg += `<text x="${frameWidth/2}" y="${footerY}" font-family="sans-serif" font-size="11" font-weight="normal" fill="${fg}" opacity="0.6" text-anchor="middle">Generated with ToolNepal</text>`;

      wrappedSvg += `</svg>`;
      out.innerHTML = wrappedSvg;
    });
  });
}

function tnQrDownload(format) {
  const out = document.getElementById("qrOut");
  const svgEl = out.querySelector("svg");
  if (!svgEl) {
    tnToast("Generate QR first");
    return;
  }
  
  const isHd = format === 'png-hd';
  
  if (isHd) {
    const btn = document.getElementById("btnDownloadHd");
    const originalText = btn.innerText;
    btn.innerText = "Generating HD...";
    btn.disabled = true;
    setTimeout(() => {
      _processDownload(svgEl, format);
      btn.innerText = originalText;
      btn.disabled = false;
    }, 300);
  } else {
    _processDownload(svgEl, format);
  }
}

function _processDownload(svgEl, format) {
  const originalWidth = svgEl.getAttribute("width") || svgEl.viewBox?.baseVal?.width || 256;
  const originalHeight = svgEl.getAttribute("height") || svgEl.viewBox?.baseVal?.height || 256;

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
    a.download = "qr-toolnepal.svg";
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
      a.download = isHd ? "qr-toolnepal-hd.png" : "qr-toolnepal.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      tnToast("Downloaded", isHd ? "HD PNG saved" : "PNG saved");
    };
    img.src = url;
  }
}
