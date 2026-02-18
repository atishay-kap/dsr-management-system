const modal = document.getElementById("taskModal");

const modalTitle = document.getElementById("modalTitle");

const labelTitle = document.getElementById("labelTitle");
const labelDesc = document.getElementById("labelDesc");

const inputTitle = document.getElementById("inputTitle");
const inputDesc = document.getElementById("inputDesc");
const inputHours = document.getElementById("inputHours");
const inputStatus = document.getElementById("inputStatus");

const statusGroup = document.getElementById("statusGroup");


const hoursGroup = document.getElementById("hoursGroup");
const priorityGroup = document.getElementById("priorityGroup");
const inputPriority = document.getElementById("inputPriority");

let currentType = "task";


function openModal(type) {

    currentType = type;

    document.getElementById("modalForm").reset();

    let config = {
        title: "Create Task",
        labelTitle: "Task Title",
        labelDesc: "Task Description",

        showHours: true,
        showStatus: true,
        showPriority: false
    };


    if (type === "side") {
        config.title = "Create Side Task";
    }

    if (type === "client") {
        config.title = "Create Client Task";
    }

    if (type === "bug") {

        config.title = "Create Bug";

        config.labelTitle = "Bug Title";
        config.labelDesc = "Bug Description";

        config.showHours = false;
        config.showStatus = true;
        config.showPriority = true;
    }


    modalTitle.textContent = config.title;

    labelTitle.textContent = config.labelTitle;
    labelDesc.textContent = config.labelDesc;

    hoursGroup.style.display = config.showHours ? "block" : "none";
    statusGroup.style.display = config.showStatus ? "block" : "none";
    priorityGroup.style.display = config.showPriority ? "block" : "none";


    modal.classList.add("active");
}



function closeModal() {
    modal.classList.remove("active");
}


modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

document.getElementById("modalForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = inputTitle.value.trim();
    const desc = inputDesc.value.trim();
    const hours = inputHours ? inputHours.value.trim() : "";

    if (title === "") {
        alert("Title is required");
        return;
    }

    if (currentType !== "bug") {

        if (hours === "" || hours <= 0) {
            alert("Enter valid hours");
            return;
        }
    }

    addToTable(title, desc, hours);

    closeModal();
});



function addToTable(title, desc, hours) {

    if (currentType === "bug") {
        addBug(title);
    } else {
        addTask(title, hours);
    }

    showToast("Created successfully ✅");
}

let toastTimeout;

function showToast(msg, type = "success") {

    const toast = document.getElementById("toast");
    const text = document.getElementById("toastText");
    const icon = document.getElementById("toastIcon");

    text.textContent = msg;

    if (type === "success") {
        icon.textContent = "✅";
    }

    if (type === "error") {
        icon.textContent = "❌";
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function addTask(title, hours) {

    const table = document.querySelector("#taskTable tbody");

    const status = inputStatus.value;

    const id = Math.floor(Math.random() * 900 + 100);

    let statusClass = "in-progress";

    if (status === "Pending") statusClass = "pending";
    if (status === "Completed") statusClass = "completed";

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>#${id}</td>
        <td>${title}</td>
        <td>
            <span class="status ${statusClass}">
                ${status}
            </span>
        </td>
        <td>${hours}h</td>
    `;

    table.prepend(row);
}

function addBug(title) {

    const table = document.querySelector("#bugTable tbody");

    const id = Math.floor(Math.random() * 900 + 200);

    const status = inputStatus.value;
    const priority = inputPriority.value;


    let statusClass = "open";
    if (status === "In Progress") statusClass = "in-progress";
    if (status === "Resolved") statusClass = "resolved";

    let priorityClass = "medium";
    if (priority === "High") priorityClass = "high";
    if (priority === "Low") priorityClass = "low";


    const row = document.createElement("tr");

    row.innerHTML = `
        <td>#${id}</td>
        <td>${title}</td>

        <td>
            <span class="status ${statusClass}">
                ${status}
            </span>
        </td>

        <td>
            <span class="priority ${priorityClass}">
                ${priority}
            </span>
        </td>
    `;

    table.prepend(row);
}

