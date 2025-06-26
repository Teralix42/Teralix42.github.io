// Check if the user has completed the trials and redirect if not
if (localStorage.getItem("arcalix_clearance") !== "true") {
  window.location.href = "/arcalix/";
}

window.onload = function () {
  // Display total time
  const totalTime = localStorage.getItem("total_time");
  document.getElementById("final-time").textContent = `Your total time: ${totalTime}s`;

  // Handle "Add My Score"
  document.getElementById("add-score-btn").onclick = function () {
    showInitialsPrompt(totalTime);
  };

  // Handle "Join the Team"
  document.getElementById("join-team-btn").onclick = function () {
    showContactPrompt();
  };

  // Load the leaderboard
  loadLeaderboard();
};

// Function to show custom initials prompt
function showInitialsPrompt(time) {
  const promptBox = document.createElement("div");
  promptBox.id = "initials-prompt";
  promptBox.className = "custom-prompt";

  promptBox.innerHTML = `
    <h3>Enter your initials (3 letters):</h3>
    <input type="text" id="initials-input" maxlength="3" autofocus>
    <button onclick="addScore(document.getElementById('initials-input').value, ${time})">Submit</button>
    <button onclick="closePrompt()">Cancel</button>
  `;
  
  document.body.appendChild(promptBox);
}

// Function to close the custom prompt
function closePrompt() {
  const promptBox = document.getElementById("initials-prompt");
  promptBox.remove();
}

// Function to add the user's score to the leaderboard
function addScore(initials, time) {
  // If initials are invalid (empty or not 3 characters), don't submit
  if (!initials || initials.length !== 3) {
    alert("Please enter exactly 3 letters for your initials.");
    return;
  }

  // This is a placeholder — save to Firebase or JSON here
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  leaderboard.push({ initials: initials.toUpperCase(), time: time });
  leaderboard.sort((a, b) => a.time - b.time); // Sort by fastest time

  // Update leaderboard in localStorage
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  // Reload leaderboard
  loadLeaderboard();

  // Close prompt
  closePrompt();
}

// Function to load the leaderboard in a retro style
function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const leaderboardElement = document.getElementById("leaderboard");

  if (leaderboard.length === 0) {
    leaderboardElement.innerHTML = "No scores yet.";
  } else {
    leaderboardElement.innerHTML = "<pre>";  // Use <pre> for retro monospacing
    leaderboard.forEach((score, index) => {
      leaderboardElement.innerHTML += `${index + 1}. ${score.initials} - ${score.time}s\n`;
    });
    leaderboardElement.innerHTML += "</pre>";
  }
}

// Function to show custom prompt for "Join the Team"
function showContactPrompt() {
  const promptBox = document.createElement("div");
  promptBox.id = "contact-prompt";
  promptBox.className = "custom-prompt";

  promptBox.innerHTML = `
    <h3>Enter your email or Discord username:</h3>
    <input type="text" id="contact-input" autofocus>
    <button onclick="joinTeam(document.getElementById('contact-input').value)">Submit</button>
    <button onclick="closePrompt()">Cancel</button>
  `;
  
  document.body.appendChild(promptBox);
}

// Function to handle joining the team (email or Discord)
function joinTeam(contactMethod) {
  // Save the contact method (this is a placeholder, would integrate with a backend like Formspree)
  if (!contactMethod) {
    alert("Please enter a valid email or Discord username.");
    return;
  }

  localStorage.setItem("team_contact", contactMethod);
  alert("You’ll be contacted soon (if we feel like it).");

  closePrompt();
}
