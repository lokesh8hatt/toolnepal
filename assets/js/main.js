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
            <nav class="nav-links" aria-label="Primary">
              <a data-nav href="${base}index.html">Home</a>
              <a data-nav href="${base}tools.html">Tools</a>
              <a data-nav href="${base}about.html">About</a>
              <a data-nav href="${base}contact.html">Contact</a>
            </nav>
            <div class="header-actions" style="display:flex; align-items:center; gap:0.5rem">
              <button id="pwaInstallBtn" class="btn btn-secondary" style="display:none; padding:0.3rem 0.8rem; font-size:0.85rem; border-color:var(--red-500); color:var(--red-500); background:transparent">📲 Install App</button>
              <button class="icon-btn" type="button" onclick="tnToggleTheme()" aria-label="Toggle dark mode" title="Toggle dark mode">☾</button>
              <a class="btn btn-primary" href="${base}tools.html">Explore</a>
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
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolnepal.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://toolnepal.com/tools.html" },
    ];
    if (isPdf && !isHub) breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": "PDF Converter", "item": "https://toolnepal.com/tools/pdf/pdf-tools.html" });
    breadcrumbItems.push({ "@type": "ListItem", "position": breadcrumbItems.length + 1, "name": title, "item": location.href.split(/[?#]/)[0] });
  }

  // Sitewide Organization + WebSite structured data
  const orgSchema = document.createElement("script");
  orgSchema.type = "application/ld+json";
  orgSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ToolNepal",
    "url": "https://toolnepal.com/",
    "logo": "https://toolnepal.com/assets/img/logo.svg",
    "sameAs": []
  });
  document.head.appendChild(orgSchema);

  const siteSchema = document.createElement("script");
  siteSchema.type = "application/ld+json";
  siteSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ToolNepal",
    "url": "https://toolnepal.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://toolnepal.com/tools.html?q={search_term_string}",
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
