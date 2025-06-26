// Redirect if trials weren't completed
if (localStorage.getItem("arcalix_clearance") !== "true") {
	window.location.href = "/arcalix/";
}

window.onload = function () {
	const totalTime = localStorage.getItem("total_time");
	document.getElementById("final-time").textContent = `Your total time: ${totalTime}s`;

	document.getElementById("add-score-btn").addEventListener("click", () => {
		createPrompt("Enter your initials (3 letters):", "ABC", "Submit", (val) => {
			if (!val || val.length !== 3) return alert("Exactly 3 letters, genius.");
			addScore(val.toUpperCase(), totalTime);
		});
	});

	document.getElementById("join-team-btn").addEventListener("click", () => {
		showContactTogglePrompt();
	});

	loadLeaderboard();
};

// Generic reusable prompt
function createPrompt(title, placeholder, submitText, submitCallback) {
	closePrompt(); // Kill duplicates

	const promptBox = document.createElement("div");
	promptBox.className = "custom-prompt";

	promptBox.innerHTML = `
		<h3>${title}</h3>
		<input type="text" id="custom-input" placeholder="${placeholder}" autofocus>
		<div class="btn-group">
			<button id="submit-btn">${submitText}</button>
			<button id="cancel-btn">Cancel</button>
		</div>
	`;

	document.body.appendChild(promptBox);

	document.getElementById("submit-btn").onclick = () => {
		const val = document.getElementById("custom-input").value.trim();
		submitCallback(val);
	};

	document.getElementById("cancel-btn").onclick = closePrompt;
}

// Close any existing prompt
function closePrompt() {
	const existing = document.querySelector('.custom-prompt');
	if (existing) existing.remove();
}

// Leaderboard logic
function addScore(initials, time) {
	const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
	leaderboard.push({ initials, time });
	leaderboard.sort((a, b) => a.time - b.time);
	localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
	loadLeaderboard();
	closePrompt();
}

function loadLeaderboard() {
	const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
	const leaderboardElement = document.getElementById("leaderboard");

	if (!leaderboard.length) {
		leaderboardElement.innerHTML = "No scores yet.";
		return;
	}

	let content = `<pre>Rank  Name     Score\n`;
	leaderboard.forEach((entry, i) => {
		const rank = `${i + 1}.`.padEnd(6, ' ');
		const name = entry.initials.padEnd(8, ' ');
		const score = `${entry.time}s`;
		content += `${rank}${name}${score}\n`;
	});
	content += `</pre>`;

	leaderboardElement.innerHTML = content;
}

// Email/Discord toggle prompt
function showContactTogglePrompt() {
	closePrompt();

	let useDiscord = false;

	const promptBox = document.createElement("div");
	promptBox.className = "custom-prompt";

	promptBox.innerHTML = `
		<h3 id="contact-title">Enter your email:</h3>
		<input type="text" id="contact-input" placeholder="you@example.com" autofocus>
		<div class="btn-group">
			<button id="submit-contact">Submit</button>
			<button id="cancel-contact">Cancel</button>
			<button id="toggle-contact" style="margin-left:auto;">Use Discord Instead</button>
		</div>
		<small>We might reach out. Or not. Life's full of disappointments.</small>
	`;

	document.body.appendChild(promptBox);

	const titleEl = document.getElementById("contact-title");
	const inputEl = document.getElementById("contact-input");
	const toggleBtn = document.getElementById("toggle-contact");

	toggleBtn.onclick = () => {
		useDiscord = !useDiscord;
		titleEl.textContent = useDiscord ? "Enter your Discord username:" : "Enter your email:";
		inputEl.placeholder = useDiscord ? "user#0000" : "you@example.com";
		toggleBtn.textContent = useDiscord ? "Use Email Instead" : "Use Discord Instead";
	};

	document.getElementById("submit-contact").onclick = () => {
		const val = inputEl.value.trim();
		if (!val) return alert("Try entering something this time.");
		localStorage.setItem("team_contact", val);
		alert("You might hear from us. Maybe. Probably not.");
		closePrompt();
	};

	document.getElementById("cancel-contact").onclick = closePrompt;
}
