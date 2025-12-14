// Check if user is logged in
const activeUserString = localStorage.getItem("activeUser");

if (!activeUserString) {
  alert("You must login first.");
  window.location.href = "/";
}

let activeUser;

try {
  activeUser = JSON.parse(activeUserString);
} catch (e) {
  alert("Please login again.");
  localStorage.removeItem("activeUser");
  window.location.href = "/";
}

// Load user data
document.getElementById("profileName").value = activeUser.name || "";
document.getElementById("profileEmail").value = activeUser.email || "";

// Save changes
document.getElementById("saveProfile").addEventListener("click", () => {
  const updatedName = document.getElementById("profileName").value;
  const updatedPassword = document.getElementById("profilePassword").value;

  activeUser.name = updatedName;
  localStorage.setItem("activeUser", JSON.stringify(activeUser));

  alert("Profile updated successfully!");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await fetch('/auth/logout', { method: 'POST' });
  } catch (e) {
    console.log('Logout error:', e);
  }
  
  localStorage.removeItem("activeUser");
  alert("You have been logged out!");
  window.location.href = "/";
});