(function initTheme(){
  const saved = localStorage.getItem("tn_theme");
  if(saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
})();
function tnToggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tn_theme", next);
  tnToast(next === "dark" ? "Dark mode on" : "Dark mode off");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]));}
function tnToast(message, hint){
  const el = document.getElementById("toast"); if(!el) return;
  el.innerHTML = hint ? `${escapeHtml(message)} <span class="hint">${escapeHtml(hint)}</span>` : escapeHtml(message);
  el.style.display = "block"; clearTimeout(el._t); el._t = setTimeout(()=>{el.style.display="none";},2400);
}
function tnOpenModal(title, bodyHtml){
  const b=document.getElementById("modalBackdrop"), t=document.getElementById("modalTitle"), d=document.getElementById("modalBody");
  if(!b||!t||!d) return; t.textContent=title||"Success"; d.innerHTML=bodyHtml||""; b.style.display="flex"; b.setAttribute("aria-hidden","false");
  const first=b.querySelector("button,a,input,select,textarea"); if(first) first.focus();
}
function tnCloseModal(){const b=document.getElementById("modalBackdrop"); if(!b) return; b.style.display="none"; b.setAttribute("aria-hidden","true");}
document.addEventListener("keydown",(e)=>{if(e.key==="Escape"){const b=document.getElementById("modalBackdrop"); if(b&&b.style.display==="flex") tnCloseModal();}});
document.addEventListener("click",(e)=>{const b=document.getElementById("modalBackdrop"); if(b&&e.target===b) tnCloseModal();});
function tnBasePath(){
  const s=document.querySelector('script[src*="main.js"]');
  if(s){
    const src=s.getAttribute("src");
    return src.substring(0, src.indexOf("assets/js/main.js"));
  }
  return "";
}

function tnTrackVisit(){
  if(!location.pathname.includes("/tools/")) return;
  const t = document.querySelector("h1") ? document.querySelector("h1").textContent : document.title.split("—")[0].trim();
  const url = location.pathname.substring(location.pathname.indexOf("tools/"));
  let rec;
  try { rec = JSON.parse(localStorage.getItem("tn_recent")||"[]"); } catch(e){ rec = []; }
  rec = rec.filter(x => x.url !== url);
  rec.unshift({title: t, url: url});
  if(rec.length > 4) rec.length = 4;
  localStorage.setItem("tn_recent", JSON.stringify(rec));
}

function tnShowRecent(){
  const el = document.getElementById("recentTools");
  if(!el) return;
  let rec;
  try { rec = JSON.parse(localStorage.getItem("tn_recent")||"[]"); } catch(e){ rec = []; }
  if(rec.length === 0) return;
  let h = "";
  rec.forEach(r => {
    h += `<a class='tool-card' href='${tnBasePath()}${r.url.replace(/\\/g,"/")}' style='padding:1rem;min-height:auto'><h4>${escapeHtml(r.title)}</h4></a>`;
  });
  el.innerHTML = `<h2>Recently Used</h2><div class='grid grid-3' style='margin-top:.75rem'>${h}</div>`;
}
function tnActiveNav(pathFile){document.querySelectorAll("[data-nav]").forEach(a=>{if(a.getAttribute("href")===pathFile) a.setAttribute("aria-current","page");});}
function tnInjectLayout(){
  const base=tnBasePath();
  const h=document.getElementById("siteHeader"), f=document.getElementById("siteFooter");
  const current=(location.pathname.split("/").pop()||"index.html");
  if(h){
    h.innerHTML = `
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site-header">
        <div class="container">
          <div class="navbar">
            <a class="brand" href="${base}index.html" aria-label="ToolNepal Home">
              <img src="${base}assets/img/logo.svg" alt="ToolNepal logo">
            </a>
            <nav class="nav-links" id="primaryNav" aria-label="Primary">
              <a data-nav href="${base}index.html">Home</a>
              <a data-nav href="${base}tools.html">Tools</a>
              <a data-nav href="${base}about.html">About</a>
              <a data-nav href="${base}contact.html">Contact</a>
            </nav>
            <div class="header-actions">
              <button id="pwaInstallBtn" class="btn btn-secondary install-btn" type="button" style="display:none">📲 <span class="install-label">Install App</span></button>
              <button class="icon-btn" type="button" onclick="tnToggleTheme()" aria-label="Toggle dark mode" title="Toggle dark mode">☾</button>
              <a class="btn btn-primary header-cta" href="${base}tools.html">Explore</a>
              <button class="icon-btn nav-toggle" id="navToggle" type="button" aria-label="Open menu" aria-controls="primaryNav" aria-expanded="false">☰</button>
            </div>
          </div>
        </div>
      </header>`;
  }
  if(f){
    f.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-inner">
            <div>
              <div style="font-weight:700">© <span id="tnYear"></span> ToolNepal — Built for simplicity and speed</div>
              <div style="color:var(--muted); font-size:0.88rem; margin-top:0.3rem">Made for users in Nepal 🇳🇵</div>
            </div>
            <div class="row">
              <a href="${base}privacy-policy.html">Privacy</a>
              <a href="${base}terms-of-service.html">Terms</a>
              <a href="${base}contact.html">Support</a>
              <a href="${base}tools.html">All Tools</a>
            </div>
          </div>
        </div>
      </footer>`;
  }
  const y=document.getElementById("tnYear"); if(y) y.textContent=new Date().getFullYear();

  // Mobile menu: the toggle only shows on narrow screens (see .nav-toggle in style.css)
  const navToggle=document.getElementById("navToggle"), header=document.querySelector(".site-header");
  if(navToggle && header){
    const setOpen=(open)=>{
      header.classList.toggle("nav-open",open);
      navToggle.setAttribute("aria-expanded",String(open));
      navToggle.setAttribute("aria-label",open?"Close menu":"Open menu");
      navToggle.textContent=open?"✕":"☰";
    };
    navToggle.addEventListener("click",()=>setOpen(!header.classList.contains("nav-open")));
    document.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && header.classList.contains("nav-open")){ setOpen(false); navToggle.focus(); } });
    document.addEventListener("click",(e)=>{ if(header.classList.contains("nav-open") && !header.contains(e.target)) setOpen(false); });
  }
  if(current.endsWith(".html")) tnActiveNav(base + current);
  
  tnShowRecent();
  tnTrackVisit();

  const main = document.getElementById("main");
  let breadcrumbItems = null;
  if(main && location.pathname.includes("/tools/")) {
    const isPdf = location.pathname.includes("/pdf/");
    const isHub = location.pathname.includes("pdf-tools.html");
    const title = document.querySelector('h1')?.textContent || document.title.split('—')[0].trim();
    const bc = document.createElement("div");
    bc.className = "container";
    bc.style.marginBottom = "1.5rem";
    const pdfCrumb = isPdf && !isHub
      ? `/ <a href="${base}tools/pdf/pdf-tools.html">PDF Converter</a> `
      : '';
    bc.innerHTML = `<small style="color:var(--muted)"><a href="${base}index.html">Home</a> / <a href="${base}tools.html">Tools</a> ${pdfCrumb}/ <strong style="color:var(--text)">${escapeHtml(title)}</strong></small>`;
    main.insertBefore(bc, main.firstChild);

    breadcrumbItems = [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolnepal.pages.dev/" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://toolnepal.pages.dev/tools" },
    ];
    if (isPdf && !isHub) breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": "PDF Converter", "item": "https://toolnepal.pages.dev/tools/pdf/pdf-tools" });
    breadcrumbItems.push({ "@type": "ListItem", "position": breadcrumbItems.length + 1, "name": title, "item": location.href.split(/[?#]/)[0] });

    tnToolExtras(base);
  }

  // Sitewide Organization + WebSite structured data
  const orgSchema = document.createElement("script");
  orgSchema.type = "application/ld+json";
  orgSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ToolNepal",
    "url": "https://toolnepal.pages.dev/",
    "logo": "https://toolnepal.pages.dev/assets/img/logo.svg",
    "sameAs": []
  });
  document.head.appendChild(orgSchema);

  const siteSchema = document.createElement("script");
  siteSchema.type = "application/ld+json";
  siteSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ToolNepal",
    "url": "https://toolnepal.pages.dev/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://toolnepal.pages.dev/tools?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  });
  document.head.appendChild(siteSchema);

  if (breadcrumbItems) {
    const bcSchema = document.createElement("script");
    bcSchema.type = "application/ld+json";
    bcSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    });
    document.head.appendChild(bcSchema);
  }
}
/* ---------- Share bar + related tools on every tool page ---------- */
// [path from site root, short title, categories]
const TN_TOOLS = [
  ["tools/nepali-calendar.html", "Nepali Calendar (आजको मिति)", "nepal daily"],
  ["tools/bs-ad-converter.html", "BS ↔ AD Date Converter", "nepal daily"],
  ["tools/preeti-to-unicode.html", "Preeti ↔ Unicode Converter", "nepal writing"],
  ["tools/roman-to-nepali.html", "Roman to Nepali Typing", "nepal writing"],
  ["tools/salary-tax-calculator.html", "Salary Tax Calculator", "finance nepal"],
  ["tools/ipo-calculator.html", "IPO Profit Calculator", "finance"],
  ["tools/emi-calculator.html", "EMI Calculator", "finance"],
  ["tools/vat-calculator.html", "13% VAT Calculator", "finance"],
  ["tools/number-to-words.html", "Number to Words (Lakh/Crore)", "finance writing"],
  ["tools/percentage-calculator.html", "Percentage Calculator", "finance students"],
  ["tools/see-gpa-calculator.html", "SEE GPA to Percentage", "students"],
  ["tools/plus2-gpa-calculator.html", "+2 GPA Calculator", "students"],
  ["tools/gpa-percentage-converter.html", "GPA ⇄ Percentage", "students"],
  ["tools/cgpa-calculator.html", "CGPA Calculator", "students"],
  ["tools/age-calculator.html", "Age Calculator", "daily nepal"],
  ["tools/bmi-calculator.html", "BMI Calculator", "daily"],
  ["tools/unit-converter.html", "Unit Converter (Ropani/Aana)", "daily nepal"],
  ["tools/word-counter.html", "Word Counter", "writing students"],
  ["tools/case-converter.html", "Case Converter", "writing dev"],
  ["tools/json-formatter.html", "JSON Formatter", "dev"],
  ["tools/password-generator.html", "Password Generator", "dev daily"],
  ["tools/qr-code-generator.html", "QR Code Generator", "business"],
  ["tools/barcode-generator.html", "Barcode Generator", "business"],
  ["tools/image-compressor.html", "Image Compressor", "images"],
  ["tools/watermark-remover.html", "Watermark Remover", "images"],
  ["tools/pdf/pdf-tools.html", "All PDF Tools", "pdf"],
  ["tools/pdf/merge-pdf.html", "Merge PDF", "pdf"],
  ["tools/pdf/split-pdf.html", "Split PDF", "pdf"],
  ["tools/pdf/compress-pdf.html", "Compress PDF", "pdf"],
  ["tools/pdf/rotate-pdf.html", "Rotate PDF", "pdf"],
  ["tools/pdf/image-to-pdf.html", "Image to PDF", "pdf images"],
  ["tools/pdf/pdf-to-image.html", "PDF to Image", "pdf images"],
  ["tools/pdf/pdf-to-word.html", "PDF to Word", "pdf"]
];

function tnRelatedTools(currentPath, max){
  const norm = p => p.replace(/\.html$/, "").replace(/\/$/, "");
  const cur = norm(currentPath);
  const me = TN_TOOLS.find(t => cur.endsWith("/" + norm(t[0])) || cur === norm(t[0]));
  const myCats = me ? me[2].split(" ") : [];
  const others = TN_TOOLS.filter(t => t !== me);
  const scored = others.map((t, i) => ({ t, i, score: t[2].split(" ").filter(c => myCats.includes(c)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(x => x.t);
  for (const t of others) { if (scored.length >= max) break; if (!scored.includes(t)) scored.push(t); } // fill with popular tools
  return scored.slice(0, max);
}

function tnToolExtras(base){
  const main = document.getElementById("main");
  if(!main || !location.pathname.includes("/tools/") || document.querySelector(".tn-share-card")) return;
  const canon = document.querySelector('link[rel="canonical"]');
  const url = canon ? canon.href : location.href.split(/[?#]/)[0];
  const title = (document.querySelector("h1")?.textContent || document.title.split(/[|—–]/)[0]).trim();
  const text = `${title} – free on ToolNepal`;
  const enc = encodeURIComponent;

  const share = document.createElement("div");
  share.className = "card tn-share-card";
  share.innerHTML = `
    <h3>Share this tool</h3>
    <p class="help" style="margin:0 0 .75rem">Found it useful? Send it to a friend or your class/office group.</p>
    <div class="tn-share">
      ${navigator.share ? `<button type="button" class="btn btn-primary" data-tn-share>📤 Share</button>` : ""}
      <a class="btn btn-secondary" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(text + " " + url)}">WhatsApp</a>
      <a class="btn btn-secondary" target="_blank" rel="noopener" href="viber://forward?text=${enc(text + " " + url)}">Viber</a>
      <a class="btn btn-secondary" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}">Facebook</a>
      <button type="button" class="btn btn-secondary" data-tn-copy>🔗 Copy link</button>
    </div>`;
  share.querySelector("[data-tn-share]")?.addEventListener("click", () => {
    navigator.share({ title, text, url }).catch(() => {});
  });
  share.querySelector("[data-tn-copy]").addEventListener("click", () => {
    navigator.clipboard.writeText(url).then(() => tnToast("Link copied", "Paste it anywhere")).catch(() => tnToast("Copy failed", url));
  });

  const related = document.createElement("div");
  related.className = "card tn-related-card";
  related.innerHTML = `<h3>Related tools</h3><nav class="tn-related" aria-label="Related tools">` +
    tnRelatedTools(location.pathname, 6).map(t => `<a href="${base}${t[0]}">${escapeHtml(t[1])}<span aria-hidden="true">→</span></a>`).join("") +
    `</nav>`;

  const aside = main.querySelector("aside.sidebar");
  if (aside) {
    aside.prepend(share);
    aside.append(related);
  } else {
    const wrap = document.createElement("section");
    wrap.className = "tn-extras";
    wrap.append(share, related);
    // the tool's own container (the first .container is the breadcrumb added above)
    const container = main.querySelector("h1")?.closest(".container") || main;
    container.append(wrap);
  }
}

document.addEventListener("DOMContentLoaded", tnInjectLayout);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(tnBasePath() + "sw.js").catch(()=>{});
  });
}

// Global PWA Install Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67+ from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) {
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', async () => {
      // Hide the app provided install promotion
      installBtn.style.display = 'none';
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      deferredPrompt = null;
    });
  }
});
window.addEventListener('appinstalled', () => {
  // Hide the app-provided install promotion
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) installBtn.style.display = 'none';
  // Clear the deferredPrompt so it can be garbage collected
  deferredPrompt = null;
  console.log('PWA was installed successfully');
});
