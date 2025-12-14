/* ---------------------------------------------------------
   WEB SCRAPING - LOAD MOVIES BUTTON
--------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  const loadMoviesBtn = document.getElementById('loadScrapedMovies');
  if (loadMoviesBtn) {
    loadMoviesBtn.addEventListener('click', async () => {
      showCustomAlert('Loading...', 'Fetching latest movies from IMDb', '⏳', 'info');
      
      try {
        const response = await fetch('/api/tmdb/load-movies?page=1&type=upcoming');
        const data = await response.json();
        
        if (data.success) {
          closeCustomAlert();
          setTimeout(() => {
            showCustomAlert('Success!', `Loaded ${data.count} movies from IMDb`, '✅', 'success');
          }, 300);
          
          // Display scraped movies
          displayScrapedMovies(data.movies);
        } else {
          showCustomAlert('Failed', 'Could not fetch movies', '❌', 'warning');
        }
      } catch (error) {
        showCustomAlert('Error', 'Network error occurred', '⚠️', 'warning');
      }
    });
  }
});

function displayScrapedMovies(movies) {
  const movieGrid = document.querySelector('.movie-grid');
  if (!movieGrid) return;
  
  // Clear existing movies
  movieGrid.innerHTML = '';
  
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-genre', movie.genre);
    
    card.innerHTML = `
      <img src="${movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}" class="movie-poster" />
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p class="release-date">Releasing: ${movie.release_date}</p>
        <div class="movie-stats">
          <span class="hit">Predicted ${movie.predicted}</span>
          <span class="rating">⭐ ${movie.rating}</span>
        </div>
        <textarea class="comment-input hidden" placeholder="Write a comment..."></textarea>
        <button class="submit-comment hidden btn-primary">Post Comment</button>
        <div class="comments"></div>
      </div>
    `;
    
    movieGrid.appendChild(card);
  });
  
  // Re-attach comment event listeners
  attachCommentListeners();
}


function attachCommentListeners() {
  document.querySelectorAll(".submit-comment").forEach((btn, index) => {
    btn.addEventListener("click", async () => {
      if (!loggedInUser) {
        showCustomAlert('Login Required', 'Please login to share your thoughts!', '🎬', 'warning');
        return;
      }

      const textarea = document.querySelectorAll(".comment-input")[index];
      const commentBox = document.querySelectorAll(".comments")[index];
      const movieTitle = document.querySelectorAll(".movie-card h3")[index].textContent;

      const comment = textarea.value.trim();
      if (comment === "") {
        showCustomAlert('Empty Comment', 'Please write something!', '📝', 'warning');
        return;
      }

      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include',
          body: JSON.stringify({
            movie_title: movieTitle,
            comment: comment,
            rating: 4.5
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          const p = document.createElement("p");
          p.innerHTML = `<strong>${loggedInUser}:</strong> ${comment}`;
          commentBox.appendChild(p);
          textarea.value = "";
          showCustomAlert('Comment Posted!', 'Your review has been added', '💬', 'success');
        } else {
          showCustomAlert('Failed', data.error || 'Could not post comment', '❌', 'warning');
        }
      } catch (error) {
        showCustomAlert('Error', 'Unable to post comment', '⚠️', 'warning');
      }
    });
  });
}

/* ---------------------------------------------------------
   CUSTOM ALERT FUNCTION
--------------------------------------------------------- */
function showCustomAlert(title, message, icon = '🔒', iconType = 'warning') {
  const alertModal = document.getElementById('customAlert');
  const alertIcon = document.getElementById('alertIcon');
  const alertTitle = document.getElementById('alertTitle');
  const alertMessage = document.getElementById('alertMessage');
  
  alertIcon.textContent = icon;
  alertIcon.className = `custom-alert-icon ${iconType}`;
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  
  alertModal.classList.add('show');
}

function closeCustomAlert() {
  document.getElementById('customAlert').classList.remove('show');
}

// Close alert when clicking outside
document.addEventListener('DOMContentLoaded', function() {
  const customAlert = document.getElementById('customAlert');
  if (customAlert) {
    customAlert.addEventListener('click', function(e) {
      if (e.target === customAlert) {
        closeCustomAlert();
      }
    });
  }
});

/* ---------------------------------------------------------
   DROPDOWN MENUS
--------------------------------------------------------- */
let loggedInUser = null;

const dropdownButtons = document.querySelectorAll(".filter-btn");
const dropdownMenus = document.querySelectorAll(".dropdown");

dropdownButtons.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns(index);
    dropdownMenus[index].style.display =
      dropdownMenus[index].style.display === "block" ? "none" : "block";
  });
});

function closeAllDropdowns(exceptIndex) {
  dropdownMenus.forEach((menu, i) => {
    if (i !== exceptIndex) menu.style.display = "none";
  });
}

document.addEventListener("click", () => {
  dropdownMenus.forEach((menu) => (menu.style.display = "none"));
});

/* ---------------------------------------------------------
   PROFILE BUTTON TOGGLE
--------------------------------------------------------- */
function updateHeaderForLogin() {
  document.getElementById("profileBtn").classList.remove("hidden");
  document.getElementById("openLogin").classList.add("hidden");
  document.getElementById("openSignup").classList.add("hidden");
}

function updateHeaderForLogout() {
  document.getElementById("profileBtn").classList.add("hidden");
  document.getElementById("openLogin").classList.remove("hidden");
  document.getElementById("openSignup").classList.remove("hidden");
  loggedInUser = null;
}

// Check if user is logged in on page load
const activeUserData = localStorage.getItem("activeUser");
if (activeUserData) {
  try {
    const activeUser = JSON.parse(activeUserData);
    loggedInUser = activeUser.name;
    updateHeaderForLogin();
    enableCommenting();
  } catch (e) {
    localStorage.removeItem("activeUser");
  }
}

/* ---------------------------------------------------------
   LOGIN MODAL
--------------------------------------------------------- */
const loginModal = document.getElementById("loginModal");
const openLogin = document.getElementById("openLogin");
const closeLogin = document.getElementById("closeLogin");

openLogin.addEventListener("click", () => {
  loginModal.classList.remove("hidden");
});

closeLogin.addEventListener("click", () => {
  loginModal.classList.add("hidden");
});

loginModal.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.classList.add("hidden");
});

// LOGIN SUBMIT - CONNECTED TO FLASK BACKEND
document.querySelector("#loginModal .btn-primary").addEventListener("click", async () => {
  const email = document.querySelector("#loginModal input[type='email']").value;
  const password = document.querySelector("#loginModal input[type='password']").value;
  
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      loggedInUser = data.username;
      
      const user = {
        name: data.username,
        email: email
      };
      
      localStorage.setItem("activeUser", JSON.stringify(user));
      
      showCustomAlert('Welcome Back!', `Logged in as ${loggedInUser}`, '✅', 'success');
      
      // Update UI to show Profile button
      updateHeaderForLogin();
      enableCommenting();
      
      loginModal.classList.add("hidden");
    } else {
      showCustomAlert('Login Failed', data.error || 'Invalid credentials', '❌', 'warning');
    }
  } catch (error) {
    showCustomAlert('Error', 'Unable to connect to server', '⚠️', 'warning');
  }
});

/* ---------------------------------------------------------
   SIGNUP MODAL
--------------------------------------------------------- */
const signupModal = document.getElementById("signupModal");
const openSignup = document.getElementById("openSignup");
const closeSignup = document.getElementById("closeSignup");

openSignup.addEventListener("click", () => {
  signupModal.classList.remove("hidden");
});

closeSignup.addEventListener("click", () => {
  signupModal.classList.add("hidden");
});

signupModal.addEventListener("click", (e) => {
  if (e.target === signupModal) signupModal.classList.add("hidden");
});

// SIGNUP SUBMIT - CONNECTED TO FLASK BACKEND
document.querySelector("#signupModal .btn-primary").addEventListener("click", async () => {
  const name = document.querySelector("#signupModal input[type='text']").value;
  const email = document.querySelector("#signupModal input[type='email']").value;
  const password = document.querySelector("#signupModal input[type='password']").value;

  try {
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({ username: name, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showCustomAlert('Account Created!', 'Please login with your new account', '🎉', 'success');
      signupModal.classList.add("hidden");
      loginModal.classList.remove("hidden");
    } else {
      showCustomAlert('Signup Failed', data.error || 'Could not create account', '❌', 'warning');
    }
  } catch (error) {
    showCustomAlert('Error', 'Unable to connect to server', '⚠️', 'warning');
  }
});

/* ---------------------------------------------------------
   FILTER SELECTION
--------------------------------------------------------- */
dropdownMenus.forEach((menu) => {
  const options = menu.querySelectorAll("p");
  options.forEach((option) => {
    option.addEventListener("click", () => {
      showCustomAlert('Filter Selected', `You selected: ${option.textContent}`, '🎯', 'info');
      menu.style.display = "none";
    });
  });
});

/* ----------------------------------------------
   SEARCH FUNCTION
------------------------------------------------ */
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const movieCards = document.querySelectorAll(".movie-card");

searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchMovies();
});

function searchMovies() {
  const value = searchInput.value.toLowerCase();
  let foundCount = 0;
  
  movieCards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const description = card.querySelector(".release-date").textContent.toLowerCase();
    const rating = card.querySelector(".rating").textContent.toLowerCase();

    if (title.includes(value) || description.includes(value) || rating.includes(value)) {
      card.style.display = "block";
      foundCount++;
    } else {
      card.style.display = "none";
    }
  });
  
  if (value && foundCount === 0) {
    showCustomAlert('No Results', 'No movies found matching your search', '🔍', 'info');
  }
}

/* --------------------------------------------------------------
   COMMENT SYSTEM
---------------------------------------------------------------- */
function enableCommenting() {
  const textareas = document.querySelectorAll(".comment-input");
  const postBtns = document.querySelectorAll(".submit-comment");

  textareas.forEach(t => t.classList.remove("hidden"));
  postBtns.forEach(b => b.classList.remove("hidden"));
}

// Submit comment - CONNECTED TO FLASK BACKEND
document.querySelectorAll(".submit-comment").forEach((btn, index) => {
  btn.addEventListener("click", async () => {
    if (!loggedInUser) {
      showCustomAlert('Login Required', 'Please login to share your thoughts about this movie!', '🎬', 'warning');
      return;
    }

    const textarea = document.querySelectorAll(".comment-input")[index];
    const commentBox = document.querySelectorAll(".comments")[index];
    const movieTitle = document.querySelectorAll(".movie-card h3")[index].textContent;

    const comment = textarea.value.trim();
    if (comment === "") {
      showCustomAlert('Empty Comment', 'Please write something before posting!', '📝', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
          movie_title: movieTitle,
          comment: comment,
          rating: 4.5
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${loggedInUser}:</strong> ${comment}`;
        commentBox.appendChild(p);
        textarea.value = "";
        showCustomAlert('Comment Posted!', 'Your review has been added successfully', '💬', 'success');
      } else {
        showCustomAlert('Failed', data.error || 'Could not post comment', '❌', 'warning');
      }
    } catch (error) {
      showCustomAlert('Error', 'Unable to post comment', '⚠️', 'warning');
    }
  });
});

/* ---------------------------------------------------------
   PAGINATION
--------------------------------------------------------- */
let currentPage = 1;
const moviesPerPage = 6;

function setupPagination() {
  const totalMovies = movieCards.length;
  const totalPages = Math.ceil(totalMovies / moviesPerPage);
  
  // Update page numbers
  const pageNumbersContainer = document.querySelector('.pagination');
  const pageButtons = pageNumbersContainer.querySelectorAll('.page-number');
  
  // Show current page movies
  showPage(currentPage);
  
  // Handle page number clicks
  pageButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      currentPage = index + 1;
      showPage(currentPage);
      updateActivePageButton();
    });
  });
  
  // Handle prev/next buttons
  const prevBtn = document.querySelector('.pagination .page-btn:first-child');
  const nextBtn = document.querySelector('.pagination .page-btn:last-child');
  
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
      updateActivePageButton();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
      updateActivePageButton();
    }
  });
}

function showPage(page) {
  const startIndex = (page - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  
  movieCards.forEach((card, index) => {
    if (index >= startIndex && index < endIndex) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActivePageButton() {
  const pageButtons = document.querySelectorAll('.page-number');
  pageButtons.forEach((btn, index) => {
    if (index + 1 === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Initialize pagination when page loads
setupPagination();