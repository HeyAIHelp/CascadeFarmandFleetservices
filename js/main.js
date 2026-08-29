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
