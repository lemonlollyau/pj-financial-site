/* P & J Financial Solutions — site scripts. No dependencies. */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var mq = window.matchMedia("(max-width: 1120px)");
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.setAttribute("data-open", String(open));
    };
    var sync = function () { if (mq.matches) { setOpen(false); } else { nav.removeAttribute("data-open"); } };
    sync();
    if (mq.addEventListener) { mq.addEventListener("change", sync); }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
  }

  /* ---- Enquiry form: prefill "finance need" from the link, submit ---- */
  var form = document.getElementById("enquiry-form");
  if (form) {
    var map = { home: "Home loan", refinance: "Refinance", commercial: "Commercial finance", equipment: "Equipment or vehicle finance" };
    var key = (location.hash || "").replace("#", "");
    var select = document.getElementById("f-need");
    if (map[key] && select) {
      select.value = map[key];
      var nameField = document.getElementById("f-name");
      if (nameField) { setTimeout(function () { nameField.focus({ preventScroll: true }); document.getElementById("enquire").scrollIntoView({ block: "start" }); }, 50); }
    }

    var status = document.getElementById("form-status");
    var button = form.querySelector("button[type=submit]");
    var label = button.querySelector(".btn-label") || button;
    var show = function (state, msg) {
      status.hidden = false;
      status.setAttribute("data-state", state);
      status.textContent = msg;
      status.focus();
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var required = ["f-name", "f-email", "f-consent"];
      var firstBad = null;
      required.forEach(function (id) {
        var el = document.getElementById(id);
        var bad = el.type === "checkbox" ? !el.checked : !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && !firstBad) { firstBad = el; }
      });
      if (firstBad) {
        show("error", "Please add your name, a valid email address and tick the consent box, then send again.");
        firstBad.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v); });
      button.disabled = true;
      label.textContent = "Sending…";

      fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) { throw new Error("status " + r.status); }
        form.reset();
        show("ok", "Thanks, your enquiry has been sent. One of our brokers will be in touch shortly.");
      }).catch(function () {
        show("error", "Your enquiry couldn't be sent from this page. Please call us on (08) 9437 3666 or email admin@pjfinancialsolutions.com.au.");
      }).finally(function () {
        button.disabled = false;
        label.textContent = "Send enquiry";
      });
    });
  }

  /* ---- Repayment calculator ---- */
  var calc = document.getElementById("calc-form");
  if (calc) {
    var aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
    var aud2 = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
    var per = { 12: "month", 26: "fortnight", 52: "week" };
    var num = function (id) { var v = parseFloat(String(document.getElementById(id).value).replace(/[^0-9.]/g, "")); return isFinite(v) ? v : 0; };

    var schedule = function (P, rate, f, n, pmt, extra) {
      /* Returns balance at the end of each year and totals. */
      var r = rate / 100 / f, bal = P, interest = 0, k = 0, years = [P];
      var cap = n * 3;
      while (bal > 0.005 && k < cap) {
        var i = bal * r;
        interest += i;
        bal = bal + i - (pmt + extra);
        k++;
        if (bal < 0) { bal = 0; }
        if (k % f === 0) { years.push(Math.max(bal, 0)); }
      }
      if (k % f !== 0) { years.push(0); }
      return { periods: k, interest: interest, years: years };
    };

    var compact = function (v) {
      if (v <= 0) { return "$0"; }
      if (v >= 1e6) { var m = v / 1e6; return "$" + (Math.round(m * 10) / 10).toString() + "m"; }
      return "$" + Math.round(v / 1000) + "k";
    };

    var drawChart = function (P, termYears, base, faster) {
      var W = 640, H = 260, L = 64, R = 16, T = 16, B = 36;
      var x = function (yr) { return L + (W - L - R) * (yr / termYears); };
      var y = function (v) { return T + (H - T - B) * (1 - v / P); };
      var line = function (pts) { return pts.map(function (v, i) { return (i ? "L" : "M") + x(Math.min(i, termYears)).toFixed(1) + " " + y(v).toFixed(1); }).join(" "); };
      var area = function (pts) { return line(pts) + " L" + x(Math.min(pts.length - 1, termYears)).toFixed(1) + " " + y(0) + " L" + x(0) + " " + y(0) + " Z"; };
      var ticks = [0, Math.round(termYears / 2), termYears];
      var grid = [0, 0.5, 1].map(function (f) {
        return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(P * f) + '" y2="' + y(P * f) + '" stroke="#EAF3FA" stroke-opacity="0.16" stroke-width="1"/>' +
          '<text x="' + (L - 10) + '" y="' + (y(P * f) + 4) + '" text-anchor="end" font-size="12" fill="#C9D6E3">' + compact(P * f) + "</text>";
      }).join("");
      var xl = ticks.map(function (t) {
        var anchor = t === 0 ? "start" : t === termYears ? "end" : "middle";
        return '<text x="' + x(t) + '" y="' + (H - 12) + '" text-anchor="' + anchor + '" font-size="12" fill="#C9D6E3">' + (t === 0 ? "Today" : "Year " + t) + "</text>";
      }).join("");
      var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-labelledby="chart-title"><title id="chart-title">Loan balance over time</title>' + grid + xl +
        '<path d="' + area(base.years) + '" fill="#9CC4EA" fill-opacity="0.12"/>' +
        '<path d="' + line(base.years) + '" fill="none" stroke="#9CC4EA" stroke-width="2.5"/>' +
        (faster ? '<path d="' + line(faster.years) + '" fill="none" stroke="#FFFFFF" stroke-width="3"/>' : "") +
        "</svg>";
      document.getElementById("chart").innerHTML = svg;
      document.getElementById("legend-extra").hidden = !faster;
    };

    var run = function () {
      var P = num("c-amount"), rate = num("c-rate"), yrs = Math.round(num("c-term"));
      var f = parseInt(calc.querySelector("input[name=freq]:checked").value, 10);
      var io = calc.querySelector("input[name=type]:checked").value === "io";
      var extra = num("c-extra");
      if (P <= 0 || yrs <= 0 || yrs > 40 || rate < 0 || rate > 25) {
        document.getElementById("r-pmt").textContent = "—";
        document.getElementById("r-note").textContent = "Enter a loan amount, a rate between 0% and 25% and a term of 1 to 40 years.";
        return;
      }
      document.getElementById("r-note").textContent = "";
      var n = yrs * f, r = rate / 100 / f;
      var pmt = io ? P * r : (r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)));
      var total, interest;
      document.getElementById("r-per").textContent = "Repayment per " + per[f];
      document.getElementById("r-pmt").textContent = aud2.format(pmt);
      var savingEl = document.getElementById("r-saving");

      if (io) {
        interest = pmt * n; total = interest;
        document.getElementById("r-interest").textContent = aud.format(interest);
        document.getElementById("r-total").textContent = aud.format(total + P);
        document.getElementById("r-total-k").textContent = "Total repaid incl. the " + aud.format(P) + " still owing at the end";
        savingEl.hidden = false;
        savingEl.textContent = "Interest-only repayments don't reduce what you owe. Most interest-only periods run for 1 to 5 years before switching to principal and interest.";
        var flat = []; for (var i = 0; i <= yrs; i++) { flat.push(P); }
        drawChart(P, yrs, { years: flat }, null);
        return;
      }

      var base = schedule(P, rate, f, n, pmt, 0);
      document.getElementById("r-interest").textContent = aud.format(base.interest);
      document.getElementById("r-total").textContent = aud.format(P + base.interest);
      document.getElementById("r-total-k").textContent = "Total repaid";

      if (extra > 0) {
        var fast = schedule(P, rate, f, n, pmt, extra);
        var saved = base.periods - fast.periods;
        var y = Math.floor(saved / f), rem = saved - y * f;
        var unit = f === 12 ? "month" : f === 26 ? "fortnight" : "week";
        var when = (y ? y + (y === 1 ? " year" : " years") : "") + (y && rem ? " and " : "") + (rem ? rem + " " + unit + (rem === 1 ? "" : "s") : "");
        savingEl.hidden = false;
        savingEl.textContent = "Paying an extra " + aud.format(extra) + " a " + per[f] + " could clear the loan " + (when || "slightly") + " sooner and save about " + aud.format(base.interest - fast.interest) + " in interest.";
        drawChart(P, yrs, base, fast);
      } else {
        savingEl.hidden = false;
        savingEl.textContent = "Add an extra repayment to see how much sooner you could own your home.";
        drawChart(P, yrs, base, null);
      }
    };
    calc.addEventListener("input", run);
    calc.addEventListener("change", run);
    calc.addEventListener("submit", function (e) { e.preventDefault(); run(); });
    run();
  }
})();
