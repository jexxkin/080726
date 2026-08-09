(function () {
  "use strict";

  /* =========================================================
     1. COMBINATION LOCK
     Code = data de namoro em DDMMYY -> 08 07 26
  ========================================================= */
  var CODE = ["0", "8", "0", "7", "2", "6"];
  var digits = ["0", "0", "0", "0", "0", "0"];

  var reelsEl = document.getElementById("reels");
  var statusEl = document.getElementById("lock-status");
  var lockScreen = document.getElementById("lock-screen");
  var siteEl = document.getElementById("site");
  var lockBtn = document.getElementById("lock-btn");
  var lockBodyEl = document.querySelector(".lock-body");

  function buildReels() {
    for (var i = 0; i < 6; i++) {
      // separator before groups 3 (index2) and 5 (index4) -> DD/MM/YY
      if (i === 2 || i === 4) {
        var sep = document.createElement("span");
        sep.className = "reel-sep";
        sep.textContent = "/";
        reelsEl.appendChild(sep);
      }

      (function (idx) {
        var reel = document.createElement("div");
        reel.className = "reel";

        var up = document.createElement("button");
        up.className = "reel-btn";
        up.type = "button";
        up.setAttribute("aria-label", "aumentar dígito");
        up.textContent = "▲";
        up.addEventListener("click", function () { changeDigit(idx, 1); });

        var win = document.createElement("div");
        win.className = "reel-window";
        var num = document.createElement("span");
        num.className = "reel-digit";
        num.id = "digit-" + idx;
        num.textContent = digits[idx];
        win.appendChild(num);

        var down = document.createElement("button");
        down.className = "reel-btn";
        down.type = "button";
        down.setAttribute("aria-label", "diminuir dígito");
        down.textContent = "▼";
        down.addEventListener("click", function () { changeDigit(idx, -1); });

        reel.appendChild(up);
        reel.appendChild(win);
        reel.appendChild(down);
        reelsEl.appendChild(reel);
      })(i);
    }
  }

  function changeDigit(idx, dir) {
    var v = (parseInt(digits[idx], 10) + dir + 10) % 10;
    digits[idx] = String(v);
    document.getElementById("digit-" + idx).textContent = digits[idx];
    // limpa qualquer feedback de tentativa anterior enquanto a pessoa ajusta os tambores
    statusEl.textContent = "\u00A0";
    statusEl.classList.remove("is-wrong", "is-right");
  }

  function testCode() {
    var match = digits.every(function (d, i) { return d === CODE[i]; });
    if (match) {
      statusEl.textContent = "é essa.";
      statusEl.classList.remove("is-wrong");
      statusEl.classList.add("is-right");
      unlock();
    } else {
      statusEl.textContent = "não é essa data ainda.";
      statusEl.classList.remove("is-right");
      statusEl.classList.add("is-wrong");
      lockBodyEl.classList.remove("is-shaking");
      // força reflow pra animação poder tocar de novo em tentativas seguidas
      void lockBodyEl.offsetWidth;
      lockBodyEl.classList.add("is-shaking");
    }
  }

  function unlock() {
    lockScreen.classList.add("unlocking");
    setTimeout(function () {
      lockScreen.hidden = true;
      siteEl.hidden = false;
      startCounters();
    }, 650);
  }

  lockBtn.addEventListener("click", testCode);

  buildReels();

  /* =========================================================
     2. TABS
  ========================================================= */
  var tabBtns = document.querySelectorAll(".tab-btn");
  var panels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-tab");

      tabBtns.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });

      panels.forEach(function (p) {
        var isTarget = p.id === "tab-" + target;
        p.classList.toggle("is-active", isTarget);
        p.hidden = !isTarget;
      });
    });
  });

  /* =========================================================
     3. LIVE COUNTERS
  ========================================================= */
  var NAMORO = new Date(2026, 6, 8, 0, 0, 0);   // 08/07/2026 (DD/MM)
  var PRIMEIRA_DM = new Date(2026, 5, 29, 0, 0, 0); // 29/06/2026

  function breakdown(from) {
    var now = new Date();
    var diffMs = now - from;
    if (diffMs < 0) diffMs = 0;

    var totalMinutes = Math.floor(diffMs / 60000);
    var days = Math.floor(totalMinutes / 1440);
    var hours = Math.floor((totalMinutes % 1440) / 60);
    var minutes = totalMinutes % 60;
    var totalHours = Math.floor(diffMs / 3600000);

    return { days: days, hours: hours, minutes: minutes, totalHours: totalHours };
  }

  function plural(n, s, p) { return n + " " + (n === 1 ? s : p); }

  function renderCounters() {
    var bNamoro = breakdown(NAMORO);
    var bDm = breakdown(PRIMEIRA_DM);

    var heroDays = document.getElementById("cn-hero-days");
    var heroSub = document.getElementById("cn-hero-sub");
    if (heroDays) heroDays.textContent = bNamoro.days;
    if (heroSub) {
      heroSub.textContent =
        plural(bNamoro.hours, "hora", "horas") + " e " +
        plural(bNamoro.minutes, "minuto", "minutos") + " a mais " +
        "(" + bNamoro.totalHours.toLocaleString("pt-BR") + " horas ao todo)";
    }

    var elNamoro = document.getElementById("elapsed-namoro");
    if (elNamoro) {
      elNamoro.textContent =
        plural(bNamoro.days, "dia", "dias") + ", " +
        plural(bNamoro.hours, "hora", "horas") + " e " +
        plural(bNamoro.minutes, "minuto", "minutos") +
        " · " + bNamoro.totalHours.toLocaleString("pt-BR") + " horas";
    }

    var elDm = document.getElementById("elapsed-dm");
    if (elDm) {
      elDm.textContent =
        plural(bDm.days, "dia", "dias") + ", " +
        plural(bDm.hours, "hora", "horas") + " e " +
        plural(bDm.minutes, "minuto", "minutos") +
        " · " + bDm.totalHours.toLocaleString("pt-BR") + " horas";
    }
  }

  var countersStarted = false;
  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    renderCounters();
    setInterval(renderCounters, 30000);
  }

  // roda desde já, mesmo antes de abrir o cadeado, pra garantir que os
  // números já estejam prontos assim que o site aparecer
  startCounters();

  /* =========================================================
     4. LIGHTBOX (zoom nas imagens da carta)
  ========================================================= */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxFrame = document.getElementById("lightbox-frame");
  var lightboxClose = document.getElementById("lightbox-close");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightboxFrame.classList.remove("is-zoomed");
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxFrame.classList.remove("is-zoomed");
    lightboxImg.src = "";
  }

  document.querySelectorAll("img.zoomable").forEach(function (img) {
    img.addEventListener("click", function () {
      openLightbox(img.getAttribute("data-full") || img.src, img.alt);
    });
  });

  lightboxFrame.addEventListener("click", function () {
    lightboxFrame.classList.toggle("is-zoomed");
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
})();
