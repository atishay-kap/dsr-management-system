document.addEventListener("DOMContentLoaded", function () {

  const users = [];

  const roles = [
    "Backend Developer",
    "Frontend Developer",
    "QA Engineer",
    "UI/UX Designer",
    "DevOps Engineer",
    "Product Manager",
    "Mobile Developer",
    "Data Analyst",
    "Security Engineer",
    "Business Analyst"
  ];

  for (let i = 1; i <= 50; i++) {
    users.push({
      id: i,
      name: "User " + i,
      designation: roles[i % roles.length],
      tasks: [
        {
          id: 100 + i,
          title: "Task " + i,
          status: ["In Progress", "Completed", "Pending"][i % 3],
          hours: (2 + (i % 6)) + "h"
        }
      ],
      bugs: [
        {
          id: 300 + i,
          title: "Bug " + i,
          status: ["Open", "Resolved", "In Progress"][i % 3],
          priority: ["Low", "Medium", "High"][i % 3]
        }
      ]
    });
  }

  const USERS_PER_PAGE = 10;
  let currentPage = 1;

  const userGrid = document.getElementById("userGrid");
  const paginationContainer = document.getElementById("pagination");

  function loadUsers(page = 1) {

    currentPage = page;

    const start = (page - 1) * USERS_PER_PAGE;
    const end = start + USERS_PER_PAGE;

    const paginatedUsers = users.slice(start, end);

    userGrid.innerHTML = paginatedUsers.map(user => `
      <div class="user-card-rect" data-id="${user.id}">
        <div class="avatar">${user.name.charAt(0)}</div>
        <h4>${user.name}</h4>
        <p class="designation">${user.designation}</p>
      </div>
    `).join("");

    attachCardListeners();
    renderPagination();
  }

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

  function selectUser(userId) {

    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById("dialogUserName").innerText = user.name;

    const dialogContent = document.getElementById("dialogContent");

    dialogContent.innerHTML = `
      ${renderTaskTable(user.tasks)}
      ${renderBugTable(user.bugs)}
    `;

    document.getElementById("adminDialog").classList.add("active");
  }

  function renderTaskTable(tasks) {

    return `
      <div class="card">
        <h3>Tasks</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr>
                <td>#${task.id}</td>
                <td>${task.title}</td>
                <td><span class="status ${formatClass(task.status)}">${task.status}</span></td>
                <td>${task.hours}</td>
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
              <tr>
                <td>#${bug.id}</td>
                <td>${bug.title}</td>
                <td><span class="status ${formatClass(bug.status)}">${bug.status}</span></td>
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

  document.getElementById("createUserBtn").addEventListener("click", function () {

    e.preventDefault();
    e.stopPropagation();

    const name = document.getElementById("newUserName").value.trim();
    const designation = document.getElementById("newUserDesignation").value.trim();
    const email = document.getElementById("newUserEmail").value.trim();
    const password = document.getElementById("newUserPassword").value;
    const confirmPassword = document.getElementById("confirmUserPassword").value;

    if (password !== confirmPassword) {
      return;
    }

    const newUser = {
      id: users.length + 1,
      name,
      designation,
      email,
      password,
      tasks: [],
      bugs: []
    };

    users.push(newUser);
    closeCreateUserDrawer();
    loadUsers(currentPage);
    createUserForm.reset();
  });

  loadUsers(1);

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
