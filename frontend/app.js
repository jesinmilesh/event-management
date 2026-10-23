const API_BASE = window.location.protocol.startsWith('http')
  ? '/api'
  : 'http://localhost:5002/api';

let currentUser = null;
let currentToken = localStorage.getItem('eventhub_token');
let eventsList = [];

document.addEventListener('DOMContentLoaded', () => {
  restoreSession();
  fetchEvents();
});

function restoreSession() {
  const user = localStorage.getItem('eventhub_user');
  if (user && currentToken) {
    currentUser = JSON.parse(user);
    document.getElementById('userInfo').className = `user-badge ${currentUser.role}`;
    document.getElementById('userStatusText').textContent = `${currentUser.name} (${currentUser.role.toUpperCase()})`;
    document.getElementById('authBtn').textContent = 'Logout';
    document.getElementById('authBtn').className = 'btn btn-secondary';
    document.getElementById('authBtn').onclick = logout;
  } else {
    document.getElementById('userInfo').className = 'user-badge guest';
    document.getElementById('userStatusText').textContent = 'Guest (Login to Register)';
    document.getElementById('authBtn').textContent = 'Login';
    document.getElementById('authBtn').className = 'btn btn-primary';
    document.getElementById('authBtn').onclick = openAuthModal;
  }
}

async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`);
    const result = await res.json();
    if (result.success) {
      eventsList = result.data.events;
      renderEvents(eventsList);
    }
  } catch (err) {
    document.getElementById('eventsGrid').innerHTML = '<div class="loading-state">Could not connect to event backend on port 5002.</div>';
  }
}

function renderEvents(events) {
  const grid = document.getElementById('eventsGrid');
  grid.innerHTML = '';

  if (events.length === 0) {
    grid.innerHTML = '<div class="loading-state">No events available right now.</div>';
    return;
  }

  events.forEach((ev) => {
    const card = document.createElement('div');
    card.className = 'event-card';

    const registered = ev.registeredCount || 0;
    const capacity = ev.capacity || 1;
    const percent = Math.min(100, Math.round((registered / capacity) * 100));
    const isFull = registered >= capacity;

    card.innerHTML = `
      <div>
        <div class="event-meta">
          <span class="meta-chip">📍 ${ev.venue}</span>
          <span class="meta-chip">⏰ ${new Date(ev.date).toLocaleDateString()} at ${ev.time}</span>
        </div>
        <h3 class="event-title">${ev.title}</h3>
        <p class="event-desc">${ev.description}</p>
      </div>

      <div>
        <div class="capacity-section">
          <div class="capacity-labels">
            <span>Seats: ${registered}/${capacity}</span>
            <span style="color: ${isFull ? '#ef4444' : '#059669'};">${isFull ? 'FULL' : `${ev.availableSeats} Left`}</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${isFull ? 'full' : ''}" style="width: ${percent}%;"></div>
          </div>
        </div>

        <div class="event-footer">
          <span class="organizer-text">By ${ev.organizer}</span>
          <div>
            ${isFull
              ? '<button class="btn btn-secondary" disabled>Registration Full</button>'
              : `<button class="btn btn-primary" onclick="registerForEvent('${ev._id}')">Register Spot</button>`
            }
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

async function registerForEvent(eventId) {
  if (!currentToken) {
    showToast('Please login first to register for this event!');
    openAuthModal();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`
      }
    });

    const result = await res.json();
    if (result.success) {
      showToast('🎉 Successfully registered for the event!');
      fetchEvents();
    } else {
      showToast(result.message || 'Registration failed');
    }
  } catch (e) {
    showToast('Network error while registering');
  }
}

function openAddEventModal() {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Admin privilege required to host events. Please log in as Admin.');
    openAuthModal();
    return;
  }
  document.getElementById('eventModal').classList.remove('hidden');
}

function closeEventModal() {
  document.getElementById('eventModal').classList.add('hidden');
}

async function handleCreateEvent(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('eventTitle').value.trim(),
    description: document.getElementById('eventDesc').value.trim(),
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value.trim(),
    venue: document.getElementById('eventVenue').value.trim(),
    capacity: Number(document.getElementById('eventCapacity').value),
    organizer: document.getElementById('eventOrganizer').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      showToast('Event created successfully!');
      closeEventModal();
      document.getElementById('eventForm').reset();
      fetchEvents();
    } else {
      showToast(result.message || 'Error creating event');
    }
  } catch (err) {
    showToast('Failed to create event');
  }
}

function openAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();
    if (result.success) {
      currentToken = result.data.token;
      currentUser = result.data.user;
      localStorage.setItem('eventhub_token', currentToken);
      localStorage.setItem('eventhub_user', JSON.stringify(currentUser));
      showToast(`Logged in as ${currentUser.name}!`);
      restoreSession();
      closeAuthModal();
    } else {
      showToast(result.message || 'Login failed');
    }
  } catch (err) {
    showToast('Error during login');
  }
}

function logout() {
  localStorage.removeItem('eventhub_token');
  localStorage.removeItem('eventhub_user');
  currentUser = null;
  currentToken = null;
  restoreSession();
  showToast('Logged out.');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}
