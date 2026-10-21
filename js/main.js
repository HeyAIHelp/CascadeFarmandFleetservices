// Mobile nav toggle
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Request-service form: submits to Netlify Forms via AJAX so the page
  // doesn't reload. Requires the form's data-netlify="true" attribute and
  // a matching hidden form-name field (see contact.html) — Netlify detects
  // and provisions the form at deploy time by scanning the built HTML.
  var form = document.querySelector(".request-form");
  var success = document.querySelector(".form-success");
  var successName = document.querySelector(".success-name");
  var errorMsg = document.querySelector(".form-error");
  if (form && success) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new URLSearchParams(new FormData(form)).toString();
      var nameField = form.querySelector('[name="name"]');
      var firstName = nameField && nameField.value ? nameField.value.trim().split(" ")[0] : "";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Form submission failed");
          if (successName && firstName) successName.textContent = firstName;
          form.classList.add("is-hidden");
          success.classList.add("is-visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
        })
        .catch(function () {
          if (errorMsg) errorMsg.style.display = "block";
        });
    });
  }
});

// Home hero: work order ticket that fills in, stamps FIXED, then loops.
// Purely decorative (aria-hidden); static first job is already in the HTML.
document.addEventListener("DOMContentLoaded", function () {
  var ticket = document.querySelector(".work-ticket");
  if (!ticket) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var jobs = [
    { tag: "001928", unit: "Tractor", complaint: "Hard starting", diagnosis: "Fuel delivery", status: "Back in the field" },
    { tag: "004725", unit: "Combine", complaint: "Loss of power", diagnosis: "Injector service", status: "Ready for harvest" },
    { tag: "006312", unit: "Baler", complaint: "Slow hydraulic cycle", diagnosis: "Pump and hose check", status: "Ready to bale" },
    { tag: "008140", unit: "Diesel truck", complaint: "Rough idle, smoke", diagnosis: "Scan and fuel system", status: "Back on the road" }
  ];
  var fields = ["unit", "complaint", "diagnosis", "status"];
  var els = {};
  fields.forEach(function (f) { els[f] = ticket.querySelector('[data-wt="' + f + '"]'); });
  var tagEl = ticket.querySelector("[data-wt-tag]");
  var stamp = ticket.querySelector("[data-wt-stamp]");
  var n = 0;

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function visible() { return !document.hidden; }
  async function waitVisible() { while (!visible()) await wait(500); }

  async function type(el, text) {
    el.classList.add("is-typing");
    for (var i = 1; i <= text.length; i++) {
      await waitVisible();
      el.textContent = text.slice(0, i);
      await wait(32);
    }
    el.classList.remove("is-typing");
  }

  async function run() {
    await wait(3200); // let the first (static) job sit
    while (true) {
      stamp.classList.remove("is-on");
      ticket.classList.add("is-clearing");
      await wait(350);
      n = (n + 1) % jobs.length;
      var job = jobs[n];
      fields.forEach(function (f) { els[f].textContent = ""; });
      tagEl.textContent = job.tag;
      ticket.classList.remove("is-clearing");
      await wait(250);
      for (var k = 0; k < fields.length; k++) {
        await type(els[fields[k]], job[fields[k]]);
        await wait(220);
      }
      await wait(250);
      stamp.classList.add("is-on");
      await wait(3600);
    }
  }
  run();
});
