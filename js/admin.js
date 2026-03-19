const user = JSON.parse(localStorage.getItem("user"));
let currentTasks = [];

if (!user || user.role !== "ADMIN") {
  window.location.href = "index.html";
}

function logout(){
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function typeClass(type) {
  const value = (type || "MAIN").toLowerCase();

  if (value.includes("side")) return "side";
  if (value.includes("client")) return "client";
  return "main";
}

function formatStatusLabel(status) {
  return (status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

const loggedUser = JSON.parse(localStorage.getItem("user"));

if (loggedUser) {
  const nameEl = document.getElementById("navUserName");
  if (nameEl) {
    nameEl.textContent = `Hi, ${loggedUser.name}`;  
  }
}

document.addEventListener("DOMContentLoaded", function () {  

  let users = [];
  const USERS_PER_PAGE = 10;
  let currentPage = 1;

  const userGrid = document.getElementById("userGrid");
  const paginationContainer = document.getElementById("pagination");
  async function loadUsers(page = 1) {
    console.log("Users:", users);
    console.log("userGrid:", userGrid);

    currentPage = page;

    try{
      const res = await fetch("http://localhost:8080/users");
      users = await res.json();
    }catch(err){
      showToast("Error loading users","error");
      users=[];
      return;
    }

    const start = (page - 1) * USERS_PER_PAGE;
    const end = start + USERS_PER_PAGE;

    const paginatedUsers = users.slice(start, end);

    userGrid.innerHTML = paginatedUsers.map(user => `
      <div class="user-card-rect" data-id="${user.id}">
        <div class="avatar">${user.name ? user.name.charAt(0) : "U"}</div>
        <h4>${user.name || "Unknown"}</h4>
        <p class="designation">${user.designation || ""}</p>
      </div>
    `).join("");

    attachCardListeners();
    renderPagination();
  }
  loadUsers(1);

  function attachCardListeners() {

    document.querySelectorAll(".user-card-rect")
      .forEach(card => {

        card.addEventListener("click", function () {

          const userId = parseInt(this.getAttribute("data-id"));
          selectUser(userId);

        });

      });
  }

  function renderPagination() {

    const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

    paginationContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {

      const btn = document.createElement("button");

      btn.className = "page-btn";
      btn.textContent = i;

      if (i === currentPage) btn.classList.add("active");

      btn.addEventListener("click", () => loadUsers(i));

      paginationContainer.appendChild(btn);
    }
  }

  async function selectUser(userId) {

    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById("dialogUserName").innerText = user.name;

    const dialogContent = document.getElementById("dialogContent");

    try {
      const res = await fetch(`http://localhost:8080/tasks/user/${userId}`);
      const tasks = await res.json();
      currentTasks = tasks;

      dialogContent.innerHTML = renderTaskTable(tasks);

    } catch (err) {
      showToast("Error loading tasks", "error");
      dialogContent.innerHTML = "<p>Failed to load tasks</p>";
    }

    document.getElementById("adminDialog").classList.add("active");
  }

  function renderTaskTable(tasks) {

    if (!tasks || tasks.length === 0) {
      return `<p style="text-align:center;">No tasks found</p>`;
    }

    return `
      <div class="card">
        <h3>Tasks</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Type</th>
              <th>Planned</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr data-id="${task.id}" onclick="handleTaskClick(this)">
                <td>#${task.id}</td>
                <td>${task.title}</td>
                <td>
                  <span class="status ${formatClass(task.status)}">
                    ${formatStatusLabel(task.status)}
                  </span>
                </td>
                <td>
                  <span class="type-pill ${typeClass(task.type)}">
                    ${task.type || "MAIN"}
                  </span>
                </td>
                <td>${task.plannedHours || 0}</td>
                <td>${task.actualHours || 0}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }





  function renderBugTable(bugs) {

    return `
      <div class="card" style="margin-top:20px;">
        <h3>Bugs</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Bug</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            ${bugs.map(bug => `
              <tr onclick="openAdminDetail(this,'bug')">
                <td>#${bug.id}</td>
                <td>${bug.title}</td>
                <td><span class="status ${formatClass(bug.status)}">${formatStatusLabel(bug.status)}</span></td>
                <td><span class="priority ${bug.priority.toLowerCase()}">${bug.priority}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function formatClass(text) {
    return text.toLowerCase().replace(/\s+/g, "-");
  }

  window.closeDialog = function () {
    document.getElementById("adminDialog").classList.remove("active");
  };

  const createUserForm = document.getElementById("createUserForm");

 document.getElementById("createUserBtn").addEventListener("click", async function (e) {

  e.preventDefault();
  e.stopPropagation();

  const name = document.getElementById("newUserName").value.trim();
  const designation = document.getElementById("newUserDesignation").value.trim();
  const email = document.getElementById("newUserEmail").value.trim();
  const userType = document.getElementById("newUserType").value;
  const password = document.getElementById("newUserPassword").value;
  const confirmPassword = document.getElementById("confirmUserPassword").value;

  if (!name || !designation || !email || !password) {
    showToast("Please fill all fields", "warning");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match!", "error");
    return;
  }

  try {

    await fetch("http://localhost:8080/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        designation,
        email,
        password,
        role: userType.toUpperCase()
      })
    });

    closeCreateUserDrawer();
    createUserForm.reset();

    loadUsers(currentPage);

    showToast("User created successfully!","success");

  } catch (err) {
    showToast("Error creating user","error");
  }

});

document.addEventListener("keydown", function (e) {

  if (e.key === "Escape") {

    const adminDialog = document.getElementById("adminDialog");

    if (adminDialog?.classList.contains("active")) {
      adminDialog.classList.remove("active");
    }

    const drawer = document.getElementById("createUserDrawer");

    if (drawer?.classList.contains("active")) {
      drawer.classList.remove("active");
    }

    const detailModal = document.getElementById("adminDetailModal");

    if (detailModal?.classList.contains("active")) {
      detailModal.classList.remove("active");
    }

  }

});

window.openCreateUserDrawer = function () {
  document.getElementById("createUserDrawer").classList.add("active");
};

window.closeCreateUserDrawer = function () {
  document.getElementById("createUserDrawer").classList.remove("active");
};

window.togglePassword = function(id) {

  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }

};

function showToast(message, type = "success") {

  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "✔";

    if (type === "error") icon = "✖";
    if (type === "warning") icon = "⚠";

    toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
    `;

  container.prepend(toast);

  const timer = setTimeout(() => {

    toast.classList.add("hide");

    setTimeout(() => {
      toast.remove();
    }, 350);

  }, 4000);

  toast.addEventListener("mouseenter", () => clearTimeout(timer));
}

window.openAdminDetail = function(row,type){

  const cells = row.children;

  document.getElementById("adminDId").textContent = cells[0].innerText;
  document.getElementById("adminDTitle").textContent = cells[1].innerText;

  const status = cells[2].innerText.trim();
  const statusEl = document.getElementById("adminDStatus");

  statusEl.textContent = status;
  statusEl.className = "status " + status.toLowerCase().replace(/\s+/g,"-");

  const hoursRow = document.getElementById("adminHoursRow");
  const priorityRow = document.getElementById("adminPriorityRow");

  if(type === "task"){

    hoursRow.style.display="flex";
    priorityRow.style.display="none";

    document.getElementById("adminDHours").textContent = cells[3].innerText;

    document.getElementById("adminDetailTitle").innerText="Task Details";
  }

  if(type === "bug"){

    hoursRow.style.display="none";
    priorityRow.style.display="flex";

    const priority = cells[3].innerText.trim();

    const p = document.getElementById("adminDPriority");
    p.textContent = priority;
    p.className="priority "+priority.toLowerCase();

    document.getElementById("adminDetailTitle").innerText="Bug Details";
  }

  document.getElementById("adminDetailModal").classList.add("active");

}



window.closeAdminDetail = function(){

  document.getElementById("adminDetailModal").classList.remove("active");

}

});

window.handleTaskClick = function(row) {
  const id = parseInt(row.getAttribute("data-id"));
  
  const task = currentTasks.find(t => t.id === id);

  if (!task) {
    console.error("Task not found in currentTasks:", id);
    return;
  }

  openTaskDetail(task);
};

window.openTaskDetail = function(task) {
  const headerEl = document.getElementById("adminDetailTitle");
  const idEl = document.getElementById("adminDId");
  const titleEl = document.getElementById("adminDTitle");
  const statusEl = document.getElementById("adminDStatus");
  const hoursEl = document.getElementById("adminDHours");
  const container = document.getElementById("detailContent");

  if (titleEl) headerEl.innerText = "Task Details";
  if (idEl) idEl.textContent = "#" + task.id;
  if (titleEl) titleEl.textContent = task.title || "-";

  if (statusEl) {
    statusEl.textContent = formatStatusLabel(task.status);
    statusEl.className = "status " + task.status.toLowerCase().replace(/\s+/g, "-");
  }

  if (hoursEl) {
    hoursEl.textContent = `${task.plannedHours || 0} / ${task.actualHours || 0}`;
  }

  document.getElementById("adminHoursRow").style.display = "flex";

  if (container) {
    container.querySelectorAll(".extra-row").forEach(e => e.remove());
    const extra = document.createElement("div");
    extra.classList.add("extra-row");
    extra.innerHTML = `
      <div class="detail-row">
        <span>Type</span>
        <strong>
          <span class="type-pill ${typeClass(task.type)}">
            ${task.type || "MAIN"}
          </span>
        </strong>
      </div>

      <div class="detail-row">
        <span>Description</span>
        <strong>${task.description || "-"}</strong>
      </div>

      <div class="detail-row">
        <span>Created</span>
        <strong>${formatDate(task.createdTime)}</strong>
      </div>

      <div class="detail-row">
        <span>Start</span>
        <strong>${formatDate(task.startTime)}</strong>
      </div>

      <div class="detail-row">
        <span>End</span>
        <strong>${formatDate(task.endTime)}</strong>
      </div>
    `;
    container.appendChild(extra);
  }

  document.getElementById("adminDetailModal").classList.add("active");
};

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}
