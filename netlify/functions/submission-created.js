// Fires automatically whenever a Netlify Form on this site is submitted
// (Netlify calls this "submission-created" — no extra setup needed beyond
// deploying this file and setting the RESEND_API_KEY environment variable
// in Site configuration > Environment variables in the Netlify dashboard).
//
// Sends a branded thank-you autoreply straight to the customer's email
// address (the one they typed into the new Email field on the contact
// form) using the Resend email API. If they left the email field blank,
// this quietly does nothing — the request still shows up as a Netlify
// Forms notification either way.

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    // Netlify has used a couple of slightly different payload shapes over
    // the years, so check both the wrapped and unwrapped forms.
    const submission = body.payload || body;
    const data = submission.data || {};

    const email = data.email || submission.email;
    const name = data.name || submission.name || "there";

    if (!email) {
      console.log("submission-created: no email on this submission, skipping autoreply");
      return { statusCode: 200, body: "no email, skipped" };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("submission-created: RESEND_API_KEY is not set in environment variables");
      return { statusCode: 500, body: "missing api key" };
    }

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#222; max-width:560px; margin:0 auto;">
        <img src="https://cascadefarmandfleetservices.com/images/cascade-logo.png" alt="Cascade Farm and Fleet Services" style="max-width:220px; margin-bottom:24px;">
        <p>Hi ${name},</p>
        <p>Thank you for contacting us. We've received your message and will reply as soon as possible.</p>
        <p>Please note that during certain seasons we get very busy, so if you haven't heard back from us within 3 days, please give us a call at <a href="tel:+15033029220">(503) 302-9220</a>.</p>
        <p>Thank you,<br>Jeremy Birch<br>Owner / Diesel Mechanic<br>Cascade Farm and Fleet Services</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Cascade Farm and Fleet Services <onboarding@resend.dev>",
        to: [email],
        subject: "Thank you for contacting Cascade Farm and Fleet Services",
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("submission-created: Resend API error", res.status, errText);
      return { statusCode: 502, body: "email send failed" };
    }

    console.log(`submission-created: autoreply sent to ${email}`);
    return { statusCode: 200, body: "sent" };
  } catch (err) {
    console.error("submission-created: unexpected error", err);
    return { statusCode: 500, body: "error" };
  }
};
