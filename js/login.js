async function login(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const user = await res.json();

    // store user
    localStorage.setItem("user", JSON.stringify(user));

    // redirect based on role
    if (user.role === "ADMIN") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (err) {
    alert("Invalid email or password ❌");
  }
}