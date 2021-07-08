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

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
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

      /* Create a div for each email, inside, create 3 divs: 
         one to show the sender, one to show the subject and one for timestamp.
         Code e.g. in the project page. */
      // Put the content of each email in the divs
      for (let mail in emails) { 
        console.log(mail);
        // If mail unread (Style accordingly)
        if (!mail.read) {
          // Create the divs for each email
          const element = document.createElement("div");
          element.innerHTML = `<div class="emailUnread">
                                <div class="emailProperty"><strong>${emails[mail].sender}</strong></div>
                                <div class="emailProperty">${emails[mail].subject}</div>
                                <divclass="emailProperty">${emails[mail].timestamp}</div>
                               </div>`;
          element.addEventListener("click", function () {
            console.log("This element has been clicked!");
          });
          document.querySelector("#emails-view").append(element);
        } else {
          // TODO (email read)
        }
      }

      /* NOTE: 
      If the email is unread, it should appear with a white background. 
      If the email has been read, it should appear with a gray background.*/
    });
}

function send_email(recipients, subject, body) {
  console.log(recipients, subject, body);
  // Using the example from https://cs50.harvard.edu/web/2020/projects/3/mail/
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
          document.querySelector("#emails-view").style.display = "none";
          document.querySelector("#compose-view").style.display = "block";
        });
      } else {
        load_mailbox("sent");
      }
    });
}
