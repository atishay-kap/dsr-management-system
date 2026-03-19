const modal = document.getElementById("taskModal");

const modalTitle = document.getElementById("modalTitle");

const labelTitle = document.getElementById("labelTitle");
const labelDesc = document.getElementById("labelDesc");

const inputTitle = document.getElementById("inputTitle");
const inputDesc = document.getElementById("inputDesc");
const inputHours = document.getElementById("inputHours");
const inputStatus = document.getElementById("inputStatus");
const inputTaskType = document.getElementById("inputTaskType");

const statusGroup = document.getElementById("statusGroup");


const hoursGroup = document.getElementById("hoursGroup");
const priorityGroup = document.getElementById("priorityGroup");
const inputPriority = document.getElementById("inputPriority");
const user = JSON.parse(localStorage.getItem("user"));
let tasks=[];
let recentCreatedTaskType = null;

const loggedUser = JSON.parse(localStorage.getItem("user"));

if (loggedUser) {
  const nameEl = document.getElementById("navUserName");
  if (nameEl) {
    nameEl.textContent = `Hi, ${loggedUser.name}`;  
  }
}

if (!user) {
  window.location.href = "index.html";
}

let currentType = "task";
let selectedTaskRow = null;
let selectedTask = null;


function renderTasks() {

  const tbody = document.getElementById("taskTableBody");
  const activeTasks = tasks
    .filter(task => task.status !== "COMPLETED")
    .sort((a, b) => {
      const aInProgress = a.status === "IN_PROGRESS" ? 0 : 1;
      const bInProgress = b.status === "IN_PROGRESS" ? 0 : 1;

      return aInProgress - bInProgress;
    });
  const completedTasks = tasks.filter(task => task.status === "COMPLETED");

  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No tasks</td></tr>`;
    return;
  }

  tbody.innerHTML = activeTasks.map(task => `
    <tr data-id="${task.id}">
      <td>#${task.id}</td>

      <td>${task.title}</td>

      <td>
        <span class="status ${statusClass(task.status)}">
          ${formatStatusLabel(task.status)}
        </span>
      </td>

      <td>
        <span class="type-pill ${(task.type || "MAIN").toLowerCase()}">
          ${task.type || "MAIN"}
        </span>
      </td>

      <td>${task.plannedHours || 0}h</td>
    </tr>
  `).join("");

  renderCompletedTasks(completedTasks);
  attachTaskListeners();
}

function renderCompletedTasks(completedTasks) {

  const container = document.getElementById("completedTasksContainer");

  if (!container) return;

  if (completedTasks.length === 0) {
    container.innerHTML = "<li class='empty'>No completed tasks</li>";
    return;
  }

  container.innerHTML = completedTasks.map(task => `
    <li class="completed-item" onclick="openCompleted(${task.id})">
      
      <div class="completed-left">
        <span class="completed-title">${task.title}</span>
      </div>

      <div class="completed-right">
        <span class="completed-hours">${task.actualHours || 1}h</span>
      </div>

    </li>
  `).join("");
}
function attachTaskListeners() {

  document.querySelectorAll("#taskTableBody tr")
    .forEach(row => {

      row.addEventListener("click", function () {

        const id = parseInt(this.getAttribute("data-id"));
        const task = tasks.find(t => t.id === id);

        if (!task) return;

        openTaskDetail(task,"task");

      });

    });
}

async function loadTasks() {

  try {

    const res = await fetch(`http://localhost:8080/tasks/user/${user.id}`);
    tasks = await res.json();

    renderTasks();

  } catch (err) {
    console.error("Error loading tasks", err);
    showToast("Failed to load tasks", "error");
  }
}

function getTaskTypeFromModalType(type) {
  if (type === "side") return "SIDE";
  if (type === "client") return "CLIENT";
  return "MAIN";
}

function normalizeStatus(status) {
  return status.toUpperCase().replace(/\s+/g, "_");
}

function typeClass(type) {
  const value = (type || "MAIN").toLowerCase();

  if (value.includes("side")) return "side";
  if (value.includes("client")) return "client";
  return "main";
}

function typeLabel(type) {
  const value = (type || "MAIN").toUpperCase();

  if (value.includes("SIDE")) return "Side Task";
  if (value.includes("CLIENT")) return "Client Task";
  return "Main Task";
}

function formatStatusLabel(status) {
  return (status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function openModal(type) {

    currentType = type;

    document.getElementById("modalForm").reset();
    inputTaskType.value = getTaskTypeFromModalType(type);

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

    addToTable(title, desc, hours, inputTaskType.value);
});



async function addToTable(title, desc, hours, selectedType = "MAIN") {

  const typeMap = {
    task: "MAIN",
    side: "SIDE",
    client: "CLIENT"
  };

  let type = selectedType || typeMap[currentType] || "MAIN";

  console.log("Sending type:", type); // 🔥 DEBUG

  try {

    const res = await fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        description: desc,
        plannedHours: parseInt(hours),
        type: type,
        user: { id: user.id }
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Error creating ${typeLabel(type)}`);
    }

    showToast("Task Created Successfully 🎉", "success");

    recentCreatedTaskType = type;
    closeModal();
    await loadTasks();

  } catch (err) {
    console.error(err);
    showToast(err.message || `Error creating ${typeLabel(type)}`, "error");
  }
}

let toastTimeout;

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");
    const icon = document.getElementById("toastIcon");
    const text = document.getElementById("toastText");

    const createdType =
        inputTaskType?.value ||
        getTaskTypeFromModalType(currentType) ||
        recentCreatedTaskType;

    if (
        type === "success" &&
        createdType &&
        message.includes("Task Created Successfully")
    ) {
        message = `${typeLabel(createdType)} created successfully`;
        recentCreatedTaskType = null;
    }

    toast.className = "toast";

    if (type === "success") icon.textContent = "✔️";
    if (type === "bug") icon.textContent = "🐞";
    if (type === "error") icon.textContent = "⚠️";

    text.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
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

function openTaskDetail(item, type = "task") {

  const completeBtn = document.querySelector(".complete-btn");
  const resolveBtn = document.querySelector(".resolve-btn");
  const startBtn = document.querySelector(".start-btn");
  const typeEl = document.getElementById("dType");

  startBtn.style.display = "none";
  completeBtn.style.display = "none";
  resolveBtn.style.display = "none";

  selectedTask = item;

  if (typeEl){
    const type = item.type || "MAIN";
    typeEl.textContent = type;
    typeEl.className = "type-pill " + typeClass(type);
  }
  if (type === "task") {
    if(item.status === "PENDING"){
        startBtn.style.display = "inline-block";
    }
    if(item.status === "IN_PROGRESS"){
        completeBtn.style.display = "inline-block";
    }
  }

  if (type === "bug") {
    resolveBtn.style.display = "inline-block";
  }

  document.getElementById("dId").textContent = "#" + item.id;
  document.getElementById("dTitle").textContent = item.title;
  document.getElementById("dDesc").textContent = item.description || "-";

  const statusEl = document.getElementById("dStatus");
  statusEl.textContent = formatStatusLabel(item.status);
  statusEl.className = "status " + statusClass(item.status);

  document.getElementById("detailModal").classList.add("show");
}

async function startTask() {

  if (!selectedTask) return;

  try {

    await fetch(`http://localhost:8080/tasks/${selectedTask.id}/start`, {
      method: "PUT"
    });

    showToast("Task started 🚀", "success");

    closeDetail();

    await loadTasks();

  } catch (err) {
    console.error(err);
    showToast("Error starting task", "error");
  }
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

window.openCompleted = function(taskId) {

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById("cId").textContent = "#" + task.id;
  document.getElementById("cType").textContent = task.type || "MAIN";
  document.getElementById("cType").className =
    "type-pill " + typeClass(task.type);
  document.getElementById("cTitle").textContent = task.title;
  document.getElementById("cDesc").textContent = task.description || "-";
  document.getElementById("cPlan").textContent = (task.plannedHours || 0) + "h";
  document.getElementById("cActual").textContent = (task.actualHours || 1) + "h";

  document.getElementById("completedModal").classList.add("show");
};

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

async function markComplete() {

  if (!selectedTask) return;

  try {

    await fetch(`http://localhost:8080/tasks/${selectedTask.id}/complete`, {
      method: "PUT"
    });

    showToast("Task marked as completed 🔥", "success");

    closeDetail();

    await loadTasks(); // 🔥 refresh UI

  } catch (err) {
    console.error(err);
    showToast("Error completing task", "error");
  }
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

    showToast("Bug resolved", "bug");

}

loadTasks();

function logout(){
  localStorage.removeItem("user");
  window.location.href = "index.html";
}
