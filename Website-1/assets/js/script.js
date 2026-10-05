var HERO_VIDEO_PATH  = "john-jane-2/hero-video-url";
var COUPLE_LABEL     = "John & Jane";

var DEFAULT_COVER = "./assets/media/gate.avif";
var DEFAULT_FILM  = "./assets/media/hero-clouds-sound.mp4";   /* h264 + the clip's ORIGINAL aac track, stream-copied */

var VENUE_QUERY = "The Grand Palace City Center New York New York";
var WEDDING_UTC = "2027-02-14T12:30:00Z";           /* Sat 14 Feb 2027, 6:00 PM IST */
var CAL = {
  title:"Wedding Reception of John & Jane",
  start:"20270214T123000Z",
  end:"20270214T160000Z",
  loc:"The Grand Palace, City Center, New York, New York",
  desc:"Wedding reception of John & Jane — Saturday, 14 February 2027 at 6:00 PM."
};

/* ===== TOAST (standard #2 — never a blocking browser dialog) ===== */
var toastTimer = null;
function toast(msg, isErr) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = isErr ? "rgba(140,30,30,.95)" : "rgba(20,18,12,.95)";
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 3000);
}

/* ===== GATE / OPEN =====
   The landing is a photograph, not a film, so there is nothing to wait for:
   the type fades, the sheet fades, the invitation is already underneath. */
var coverUrl = DEFAULT_COVER, heroVideoUrl = DEFAULT_FILM;
function setCoverImage(url) {
  var c = document.getElementById("gateCover");
  if (c && url) c.src = cld(url, 1200);
}

var opened = false;
function openInvite() {
  if (opened) return; opened = true;
  var gate = document.getElementById("gate");
  var cta  = document.querySelector(".gate-cta");
  var top  = document.querySelector(".gate-top");
  var veil = document.querySelector(".gate-veil");
  if (cta)  cta.style.opacity  = "0";
  if (top)  top.style.opacity  = "0";
  if (veil) veil.style.opacity = "0";

  unlockBgm();
  setTimeout(function(){                 /* let the type clear before the sheet */
    gate.classList.add("hide");
    setTimeout(function(){               /* drop the layer AND the photo (#17) */
      gate.classList.add("gone");
      var c = document.getElementById("gateCover");
      if (c) c.removeAttribute("src");
    }, 1100);
    revealInvitation();
  }, 340);
}


var heroNamed = false, heroNameTimer = null;

function filmDone() {
  if (heroNamed) return; heroNamed = true;
  clearTimeout(heroNameTimer);
  var h = document.getElementById("home");
  if (h) h.classList.add("named");
  var sb = document.getElementById("filmSoundBtn");
  if (sb) sb.classList.add("gone");

  showBgmBar();
  if (window.startBGM) { try { window.startBGM(); } catch(e){} }
}

function updateFilmSoundBtn() {
  var v = document.getElementById("heroVideo"), b = document.getElementById("filmSoundBtn");
  if (!v || !b) return;
  b.classList.toggle("muted", !!v.muted);
  b.setAttribute("aria-label", v.muted ? "Unmute the film" : "Mute the film");
}
function toggleFilmSound() {
  var v = document.getElementById("heroVideo");
  if (!v) return;
  v.muted = !v.muted;
  if (!v.muted && v.paused && !v.ended) { var p = v.play(); if (p && p.catch) p.catch(function(){}); }
  updateFilmSoundBtn();
}

function playFilm(v, forceMuted) {
  if (forceMuted) v.muted = true;
  updateFilmSoundBtn();
  var p = v.play();
  if (p && p.catch) p.catch(function(){
    if (!v.muted) playFilm(v, true);
    else filmDone();
  });
}
function startHeroFilm() {
  var v = document.getElementById("heroVideo");
  if (!v || !heroVideoUrl || v.dataset.started === "1") return;
  v.dataset.started = "1";
  v.loop = false;
  v.muted = false;            /* the clip carries its own music - play it */
  try { v.volume = 1; } catch(e){}
  v.onended = filmDone;
  v.onerror = filmDone;
  v.src = heroVideoUrl;
  try { v.load(); } catch(e){}
  playFilm(v, false);
  clearTimeout(heroNameTimer);
  heroNameTimer = setTimeout(filmDone, 15000);
}
function pauseHeroFilm() {
  var v = document.getElementById("heroVideo");
  if (v && !v.paused && !v.ended) { try { v.pause(); } catch(e){} }
}
function resumeHeroFilm() {
  var v = document.getElementById("heroVideo");
  /* never restart a film that has already run - it plays once */
  if (v && v.dataset.started === "1" && v.paused && !v.ended) {
    var p = v.play(); if (p && p.catch) p.catch(function(){});
  }
}
document.addEventListener("visibilitychange", function(){
  if (document.hidden) pauseHeroFilm(); else resumeHeroFilm();
});
function revealInvitation() {
  document.body.classList.add("entered");
  document.getElementById("main").classList.add("show");
  /* the BGM bar appears with the BGM itself, when the film has finished */
  rainPetals();
  startHeroFilm();       /* the film only ever loads from here, and it has sound */
  bindScrollUI();        /* progress bar + reveal observer — bound once */
  window.scrollTo(0, 0);
}

/* ===== SCROLL UI — progress bar + reveal-on-scroll (wired once, #17) ===== */
var scrollUIBound = false;
function sweepReveals() {
  var hidden = document.querySelectorAll(".reveal:not(.visible)");
  if (!hidden.length) return;
  for (var i = 0; i < hidden.length; i++) {
    if (hidden[i].getBoundingClientRect().top < window.innerHeight * 0.92) hidden[i].classList.add("visible");
  }
}
function bindScrollUI() {
  if (scrollUIBound) return; scrollUIBound = true;
  var bar = document.getElementById("progressBar");
  window.addEventListener("scroll", function(){
    var h = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";

    document.body.classList.toggle("nav-on", window.scrollY > window.innerHeight * 0.72);
    sweepReveals();
  }, { passive: true });
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    var rv = document.querySelectorAll(".reveal");
    for (var i = 0; i < rv.length; i++) obs.observe(rv[i]);
    /* stop decoding the film once the hero has scrolled away (#17) */
    var hero = document.getElementById("home");
    if (hero) {
      new IntersectionObserver(function(es){
        es.forEach(function(e){ if (e.isIntersecting) resumeHeroFilm(); else pauseHeroFilm(); });
      }, { threshold: 0.05 }).observe(hero);
    }
  }
  sweepReveals();
}

/* ===== PETALS ===== */
var petalsDone = false;

function rainPetals() {
  if (petalsDone) return; petalsDone = true;
  var host = document.getElementById("petals");
  if (!host) return;
  var tones = ["t-light", "t-mid", "t-deep"];
  var cfg = [
    {left:"2%",  dur:"17s", delay:"0s",   w:"15px", sway:"4.5s"},
    {left:"10%", dur:"14s", delay:"-3s",  w:"12px", sway:"5.5s"},
    {left:"20%", dur:"25s", delay:"-7s",  w:"18px", sway:"6s",   op:".5"},
    {left:"32%", dur:"19s", delay:"-12s", w:"13px", sway:"4s"},
    {left:"45%", dur:"23s", delay:"-2s",  w:"16px", sway:"5s",   op:".55"},
    {left:"58%", dur:"27s", delay:"-15s", w:"11px", sway:"6.5s"},
    {left:"68%", dur:"20s", delay:"-9s",  w:"15px", sway:"4.8s", op:".6"},
    {left:"78%", dur:"22s", delay:"-5s",  w:"19px", sway:"5.2s"},
    {left:"88%", dur:"18s", delay:"-18s", w:"12px", sway:"6s",   op:".5"},
    {left:"95%", dur:"24s", delay:"-11s", w:"15px", sway:"4.6s"},
    {left:"15%", dur:"29s", delay:"-20s", w:"10px", sway:"7s",   op:".45"},
    {left:"50%", dur:"16s", delay:"-6s",  w:"14px", sway:"4.2s"},
    {left:"72%", dur:"26s", delay:"-14s", w:"17px", sway:"5.8s", op:".58"},
    {left:"38%", dur:"14s", delay:"-8s",  w:"12px", sway:"5s"}
  ];
  var frag = document.createDocumentFragment();
  cfg.forEach(function(c, i){
    var fall = document.createElement("div");
    fall.className = "petal-fall";
    fall.style.left = c.left;
    fall.style.setProperty("--dur", c.dur);
    fall.style.setProperty("--delay", c.delay);
    var p = document.createElement("div");
    p.className = "petal " + tones[i % 3];
    p.style.setProperty("--w", c.w);
    p.style.setProperty("--sway", c.sway);
    p.style.setProperty("--delay", c.delay);
    if (c.op) p.style.setProperty("--op", c.op);
    fall.appendChild(p);
    frag.appendChild(fall);
  });
  host.appendChild(frag);
}

/* ===== COUNTDOWN → TOGETHERNESS COUNT-UP (standard #6) ===== */
var cdNodes = null, cdTimer = null;
function updateCountdown() {
  if (!cdNodes) {
    cdNodes = {
      d: document.getElementById("cdDays"), h: document.getElementById("cdHours"),
      m: document.getElementById("cdMins"), s: document.getElementById("cdSecs"),
      head: document.getElementById("cdHeading")
    };
  }
  var diff = new Date(WEDDING_UTC) - new Date();
  var past = diff <= 0;
  var d = Math.abs(diff);
  cdNodes.d.textContent = String(Math.floor(d / 86400000)).padStart(2, "0");
  cdNodes.h.textContent = String(Math.floor((d % 86400000) / 3600000)).padStart(2, "0");
  cdNodes.m.textContent = String(Math.floor((d % 3600000) / 60000)).padStart(2, "0");
  cdNodes.s.textContent = String(Math.floor((d % 60000) / 1000)).padStart(2, "0");
  if (past && cdNodes.head && cdNodes.head.dataset.flipped !== "1") {
    cdNodes.head.dataset.flipped = "1";
    cdNodes.head.textContent = "Together For";
  }
}
function startCountdown() {
  if (cdTimer) return;
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);
}
function stopCountdown() { clearInterval(cdTimer); cdTimer = null; }
document.addEventListener("visibilitychange", function(){
  if (document.hidden) stopCountdown(); else startCountdown();
});


var bgmAudio = document.getElementById("bgmAudio");
var bgmPlaying = false, bgmBound = false;
window.startBGM = function() {
  if (!bgmAudio.getAttribute("src")) return;   /* nothing uploaded yet */
  bgmAudio.play().catch(function(){}); bgmPlaying = true; updateBgmBtn();
};

function showBgmBar() {
  if (!heroNamed) return;                     
  if (!bgmAudio.getAttribute("src")) return;    
  var bar = document.getElementById("bgmBar");
  if (bar) bar.style.display = "block";
}
function unlockBgm() {
  try {
    if (!bgmAudio.getAttribute("src")) return;
    var p = bgmAudio.play();
    if (p && p.then) p.then(function(){ bgmAudio.pause(); bgmAudio.currentTime = 0; }).catch(function(){});
    else { bgmAudio.pause(); bgmAudio.currentTime = 0; }
  } catch(e){}
}
function toggleBgm() {
  if (bgmPlaying) { bgmAudio.pause(); bgmPlaying = false; }
  else { bgmAudio.play().catch(function(){}); bgmPlaying = true; }
  updateBgmBtn();
}
function updateBgmBtn() { document.getElementById("bgmBtn").innerHTML = bgmPlaying ? "♫" : "♪"; }

/* ===== WEDDING CARD (standard #25) ===== */
function cardDownloadHint(){
  toast("Saving the card… if it opens instead, press and hold to save.");
}

/* ===== PDF — libs lazy-loaded on first tap (standard #15/#17) ===== */
var _pdfLibsReady = false;
function loadScriptOnce(src) {
  return new Promise(function(res, rej){
    var s = document.createElement("script");
    s.src = src; s.crossOrigin = "anonymous";
    s.onload = res; s.onerror = function(){ rej(new Error("load " + src)); };
    document.head.appendChild(s);
  });
}
function ensurePdfLibs() {
  if (_pdfLibsReady) return Promise.resolve();
  return Promise.all([
    loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
    loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
  ]).then(function(){ _pdfLibsReady = true; });
}
async function downloadInvitePDF() {
  var btn = document.getElementById("pdfDownloadBtn");
  btn.style.opacity = ".4"; btn.disabled = true;
  try {
    await ensurePdfLibs();
    document.body.classList.add("pdf-capturing");
    var canvas = await html2canvas(document.getElementById("main"), {
      scale: Math.min(window.devicePixelRatio || 1, 2),
      useCORS: true, allowTaint: false, backgroundColor: "#f2f8fd"
    });
    var jsPDF = window.jspdf.jsPDF;
    var pdf = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
    var pW = pdf.internal.pageSize.getWidth();
    var pH = pdf.internal.pageSize.getHeight();
    var ratio = pW / canvas.width;
    var y = 0;
    while (y < canvas.height) {
      var sliceH = Math.min(canvas.height - y, pH / ratio);
      var sl = document.createElement("canvas");
      sl.width = canvas.width; sl.height = sliceH;
      sl.getContext("2d").drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      if (y > 0) pdf.addPage();
      pdf.addImage(sl.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pW, sliceH * ratio);
      y += sliceH;
    }
    pdf.save("John-and-Jane-Wedding-Reception.pdf");
  } catch(e) {
    console.warn("PDF error:", e);
    window.print();
  } finally {
    document.body.classList.remove("pdf-capturing");
    btn.style.opacity = ""; btn.disabled = false;
  }
}

/* ===== BOOT ===== */
document.addEventListener("DOMContentLoaded", function(){
  /* links */
  document.getElementById("mapsLink").href =
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(VENUE_QUERY);
  var cal = document.getElementById("calLink");
  cal.href = "https://www.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent(CAL.title)
    + "&dates=" + CAL.start + "/" + CAL.end
    + "&location=" + encodeURIComponent(CAL.loc)
    + "&details=" + encodeURIComponent(CAL.desc);
  cal.target = "_blank"; cal.rel = "noopener";

  startCountdown();
  updateBgmBtn();
});