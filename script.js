// SCREENS
const screens = {
    home: document.getElementById("home"),
    project: document.getElementById("project"),
    search: document.getElementById("searchScreen")
};

// Single project data
const project = {
    name: "PROJECT: RAVEN",
    year: 2028,
    status: "In Development",
    format: "Animated Series"
};

// Show screen function
function show(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
}

// NAVIGATION
function goHome() {
    show("home");
}

function openProject() {
    // Update project info dynamically
    document.querySelector(".project-info h1").textContent = project.name;
    document.querySelector(".project-info p:nth-child(2)").textContent = `Year: ${project.year}`;
    document.querySelector(".project-info p:nth-child(3)").textContent = `Status: ${project.status}`;
    document.querySelector(".project-info p:nth-child(4)").textContent = `Format: ${project.format}`;

    show("project");
}

function openSearch() {
    show("search");
}

// SEARCH LOGIC
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

searchInput.addEventListener("input", () => {
    results.innerHTML = "";
    const value = searchInput.value.toLowerCase();

    if (project.name.toLowerCase().includes(value) && value !== "") {
        const div = document.createElement("div");
        div.className = "result";
        div.textContent = project.name;
        div.onclick = openProject;
        results.appendChild(div);
    }
});