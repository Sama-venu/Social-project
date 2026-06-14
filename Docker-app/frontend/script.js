const API_URL = 'http://localhost:3000';

// Show login/register forms
function showForm(formType) {
    document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (formType === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelector('.tab-btn:first-child').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.querySelector('.tab-btn:last-child').classList.add('active');
    }
}

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullname = document.getElementById('regFullname').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            showForm('login');
            document.getElementById('registerForm').reset();
        } else {
            document.getElementById('regError').textContent = data.error;
        }
    } catch (error) {
        document.getElementById('regError').textContent = 'Server error. Please try again.';
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            loadApp(data.user);
        } else {
            document.getElementById('loginError').textContent = data.error;
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Server error. Please try again.';
    }
});

// Load main app
async function loadApp(user) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    document.getElementById('userName').textContent = `Welcome, ${user.fullname}`;
    
    await loadPosts();
}

// Load posts
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/api/posts`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayPosts(data.posts);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Display posts
function displayPosts(posts) {
    const postsFeed = document.getElementById('postsFeed');
    
    if (posts.length === 0) {
        postsFeed.innerHTML = '<div class="post-card" style="padding: 40px; text-align: center;">No posts yet. Be the first to share!</div>';
        return;
    }
    
    postsFeed.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <span class="post-user">${post.username}</span>
                <span class="post-fullname">(${post.fullname})</span>
            </div>
            <img src="${post.image_url}" class="post-image" alt="Post image">
            <div class="post-caption">
                <strong>${post.username}</strong> ${post.caption || ''}
            </div>
            <div class="post-time">
                ${new Date(post.created_at).toLocaleString()}
            </div>
        </div>
    `).join('');
}

// Create post
async function createPost() {
    const image_url = document.getElementById('postImageUrl').value;
    const caption = document.getElementById('postCaption').value;
    
    if (!image_url) {
        alert('Please enter an image URL');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url, caption }),
            credentials: 'include'
        });
        
        if (response.ok) {
            document.getElementById('postImageUrl').value = '';
            document.getElementById('postCaption').value = '';
            await loadPosts();
            alert('Post shared successfully!');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to create post');
        }
    } catch (error) {
        alert('Error creating post');
    }
}

// Logout
async function logout() {
    try {
        await fetch(`${API_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.removeItem('user');
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('appSection').style.display = 'none';
        document.getElementById('loginForm').reset();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Check existing session
async function checkSession() {
    try {
        const response = await fetch(`${API_URL}/api/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            loadApp(data.user);
        }
    } catch (error) {
        console.log('No active session');
    }
}

// Start the app
checkSession();
