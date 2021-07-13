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

function create_mail_div(status, mail) {
  // If the email is unread and the mailbox is inbox, white background
  if (!mail.read && status == "inbox") {
    // Create the element
    const element = document.createElement("div");
    // Insert the email id into the element dataset
    element.dataset.id = mail.id;
    // Give a class to define the BG Color
    element.className = "emailUnread";
    // Generate the DIV content
    element.innerHTML = `<div class="emailProperty col"><strong>${mail.sender}</strong></div>
                        <div class="emailProperty col-6">${mail.subject}</div>
                        <divclass="emailProperty col">${mail.timestamp}</div>`;

    // Add an event listener to go to the respective email view
    element.addEventListener("click", function () {
      view_email(Number.parseInt(this.dataset.id), "inbox");
    });
    // Append the DIV in the mailbox
    document.querySelector("#emails-view").append(element);
  }

  // Else if status is "sent", gray background and recipients:
  else if (status == "sent") {
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

  // Else, if the status is archived or the email is read (in the inbox)
  else {
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
      // Log the emails in the mailbox
      console.log(emails);
      // Generate a div to each email in the mailbox
      for (let mail in emails) {
        if (mailbox == "inbox") {
          create_mail_div("inbox", emails[mail]);
        } else if (mailbox == "sent") {
          create_mail_div("sent", emails[mail]);
        } else {
          create_mail_div("archived", emails[mail]);
        }
      }
    });

  return false;
}

function mark_email_read(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      if (!email.read) {
        fetch(`/emails/${email.id}`, {
          method: "PUT",
          body: JSON.stringify({
            read: true,
          }),
        });
      }
      console.log(email.read);
    });
}

function reply_email(id) {
  // TODO
}

function send_email(recipients, subject, body) {
  // Log the information that has been submitted
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
      // Log the result
      console.log(result);
      // If the result is an error, return to the compose view
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

function view_email(id, mailbox) {
  // Using an adapted version from the example in https://cs50.harvard.edu/web/2020/projects/3/mail/
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email in console
      console.log(email);

      // Mark the email as read if it isn't
      if (mailbox == "inbox") {
        mark_email_read(Number.parseInt(email.id));
      }

      // Show the email view and hide the others views
      document.querySelector("#email-view").style.display = "block";
      document.querySelector("#emails-view").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";

      // Generate the email view
      document.querySelector(
        "#email-view"
      ).innerHTML = `<p class="email-header"><strong>From:</strong> ${email.sender}</p>
      <p class="email-header"><strong>To</strong> ${email.recipients}</p>
      <p class="email-header"><strong>Subject:</strong> ${email.subject}</p>
      <p class="email-header"><strong>Timestamp:</strong> ${email.timestamp}</p>
      <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
      <hr>
      <div id="email-body">${email.body}</div>`;
    });
}
