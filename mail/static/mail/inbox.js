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
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      if (email.archived) {
        // Fetch a PUT request to change "archived" to "false"
        // Using the example in https://cs50.harvard.edu/web/2020/projects/3/mail/
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: false,
          }),
        })
        .then((response) => response.json())
        .then(load_mailbox("inbox"));
        return true;
      } else {
        // Fetch a PUT request to change "archived" to "true"
        // Using the example in https://cs50.harvard.edu/web/2020/projects/3/mail/
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: true,
          }),
        })
        .then((response) => response.json())
        .then(load_mailbox("inbox"));
        load_mailbox("inbox")
        return true;
      }
    });
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
    // Create the div
    const mail_div = document.createElement("div");

    // Insert the email id into the element dataset
    mail_div.dataset.id = mail.id;

    // Give a class to define the BG Color
    mail_div.className = "emailUnread";

    // Create the child element
    const mail_child = document.createElement("a");
    mail_child.className = "d-flex flex-fill";

    // Generate the DIV content
    mail_child.innerHTML = `<div class="flex-fill"><strong>${mail.sender}</strong></div>
    <div class="flex-fill">${mail.subject}</div>
    <div class="flex-fill">${mail.timestamp}</div>`;

    // Add an event listener to go to the respective email view
    mail_child.addEventListener("click", function () {
      view_email(Number.parseInt(this.dataset.id), "inbox");
    });

    // Create the archive button
    const archive_button = document.createElement("button");
    archive_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive" viewBox="0 0 16 16">
    <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
  </svg>`;

    // Add an event listener to actually archive the email
    archive_button.addEventListener("click", function () {
      archive_email(mail.id);
    });

    // Append the child element to the email div
    mail_div.appendChild(mail_child);

    // Append the button to the email div
    mail_div.appendChild(archive_button);

    // Append the DIV in the mailbox
    document.querySelector("#emails-view").append(mail_div);
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
    // Create the div
    const mail_div = document.createElement("div");

    // Insert the email id into the element dataset
    mail_div.dataset.id = mail.id;

    // Give a class to define the BG Color
    mail_div.className = "emailUnread bg-light";

    // Create the child element
    const mail_child = document.createElement("a");
    mail_child.className = "d-flex flex-fill";

    // Generate the DIV content
    mail_child.innerHTML = `<div class="flex-fill"><strong>${mail.sender}</strong></div>
    <div class="flex-fill">${mail.subject}</div>
    <div class="flex-fill">${mail.timestamp}</div>`;

    // Add an event listener to go to the respective email view
    mail_child.addEventListener("click", function () {
      view_email(Number.parseInt(this.dataset.id), "inbox");
    });

    // Create the archive button
    const archive_button = document.createElement("button");
    archive_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive" viewBox="0 0 16 16">
    <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
  </svg>`;

    // Add an event listener to actually archive the email
    archive_button.addEventListener("click", function () {
      archive_email(mail.id);
    });

    // Append the child element to the email div
    mail_div.appendChild(mail_child);

    // Append the button to the email div
    mail_div.appendChild(archive_button);

    // Append the DIV in the mailbox
    document.querySelector("#emails-view").append(mail_div);
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox view and hide other views
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
  // Go to composition form
  compose_email();

  // Get original mail data
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      document.querySelector("#compose-recipients").value = email.sender;
      if (!email.subject.startswith("Re:")) {
        document.querySelector(
          "#compose-subject"
        ).value = `Re: ${email.subject}`;
      } else {
        document.querySelector("#compose-subject").value = email.subject;
      }
      document.querySelector(
        "#compose-body"
      ).value = `On ${email.timestamp} ${email.sender} wrote:
      ${email.body}`;
    });

  return false;
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

  document.querySelector("#reply").addEventListener("click", () => {
    reply_email(id);
  });
}
