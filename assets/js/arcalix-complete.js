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

			// Block HTML injection
			const safeInitials = val.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
			localStorage.setItem("latest_initials", safeInitials); // for highlight
			addScore(safeInitials, totalTime);
		});
	});

	document.getElementById("join-team-btn").addEventListener("click", showContactTogglePrompt);

	const adminBtn = document.getElementById("clear-leaderboard-btn");
	if (adminBtn) {
		adminBtn.addEventListener("click", () => {
			if (confirm("Are you *really* sure you want to nuke the leaderboard?")) {
				localStorage.removeItem("leaderboard");
				localStorage.removeItem("latest_initials");
				loadLeaderboard();
			}
		});
	}

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
	const inputEl = document.getElementById("custom-input");

	inputEl.addEventListener("input", () => {
		inputEl.value = inputEl.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
	});

	document.getElementById("submit-btn").onclick = () => {
		const val = inputEl.value.trim();

		// Sneaky tag check
		if (/</.test(val) || />/.test(val)) {
			alert("Nice try.");
			return;
		}

		submitCallback(val);
	};

	document.getElementById("cancel-btn").onclick = closePrompt;
}

function closePrompt() {
	const existing = document.querySelector('.custom-prompt');
	if (existing) existing.remove();
}

function addScore(initials, time) {
	const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

	const flappy = parseInt(localStorage.getItem("flappy_score") || 0);
	const pong = parseInt(localStorage.getItem("pong_score") || 0);
	const space = parseInt(localStorage.getItem("space_score") || 0);
	const pacman = parseInt(localStorage.getItem("pacman_score") || 0);
	const tetris = parseInt(localStorage.getItem("tetris_score") || 0);
	const total = flappy + pong + space + pacman + tetris;

	const existing = leaderboard.find(e => e.initials === initials);
	if (existing) {
		const oldTotal = existing.flappy + existing.pong + existing.space + existing.pacman + existing.tetris;
		if (total > oldTotal) {
			existing.time = time;
			existing.flappy = flappy;
			existing.pong = pong;
			existing.space = space;
			existing.pacman = pacman;
			existing.tetris = tetris;
		}
	} else {
		leaderboard.push({ initials, time, flappy, pong, space, pacman, tetris });
	}

	leaderboard.sort((a, b) => (b.flappy + b.pong + b.space + b.pacman + b.tetris) - (a.flappy + a.pong + a.space + a.pacman + a.tetris));

	localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
	loadLeaderboard();
	closePrompt();
	showPopup("Score submitted!");
}

function loadLeaderboard() {
	const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
	const leaderboardElement = document.getElementById("leaderboard");
	const latest = localStorage.getItem("latest_initials");
	const highlightEnabled = !!latest;

	if (!leaderboard.length) {
		leaderboardElement.innerHTML = "No scores yet.";
		return;
	}

	let content = `<pre>Rank    Name    Time    | Flappy  Pong    Space   Pacman  Tetris  | Total\n`;

	leaderboard.forEach((entry, i) => {
		const isYou = highlightEnabled && entry.initials === latest;
		const tag = isYou ? `<span class="highlight">` : ``;

		const rank = `${i + 1}.`.padEnd(8);
		const name = entry.initials.padEnd(8);
		const time = `${entry.time}s`.padEnd(8);
		const flappy = String(entry.flappy).padEnd(8);
		const pong = String(entry.pong).padEnd(8);
		const space = String(entry.space).padEnd(8);
		const pacman = String(entry.pacman).padEnd(8);
		const tetris = String(entry.tetris).padEnd(8);
		const total = entry.flappy + entry.pong + entry.space + entry.pacman + entry.tetris;

		content += `${tag}${rank}${name}${time}| ${flappy}${pong}${space}${pacman}${tetris}| ${total}${tag}</pre>`;
	});

	leaderboardElement.innerHTML = content;
}

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
		let val = inputEl.value.trim();

		// Check for HTML injection
		if (/</.test(val) || />/.test(val)) {
			alert("Nice try.");
			return;
		}

		if (!val) return alert("Try entering something this time.");

		if (useDiscord) {
			if (!/^.+#\d{4}$/.test(val)) return alert("That's not a Discord tag, Einstein.");
		} else {
			if (!/@(gmail|hotmail)\.com$/i.test(val)) return alert("Only Gmail and Hotmail addresses are accepted, because reasons.");
		}

		localStorage.setItem("team_contact", val);
		closePrompt();
		showPopup("Contact info submitted!");
	};

	document.getElementById("cancel-contact").onclick = closePrompt;
}

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
