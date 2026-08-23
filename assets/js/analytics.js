(function(){
  // Custom Internal Analytics & Ad Clicks Tracker
  function getDb() { 
    try { return JSON.parse(localStorage.getItem('tn_db') || '{"views":[],"clicks":[]}'); }
    catch(e) { return {views:[], clicks:[]}; }
  }
  function saveDb(db) { 
    localStorage.setItem('tn_db', JSON.stringify(db)); 
  }
  
  // Track Page View
  setTimeout(() => {
    const db = getDb();
    db.views.push({ path: location.pathname, time: Date.now() });
    saveDb(db);
  }, 500); // slight delay to not block rendering

  // Track Ad Clicks
  document.addEventListener('click', (e) => {
    // Check if clicked element was inside an ad wrapper
    const adBlock = e.target.closest('.ad') || e.target.closest('.sponsored-ad');
    if (adBlock) {
      const cDb = getDb();
      cDb.clicks.push({ path: location.pathname, time: Date.now() });
      saveDb(cDb);
    }
  });
})();