document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");

  // Send email logic
  document.querySelector("#compose-form").onsubmit = function () {
    send_email(
      document.querySelector("#compose-recipients").value,
      document.querySelector("#compose-subject").value,
      document.querySelector("#compose-body").value
    );

    return false;
  };
});

function archive_email(id) {
  // TODO
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function createMailDiv(status, mail) {
  // If the email is unead and the mailbox is inbox, white background
  if (!mail.read && status == "inbox") {
    // Create the divs for each email
    const element = document.createElement("div");
    element.dataset.id = mail.id;
    element.className = "emailUnread";
    element.innerHTML = `<div class="emailProperty col"><strong>${mail.sender}</strong></div>
                        <div class="emailProperty col-6">${mail.subject}</div>
                        <divclass="emailProperty col">${mail.timestamp}</div>`;

    element.addEventListener("click", function () {
      view_email(Number.parseInt(this.dataset.id));
    });
    document.querySelector("#emails-view").append(element);
  }

  // Else, if status is "sent", gray background and recipients:
  else if (status == "sent") {
    // Create the divs for each email
    const element = document.createElement("div");
    element.dataset.id = mail.id;
    element.className = "emailRead bg-light";
    element.innerHTML = `<div class="emailProperty col"><strong>${mail.recipients}</strong></div>
                        <div class="emailProperty col-6">${mail.subject}</div>
                        <divclass="emailProperty col">${mail.timestamp}</div>`;

    element.addEventListener("click", function () {
      view_email(Number.parseInt(this.dataset.id));
    });
    document.querySelector("#emails-view").append(element);
  }

  // Else, archived status
  else {
    // Create the divs for each email
    const element = document.createElement("div");
    element.dataset.id = mail.id;
    element.className = "emailRead bg-light";
    element.innerHTML = `<div class="emailProperty col"><strong>${mail.sender}</strong></div>
                        <div class="emailProperty col-6">${mail.subject}</div>
                        <divclass="emailProperty col">${mail.timestamp}</div>`;

    element.addEventListener("click", function () {
      view_email(Number.parseInt(this.dataset.id));
    });
    document.querySelector("#emails-view").append(element);
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Query API for emails
  fetch(`emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails in the log
      console.log(emails);
      // Melhorar esta parte colocando os "if's" em uma função específica, para reaproveitar
      for (let mail in emails) {
        console.log(mail);

        if (mailbox == "inbox") {
          createMailDiv("inbox", emails[mail]);
        } else if (mailbox == "sent") {
          createMailDiv("sent", emails[mail]);
        } else {
          createMailDiv("archived", emails[mail]);
        }
      }
    });

  return false;
}

function reply_email(id) {
  // TODO
}

function send_email(recipients, subject, body) {
  console.log(recipients, subject, body);
  // Using an adapted version from the example in https://cs50.harvard.edu/web/2020/projects/3/mail/
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      if (result["error"]) {
        document.addEventListener("DOMContentLoaded", function () {
          document.querySelector("#email-view").style.display = "none";
          document.querySelector("#emails-view").style.display = "none";
          document.querySelector("#compose-view").style.display = "block";
        });
      } else {
        load_mailbox("sent");
      }
    });
}

function view_email(id) {
  // Using an adapted version from the example in https://cs50.harvard.edu/web/2020/projects/3/mail/
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email in console
      console.log(email);

      // Show the mail view and hide the others views
      document.querySelector("#email-view").style.display = "block";
      document.querySelector("#emails-view").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";

      // Generate the email view
      document.querySelector("#email-view").innerHTML = 
      `<p class="email-header"><strong>From:</strong> ${email.sender}</p>
      <p class="email-header"><strong>To</strong> ${email.recipients}</p>
      <p class="email-header"><strong>Subject:</strong> ${email.subject}</p>
      <p class="email-header"><strong>Timestamp:</strong> ${email.timestamp}</p>
      <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
      <hr>
      <div id="email-body">${email.body}</div>`;
    });
}
