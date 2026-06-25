// BlinkX - Mobile Social Media Platform

class BlinkX {
  constructor() {
    this.currentUser = null;
    this.users = [];
    this.posts = [];
    this.loadData();
    this.initApp();
  }

  // Data Management
  loadData() {
    const savedUsers = localStorage.getItem('blinkx_users');
    const savedPosts = localStorage.getItem('blinkx_posts');
    const savedCurrentUser = localStorage.getItem('blinkx_currentUser');

    this.users = savedUsers ? JSON.parse(savedUsers) : [];
    this.posts = savedPosts ? JSON.parse(savedPosts) : [];
    this.currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
  }

  saveData() {
    localStorage.setItem('blinkx_users', JSON.stringify(this.users));
    localStorage.setItem('blinkx_posts', JSON.stringify(this.posts));
    localStorage.setItem('blinkx_currentUser', JSON.stringify(this.currentUser));
  }

  // User Management
  register(username, email, password) {
    if (this.users.find(u => u.email === email || u.username === username)) {
      return { success: false, message: 'User already exists' };
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      bio: '',
      avatar: username.charAt(0).toUpperCase(),
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveData();
    return { success: true, user: newUser };
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }
    this.currentUser = user;
    this.saveData();
    return { success: true, user };
  }

  logout() {
    this.currentUser = null;
    this.saveData();
  }

  // Post Management
  createPost(caption, imageData) {
    if (!this.currentUser) return { success: false };

    const newPost = {
      id: Date.now(),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      avatar: this.currentUser.avatar,
      caption,
      image: imageData,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    this.posts.unshift(newPost);
    this.saveData();
    return { success: true, post: newPost };
  }

  likePost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const index = post.likes.indexOf(this.currentUser.id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(this.currentUser.id);
    }
    this.saveData();
  }

  commentOnPost(postId, text) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const comment = {
      id: Date.now(),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      text,
      createdAt: new Date().toISOString()
    };

    post.comments.push(comment);
    this.saveData();
    return comment;
  }

  // Follow Management
  followUser(userId) {
    if (!this.currentUser) return;

    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    if (!this.currentUser.following.includes(userId)) {
      this.currentUser.following.push(userId);
      user.followers.push(this.currentUser.id);
      this.saveData();
    }
  }

  unfollowUser(userId) {
    if (!this.currentUser) return;

    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const followingIndex = this.currentUser.following.indexOf(userId);
    const followerIndex = user.followers.indexOf(this.currentUser.id);

    if (followingIndex > -1) {
      this.currentUser.following.splice(followingIndex, 1);
    }
    if (followerIndex > -1) {
      user.followers.splice(followerIndex, 1);
    }
    this.saveData();
  }

  // Get Feed
  getFeed() {
    if (!this.currentUser) return [];

    return this.posts.filter(post => {
      return (
        post.userId === this.currentUser.id ||
        this.currentUser.following.includes(post.userId)
      );
    });
  }

  // Get User
  getUser(userId) {
    return this.users.find(u => u.id === userId);
  }

  // UI Methods
  initApp() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    if (this.currentUser) {
      this.renderMainApp();
    } else {
      this.renderLoginPage();
    }
  }

  renderLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page active" id="loginPage">
        <div class="auth-container">
          <div class="logo">BlinkX</div>
          <form class="auth-form" onsubmit="blinkx.handleLogin(event)">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="loginPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
            <div class="auth-link">
              Don't have an account? <a onclick="blinkx.goToRegister()">Register</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderRegisterPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page active" id="registerPage">
        <div class="auth-container">
          <div class="logo">BlinkX</div>
          <form class="auth-form" onsubmit="blinkx.handleRegister(event)">
            <div class="form-group">
              <label>Username</label>
              <input type="text" id="registerUsername" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="registerEmail" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="registerPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
            <div class="auth-link">
              Already have an account? <a onclick="blinkx.goToLogin()">Login</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderMainApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="pages">
        <div class="page active" id="feedPage"></div>
        <div class="page" id="profilePage"></div>
      </div>
      <div id="modals">
        <div class="modal" id="createModal"></div>
      </div>
      <nav class="navbar">
        <button class="nav-item active" onclick="blinkx.goToFeed()">
          <div class="nav-icon">🏠</div>
          <div>Home</div>
        </button>
        <button class="nav-item" onclick="blinkx.openCreateModal()">
          <div class="nav-icon">➕</div>
          <div>Create</div>
        </button>
        <button class="nav-item" onclick="blinkx.goToProfile()">
          <div class="nav-icon">👤</div>
          <div>Profile</div>
        </button>
      </nav>
    `;

    this.renderFeedPage();
  }

  renderFeedPage() {
    const feedPage = document.getElementById('feedPage');
    const feed = this.getFeed();

    let feedHTML = '<div class="header"><div class="header-title">BlinkX</div></div><div class="feed">';

    if (feed.length === 0) {
      feedHTML += '<div class="empty-state"><div class="empty-state-icon">📸</div><div class="empty-state-text">No posts yet</div></div>';
    } else {
      feed.forEach(post => {
        const isLiked = post.likes.includes(this.currentUser.id);
        const isFollowing = this.currentUser.following.includes(post.userId);
        const isOwnPost = post.userId === this.currentUser.id;

        feedHTML += `
          <div class="post">
            <div class="post-header">
              <div class="post-user">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-user-info">
                  <h3>${post.username}</h3>
                  <p>${this.getTimeAgo(post.createdAt)}</p>
                </div>
              </div>
              ${!isOwnPost ? `<button class="follow-btn ${isFollowing ? 'following' : ''}" onclick="blinkx.toggleFollow(${post.userId})">${isFollowing ? 'Following' : 'Follow'}</button>` : ''}
            </div>
            ${post.image ? `<img src="${post.image}" class="post-image" alt="Post">` : ''}
            <div class="post-caption">${post.caption}</div>
            <div class="post-actions">
              <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="blinkx.likePost(${post.id})">
                <span>${isLiked ? '❤️' : '🤍'}</span>
                <span>${post.likes.length}</span>
              </button>
              <button class="action-btn" onclick="blinkx.focusComment(${post.id})">
                <span>💬</span>
                <span>${post.comments.length}</span>
              </button>
            </div>
            <div class="comments-section">
              ${post.comments.slice(-3).map(c => `
                <div class="comment">
                  <span class="comment-author">${c.username}</span>
                  <div class="comment-text">${c.text}</div>
                </div>
              `).join('')}
            </div>
            <div class="comment-input-group">
              <input type="text" placeholder="Add a comment..." id="commentInput${post.id}" />
              <button onclick="blinkx.addComment(${post.id})">Post</button>
            </div>
          </div>
        `;
      });
    }

    feedHTML += '</div>';
    feedPage.innerHTML = feedHTML;
  }

  renderProfilePage() {
    const profilePage = document.getElementById('profilePage');
    const userPosts = this.posts.filter(p => p.userId === this.currentUser.id);
    const isOwnProfile = true;

    const profileHTML = `
      <div class="header">
        <div class="header-title">BlinkX</div>
        <button class="action-btn" onclick="blinkx.logout()" style="margin: 0;">
          <span>🚪</span>
        </button>
      </div>
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-photo">${this.currentUser.avatar}</div>
          <div class="profile-info">
            <div class="profile-username">@${this.currentUser.username}</div>
            <div class="profile-bio">${this.currentUser.bio || 'No bio yet'}</div>
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat-number">${userPosts.length}</div>
                <div class="profile-stat-label">Posts</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-number">${this.currentUser.followers.length}</div>
                <div class="profile-stat-label">Followers</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-number">${this.currentUser.following.length}</div>
                <div class="profile-stat-label">Following</div>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-posts-grid">
          ${userPosts.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📸</div></div>' : ''}
          ${userPosts.map(post => `
            <div class="profile-post">
              ${post.image ? `<img src="${post.image}" alt="Post">` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    profilePage.innerHTML = profileHTML;
  }

  renderCreateModal() {
    const modal = document.getElementById('createModal');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-title">Create Post</div>
        <form class="create-post-form" onsubmit="blinkx.submitPost(event)">
          <div class="image-upload">
            <label>Upload Image</label>
            <div class="image-preview" id="imagePreview">
              <span>Click to upload</span>
            </div>
            <input type="file" id="imageInput" accept="image/*" onchange="blinkx.previewImage(event)" style="display: none;" />
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('imageInput').click()">Select Image</button>
          </div>
          <div class="form-group">
            <label>Caption</label>
            <textarea id="captionInput" placeholder="Write your caption..." rows="4"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Post</button>
          <button type="button" class="btn btn-secondary" onclick="blinkx.closeCreateModal()">Cancel</button>
        </form>
      </div>
    `;
    modal.classList.add('active');
  }

  // Event Handlers
  handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = this.login(email, password);
    if (result.success) {
      this.initApp();
    } else {
      alert(result.message);
    }
  }

  handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const result = this.register(username, email, password);
    if (result.success) {
      alert('Registration successful! Please login.');
      this.goToLogin();
    } else {
      alert(result.message);
    }
  }

  previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      preview.dataset.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  submitPost(event) {
    event.preventDefault();
    const caption = document.getElementById('captionInput').value;
    const imagePreview = document.getElementById('imagePreview');
    const imageData = imagePreview.dataset.image || null;

    const result = this.createPost(caption, imageData);
    if (result.success) {
      this.closeCreateModal();
      this.renderFeedPage();
    }
  }

  addComment(postId) {
    const input = document.getElementById(`commentInput${postId}`);
    const text = input.value.trim();

    if (text) {
      this.commentOnPost(postId, text);
      input.value = '';
      this.renderFeedPage();
    }
  }

  focusComment(postId) {
    const input = document.getElementById(`commentInput${postId}`);
    if (input) input.focus();
  }

  likePost(postId) {
    this.likePost(postId);
    this.renderFeedPage();
  }

  toggleFollow(userId) {
    if (this.currentUser.following.includes(userId)) {
      this.unfollowUser(userId);
    } else {
      this.followUser(userId);
    }
    this.renderFeedPage();
  }

  // Navigation
  goToFeed() {
    this.switchPage('feedPage');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[0].classList.add('active');
  }

  goToProfile() {
    this.renderProfilePage();
    this.switchPage('profilePage');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[2].classList.add('active');
  }

  goToLogin() {
    this.renderLoginPage();
  }

  goToRegister() {
    this.renderRegisterPage();
  }

  switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
  }

  openCreateModal() {
    this.renderCreateModal();
  }

  closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.logout();
      this.initApp();
    }
  }

  // Utility
  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}

// Initialize app
const blinkx = new BlinkX();