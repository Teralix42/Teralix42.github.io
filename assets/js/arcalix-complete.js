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
    const initials = prompt("Enter your initials:");
    if (initials) {
      addScore(initials, totalTime);
    }
  };

  // Handle "Join the Team"
  document.getElementById("join-team-btn").onclick = function () {
    const contactMethod = prompt("Enter your email or Discord username:");
    if (contactMethod) {
      joinTeam(contactMethod);
    }
  };

  // Load the leaderboard
  loadLeaderboard();
};

// Function to add the user's score
function addScore(initials, time) {
  // This is a placeholder — save to Firebase or JSON here
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  leaderboard.push({ initials: initials, time: time });
  leaderboard.sort((a, b) => a.time - b.time); // Sort by fastest time

  // Update leaderboard in localStorage
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  // Reload leaderboard
  loadLeaderboard();
}

// Function to load the leaderboard
function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const leaderboardElement = document.getElementById("leaderboard");

  if (leaderboard.length === 0) {
    leaderboardElement.textContent = "No scores yet.";
  } else {
    leaderboardElement.innerHTML = "<ul>";
    leaderboard.forEach((score, index) => {
      leaderboardElement.innerHTML += `<li>${score.initials}: ${score.time}s</li>`;
    });
    leaderboardElement.innerHTML += "</ul>";
  }
}

// Function to handle joining the team (email or Discord)
function joinTeam(contactMethod) {
  // Save the contact method (this is a placeholder, would integrate with a backend like Formspree)
  localStorage.setItem("team_contact", contactMethod);
  alert("You’ll be contacted soon (if we feel like it).");
}
