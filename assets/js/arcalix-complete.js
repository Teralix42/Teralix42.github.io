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
	closePrompt();

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

function closePrompt() {
	const existing = document.querySelector('.custom-prompt');
	if (existing) existing.remove();
}

// Score logic
function addScore(initials, time) {
	const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

	// Placeholder for now — replace 0s with real scores when you have them
	const entry = {
		initials,
		time,
		flappy: parseInt(localStorage.getItem("flappy_score") || 0),
		pong: parseInt(localStorage.getItem("pong_score") || 0),
		space: parseInt(localStorage.getItem("space_score") || 0),
		pacman: parseInt(localStorage.getItem("pacman_score") || 0),
		tetris: parseInt(localStorage.getItem("tetris_score") || 0)
	};

	leaderboard.push(entry);
	leaderboard.sort((a, b) => a.time - b.time);
	localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
	loadLeaderboard();
	closePrompt();
	showPopup("Score submitted!");
}

function loadLeaderboard() {
	const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
	const leaderboardElement = document.getElementById("leaderboard");

	if (!leaderboard.length) {
		leaderboardElement.innerHTML = "No scores yet.";
		return;
	}

	let content = `<pre>Rank    Name    Time  |  Flappy  Pong  Space  Pacman  Tetris    Total\n`;

	leaderboard.forEach((entry, i) => {
		const rank = `${i + 1}.`.padEnd(8);
		const name = entry.initials.padEnd(8);
		const time = `${entry.time}s`.padEnd(9);

		const flappy = String(entry.flappy).padEnd(8);
		const pong = String(entry.pong).padEnd(6);
		const space = String(entry.space).padEnd(7);
		const pacman = String(entry.pacman).padEnd(8);
		const tetris = String(entry.tetris).padEnd(10);

		const total = entry.flappy + entry.pong + entry.space + entry.pacman + entry.tetris;

		content += `${rank}${name}${time}${flappy}${pong}${space}${pacman}${tetris}${total}\n`;
	});

	content += `</pre>`;
	leaderboardElement.innerHTML = content;
}

// Toggle prompt between email and Discord
function showContactTogglePrompt() {
	closePrompt();

	let useDiscord = false;

	const promptBox = document.createElement("div");
	promptBox.className = "custom-prompt";

	promptBox.innerHTML = `
		<h3 id="contact-title">Enter your email:</h3>
		<input type="text" id="contact-input" placeholder="you@gmail.com" autofocus>
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
		inputEl.placeholder = useDiscord ? "user#0000" : "you@gmail.com";
		toggleBtn.textContent = useDiscord ? "Use Email Instead" : "Use Discord Instead";
	};

	document.getElementById("submit-contact").onclick = () => {
		const val = inputEl.value.trim();
		if (!val) return alert("Try entering something this time.");

		if (useDiscord) {
			// Simple Discord check (not perfect, just enough)
			if (!/^.+#\d{4}$/.test(val)) return alert("That's not a Discord tag, Einstein.");
		} else {
      // Gmail/Hotmail mail check
			if (!/@(gmail|hotmail)\.com$/i.test(val)) return alert("Only Gmail and Hotmail addresses are accepted, because reasons.");
		}

		localStorage.setItem("team_contact", val);
		closePrompt();
		showPopup("Contact info submitted!");
	};

	document.getElementById("cancel-contact").onclick = closePrompt;
}

// Basic popup
function showPopup(message) {
	const popup = document.createElement("div");
	popup.className = "custom-popup";
	popup.textContent = message;

	document.body.appendChild(popup);
	setTimeout(() => popup.classList.add("visible"), 10);
	setTimeout(() => {
		popup.classList.remove("visible");
		setTimeout(() => popup.remove(), 500);
	}, 2500);
}
