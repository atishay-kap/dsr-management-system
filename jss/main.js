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
let selectedTaskRow = null;


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

function openDetail(row, type) {
  selectedTaskRow = row;
  const cells = row.children;

  document.getElementById("dId").textContent = cells[0].innerText;
  document.getElementById("dTitle").textContent = cells[1].innerText;

  const status = cells[2].innerText.trim();
  const completeBtn = document.querySelector(".complete-btn");
  const resolveBtn = document.querySelector(".resolve-btn");

  completeBtn.style.display = "none";
  resolveBtn.style.display = "none";

  document.getElementById("dStatus").textContent = status;
  document.getElementById("dStatus").className = "status " + statusClass(status);

  if (type === "task") {
    document.getElementById("detailTitle").textContent = "Task Details";
    document.getElementById("dDesc").textContent = "Task description here...";
    completeBtn.style.display = "block";
  }

  if (type === "bug") {
    document.getElementById("detailTitle").textContent = "Bug Details";
    document.getElementById("dDesc").textContent = "Bug description here...";
    resolveBtn.style.display = "block";
  }

  document.getElementById("detailModal").classList.add("show");
}

function closeDetail() {
  document.getElementById("detailModal").classList.remove("show");
}

function statusClass(status) {

  status = status.toLowerCase();

  if (status.includes("progress")) return "in-progress";
  if (status.includes("complete")) return "completed";
  if (status.includes("pending")) return "pending";
  if (status.includes("open")) return "open";
  if (status.includes("resolved")) return "resolved";

  return "";
}

function openCompleted(item) {

  const title = item.querySelector("span").innerText;
  const hours = item.querySelector("small").innerText;

  document.getElementById("cId").textContent = "#C" + Math.floor(Math.random()*1000);
  document.getElementById("cTitle").textContent = title;
  document.getElementById("cDesc").textContent = "Task successfully completed.";
  document.getElementById("cPlan").textContent = hours;
  document.getElementById("cActual").textContent = hours;

  document.getElementById("completedModal").classList.add("show");
}

function closeCompleted() {
  document.getElementById("completedModal").classList.remove("show");
}

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        document.getElementById("taskModal")?.classList.remove("active");

        document.getElementById("detailModal")?.classList.remove("show");

        document.getElementById("completedModal")?.classList.remove("show");
    }
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
            overlay.classList.remove("active");
            overlay.classList.remove("show");
        }
    });
});

function markComplete() {

    if (!selectedTaskRow) return;

    const title = selectedTaskRow.children[1].innerText;
    const hours = selectedTaskRow.children[3].innerText;

    selectedTaskRow.remove();

    const completedList = document.querySelector(".completed-list");

    const li = document.createElement("li");

    li.setAttribute("onclick", "openCompleted(this)");

    li.innerHTML = `
        <span>${title}</span>
        <small>${hours}</small>
    `;

    completedList.prepend(li);

    closeDetail();
    selectedTaskRow = null;

    showToast("Task marked as completed ✅");
}

function markResolved() {
    if (!selectedTaskRow) return;

    const statusCell = selectedTaskRow.children[2];

    statusCell.innerHTML = `
        <span class="status resolved">
            Resolved
        </span>
    `;
    closeDetail();
    selectedTaskRow = null;

    showToast("Bug marked as resolved ✅");
}