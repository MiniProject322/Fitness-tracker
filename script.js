// --- Constants & Config ---
const STORAGE_KEYS = {
    AUTH: 'ironpulse_auth',
    ENTRIES: 'ironpulse_entries',
    USERS: 'ironpulse_users',
};

const EXERCISE_METS = {
    running: 9.8,
    cycling: 7.5,
    yoga: 3.0,
    boxing: 12.8,
    hiit: 11.0,
    weightlifting: 6.0,
    swimming: 8.0,
};

const DAILY_QUOTES = [
    "The only bad workout is the one that didn't happen.",
    "Take care of your body. It’s the only place you have to live.",
    "Success starts with self-discipline.",
    "Don’t count the days, make the days count.",
    "Pain is weakness leaving the body.",
    "Your body can stand almost anything. It’s your mind that you have to convince.",
    "Sweat is just fat crying."
];

// --- State ---
let currentUser = null;
let appEntries = [];
let chartInstance = null;
let profileChartInstance = null;

// --- Storage Service ---
const Storage = {
    getRegistry: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}'),
    saveRegistry: (reg) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(reg)),
    
    getEntries: (username) => JSON.parse(localStorage.getItem(`${STORAGE_KEYS.ENTRIES}_${username}`) || '[]'),
    saveEntry: (username, entry) => {
        const entries = Storage.getEntries(username);
        entries.unshift(entry);
        localStorage.setItem(`${STORAGE_KEYS.ENTRIES}_${username}`, JSON.stringify(entries));
        return entries;
    },
    
    login: (username, password) => {
        const reg = Storage.getRegistry();
        const user = reg[username];
        if (user && user.password === password) {
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, user: user.profile }));
            return user.profile;
        }
        return null;
    },
    
    register: (username, email, password) => {
        const reg = Storage.getRegistry();
        if (reg[username]) return false;
        
        const newUser = {
            username, email, joinedAt: new Date().toISOString(),
            onboardingCompleted: false, activityLevel: 'moderate', goal: 'fitness'
        };
        reg[username] = { profile: newUser, password };
        Storage.saveRegistry(reg);
        // Auto login
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, user: newUser }));
        return newUser;
    },

    updateUser: (updatedProfile) => {
        const reg = Storage.getRegistry();
        if (reg[updatedProfile.username]) {
            reg[updatedProfile.username].profile = updatedProfile;
            Storage.saveRegistry(reg);
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, user: updatedProfile }));
        }
    },

    checkAuth: () => {
        const auth = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH) || '{}');
        return auth.isAuthenticated ? auth.user : null;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        window.location.reload();
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    currentUser = Storage.checkAuth();
    
    if (!currentUser) {
        showSection('auth-section');
    } else if (!currentUser.onboardingCompleted) {
        showSection('onboarding-section');
        initOnboarding();
    } else {
        initApp();
    }
    
    setupAuthListeners();
});

// --- Navigation Logic ---
function showSection(sectionId) {
    document.querySelectorAll('body > div').forEach(div => div.classList.add('d-none'));
    document.getElementById(sectionId).classList.remove('d-none');
}

function initApp() {
    showSection('layout-section');
    appEntries = Storage.getEntries(currentUser.username);
    
    // Setup Navigation
    renderNav();
    updateUserDisplay();
    
    // Default View
    navigateTo('dashboard');
    
    // Global Listeners
    document.getElementById('logout-btn').addEventListener('click', Storage.logout);
    document.getElementById('mobile-logout').addEventListener('click', Storage.logout);
    document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('d-none');
        menu.classList.toggle('d-flex');
    });

    // Quick Nav Listeners (delegation)
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-nav');
        if (btn) navigateTo(btn.dataset.target);
    });
}

function navigateTo(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    document.getElementById(`view-${viewId}`).classList.remove('d-none');
    
    // Update Active Nav
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-target="${viewId}"]`);
    if(activeLink) activeLink.classList.add('active');

    // Close mobile menu if open
    document.getElementById('mobile-menu').classList.add('d-none');
    document.getElementById('mobile-menu').classList.remove('d-flex');

    // Render View Logic
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'workouts') initWorkouts();
    if (viewId === 'nutrition') renderNutrition();
    if (viewId === 'sleep') initSleep();
    if (viewId === 'hydration') initHydration();
    if (viewId === 'journal') renderJournal();
    if (viewId === 'profile') renderProfile();
}

function renderNav() {
    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
        { id: 'workouts', label: 'Workouts', icon: 'bi-bicycle' },
        { id: 'nutrition', label: 'Nutrition', icon: 'bi-egg-fried' },
        { id: 'sleep', label: 'Sleep & Recovery', icon: 'bi-moon-stars-fill' },
        { id: 'hydration', label: 'Hydration', icon: 'bi-droplet-fill' },
        { id: 'journal', label: 'Journal', icon: 'bi-journal-bookmark-fill' },
        { id: 'profile', label: 'Profile', icon: 'bi-person-gear' },
    ];

    const html = items.map(item => `
        <li class="nav-item">
            <a href="#" class="nav-link" data-target="${item.id}" onclick="navigateTo('${item.id}'); return false;">
                <i class="bi ${item.icon}"></i> ${item.label}
            </a>
        </li>
    `).join('');

    document.getElementById('desktop-nav').innerHTML = html;
    document.getElementById('mobile-nav').innerHTML = html;
}

function updateUserDisplay() {
    document.querySelectorAll('.username-display').forEach(el => el.textContent = currentUser.username);
    document.getElementById('user-name').textContent = currentUser.username;
    document.getElementById('user-goal').textContent = currentUser.goal || 'Athlete';
    document.getElementById('user-avatar').textContent = currentUser.username.charAt(0).toUpperCase();
    document.querySelectorAll('.user-goal-display').forEach(el => el.textContent = currentUser.goal || 'Fitness');
}

// --- Auth Section ---
function setupAuthListeners() {
    let isLogin = true;
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-auth');
    const emailGroup = document.getElementById('email-group');
    const title = document.getElementById('auth-title');
    const btnText = document.getElementById('auth-btn-text');
    const errorDiv = document.getElementById('auth-error');

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        title.textContent = isLogin ? 'Member Login' : 'Create Account';
        btnText.textContent = isLogin ? 'Enter Gym' : 'Start Journey';
        toggleBtn.textContent = isLogin ? 'New here? Create an account' : 'Already a member? Login';
        emailGroup.classList.toggle('d-none', isLogin);
        document.getElementById('email').required = !isLogin;
        errorDiv.classList.add('d-none');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (isLogin) {
            const user = Storage.login(username, password);
            if (user) {
                window.location.reload();
            } else {
                showError('Invalid credentials');
            }
        } else {
            const email = document.getElementById('email').value;
            const user = Storage.register(username, email, password);
            if (user) {
                window.location.reload(); // Goes to onboarding
            } else {
                showError('Username taken');
            }
        }
    });

    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.classList.remove('d-none');
    }
}

// --- Onboarding Section ---
function initOnboarding() {
    let step = 1;
    let formData = { ...currentUser };
    
    // DOM Elements
    const bar = document.getElementById('onboarding-progress');
    const btnNext = document.getElementById('onboarding-next'); // oops, id in html is ob-next
    
    document.getElementById('ob-next').addEventListener('click', () => {
        if (!validateStep(step)) return;
        saveStepData(step);
        
        if (step < 3) {
            step++;
            updateUI(step);
        } else {
            completeOnboarding();
        }
    });

    document.getElementById('ob-back').addEventListener('click', () => {
        if (step > 1) {
            step--;
            updateUI(step);
        }
    });
    
    // Toggle Height Inputs
    const heightRadios = document.querySelectorAll('input[name="ob-height-unit"]');
    heightRadios.forEach(radio => radio.addEventListener('change', (e) => {
        if (e.target.value === 'cm') {
            document.getElementById('input-h-cm').classList.remove('d-none');
            document.getElementById('input-h-ft').classList.add('d-none');
        } else {
            document.getElementById('input-h-cm').classList.add('d-none');
            document.getElementById('input-h-ft').classList.remove('d-none');
            document.getElementById('input-h-ft').classList.add('d-flex');
        }
    }));

    function updateUI(currentStep) {
        document.querySelectorAll('.step-content').forEach(el => el.classList.add('d-none'));
        document.getElementById(`step-${currentStep}`).classList.remove('d-none');
        bar.style.width = `${(currentStep / 3) * 100}%`;
        
        document.getElementById('ob-back').classList.toggle('d-none', currentStep === 1);
        document.getElementById('ob-next').innerHTML = currentStep === 3 ? 'Complete Setup <i class="bi bi-check-circle"></i>' : 'Next Step <i class="bi bi-arrow-right"></i>';
    }

    function validateStep(s) {
        if (s === 1) return document.getElementById('ob-age').value !== '';
        if (s === 2) {
            const isCm = document.getElementById('h-cm').checked;
            const hValid = isCm ? document.getElementById('ob-height-cm').value : document.getElementById('ob-height-ft').value;
            return hValid && document.getElementById('ob-weight').value;
        }
        return true;
    }

    function saveStepData(s) {
        if (s === 1) {
            formData.age = parseInt(document.getElementById('ob-age').value);
            formData.gender = document.querySelector('input[name="ob-gender"]:checked').value;
        }
        if (s === 2) {
            const isCm = document.getElementById('h-cm').checked;
            if (isCm) {
                formData.height = parseInt(document.getElementById('ob-height-cm').value);
            } else {
                const ft = parseInt(document.getElementById('ob-height-ft').value) || 0;
                const inches = parseInt(document.getElementById('ob-height-in').value) || 0;
                formData.height = Math.round(((ft * 12) + inches) * 2.54);
            }
            
            const isKg = document.getElementById('w-kg').checked;
            let w = parseFloat(document.getElementById('ob-weight').value);
            if (!isKg) w = w / 2.20462;
            formData.weight = parseFloat(w.toFixed(1));
        }
        if (s === 3) {
            formData.goal = document.getElementById('ob-goal').value;
            formData.activityLevel = document.getElementById('ob-activity').value;
            const gw = document.getElementById('ob-goal-weight').value;
            if (gw) {
                const isKg = document.getElementById('w-kg').checked; // Reusing unit from step 2 for consistency
                let gVal = parseFloat(gw);
                if(!isKg) gVal = gVal / 2.20462;
                formData.goalWeight = parseFloat(gVal.toFixed(1));
            }
        }
    }

    function completeOnboarding() {
        formData.onboardingCompleted = true;
        currentUser = formData;
        Storage.updateUser(formData);
        
        // Initial Weight Entry
        if (formData.weight) {
            const entry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'biometrics',
                weight: formData.weight,
                bmi: (formData.weight / Math.pow(formData.height/100, 2)).toFixed(1)
            };
            Storage.saveEntry(currentUser.username, entry);
        }

        window.location.reload();
    }
}

// --- Dashboard ---
function renderDashboard() {
    // Quote
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    document.getElementById('daily-quote').textContent = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

    // Stats
    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = appEntries.filter(e => e.timestamp.startsWith(today));
    
    const cals = todaysEntries.filter(e => e.type === 'workout').reduce((acc, c) => acc + c.caloriesBurned, 0);
    const water = todaysEntries.filter(e => e.type === 'hydration').reduce((acc, c) => acc + c.amountMl, 0);
    
    document.getElementById('dash-calories').textContent = cals;
    document.getElementById('dash-cal-total').textContent = cals;
    document.getElementById('dash-water').textContent = water;
    document.getElementById('dash-weight').textContent = currentUser.weight || '--';
    
    if (currentUser.height && currentUser.weight) {
        const bmi = (currentUser.weight / Math.pow(currentUser.height/100, 2)).toFixed(1);
        document.getElementById('dash-bmi').textContent = bmi;
    }

    document.getElementById('dash-activity').textContent = currentUser.activityLevel || 'MODERATE';
    document.getElementById('dash-goal').textContent = currentUser.goal || 'FITNESS';

    // Chart
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    
    const weightEntries = appEntries.filter(e => e.type === 'biometrics').reverse(); // Oldest first
    const labels = weightEntries.map(e => new Date(e.timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric'}));
    const data = weightEntries.map(e => e.weight);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: data,
                borderColor: '#84cc16',
                backgroundColor: 'rgba(132, 204, 22, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: '#334155' } },
                x: { grid: { color: '#334155' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Quick Water listener
    const quickWaterBtn = document.getElementById('quick-water');
    // Remove old listeners to prevent duplicates if function called multiple times
    const newBtn = quickWaterBtn.cloneNode(true);
    quickWaterBtn.parentNode.replaceChild(newBtn, quickWaterBtn);
    newBtn.addEventListener('click', () => {
        const entry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'hydration',
            amountMl: 250
        };
        appEntries = Storage.saveEntry(currentUser.username, entry);
        renderDashboard(); // Re-render to show update
    });
}

// --- Workouts ---
function initWorkouts() {
    const range = document.getElementById('workout-duration');
    const display = document.getElementById('workout-duration-val');
    const burn = document.getElementById('workout-burn');
    const typeSelect = document.getElementById('workout-type');

    function calc() {
        const dur = parseInt(range.value);
        const type = typeSelect.value;
        const weight = currentUser.weight || 75;
        const met = EXERCISE_METS[type] || 1;
        const kcal = Math.round(met * weight * (dur / 60));
        
        display.textContent = dur;
        burn.textContent = kcal;
    }

    range.addEventListener('input', calc);
    typeSelect.addEventListener('change', calc);
    calc(); // Init

    document.getElementById('save-workout').onclick = () => {
        const entry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'workout',
            exerciseType: typeSelect.value,
            duration: parseInt(range.value),
            caloriesBurned: parseInt(burn.textContent)
        };
        appEntries = Storage.saveEntry(currentUser.username, entry);
        alert('Workout Saved!');
    };
}

// --- Nutrition ---
function renderNutrition() {
    const suggestions = {
        gain: [
            { name: "Avocado", cal: "160kcal/100g", desc: "Healthy fats" },
            { name: "Nuts & Butters", cal: "600kcal/100g", desc: "Calorie dense" },
            { name: "Lean Red Meat", cal: "250kcal/100g", desc: "Protein & Iron" },
            { name: "Oats", cal: "389kcal/100g", desc: "Complex Carbs" },
            { name: "Whole Eggs", cal: "155kcal/100g", desc: "Complete Protein" }
        ],
        loss: [
            { name: "Leafy Greens", cal: "25kcal/100g", desc: "High volume" },
            { name: "White Fish", cal: "90kcal/100g", desc: "Lean Protein" },
            { name: "Berries", cal: "50kcal/100g", desc: "Antioxidants" },
            { name: "Egg Whites", cal: "52kcal/100g", desc: "Pure Protein" },
            { name: "Cucumber", cal: "16kcal/100g", desc: "Hydration" }
        ],
        maintain: [
            { name: "Whole Grains", cal: "120kcal/100g", desc: "Fiber" },
            { name: "Chicken Breast", cal: "165kcal/100g", desc: "Protein" },
            { name: "Greek Yogurt", cal: "59kcal/100g", desc: "Probiotics" },
            { name: "Sweet Potato", cal: "86kcal/100g", desc: "Vitamins" },
            { name: "Quinoa", cal: "120kcal/100g", desc: "Amino Profile" }
        ]
    };

    const goal = currentUser.goal === 'fitness' ? 'maintain' : currentUser.goal;
    const list = suggestions[goal] || suggestions.maintain;
    
    document.getElementById('food-list').innerHTML = list.map(item => `
        <div class="col-md-4 col-lg-3">
            <div class="bg-dark-950 p-4 rounded border border-secondary h-100 hover-border-success transition-all">
                <h5 class="fw-bold text-white">${item.name}</h5>
                <div class="text-success small fw-mono">${item.cal}</div>
                <div class="text-secondary small mt-2">${item.desc}</div>
            </div>
        </div>
    `).join('');
}

// --- Sleep ---
function initSleep() {
    const bed = document.getElementById('sleep-bed');
    const wake = document.getElementById('sleep-wake');
    
    function updateDisp() {
        // Simple string parsing
        const [h1, m1] = bed.value.split(':').map(Number);
        const [h2, m2] = wake.value.split(':').map(Number);
        
        let min1 = h1 * 60 + m1;
        let min2 = h2 * 60 + m2;
        if (min2 < min1) min2 += 1440;
        
        const diff = min2 - min1;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        document.getElementById('sleep-duration-display').textContent = `${h}h ${m}m`;
    }

    bed.addEventListener('change', updateDisp);
    wake.addEventListener('change', updateDisp);

    document.getElementById('save-sleep').onclick = () => {
        const [h1, m1] = bed.value.split(':').map(Number);
        const [h2, m2] = wake.value.split(':').map(Number);
        let min1 = h1 * 60 + m1;
        let min2 = h2 * 60 + m2;
        if (min2 < min1) min2 += 1440;
        const hours = ((min2 - min1) / 60).toFixed(1);

        const entry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'sleep',
            durationHours: hours
        };
        appEntries = Storage.saveEntry(currentUser.username, entry);
        alert('Sleep Logged!');
    };
}

// --- Hydration ---
function initHydration() {
    let amount = 250;
    const display = document.getElementById('hydro-amount');
    
    document.getElementById('hydro-inc').onclick = () => { amount += 50; display.textContent = amount; };
    document.getElementById('hydro-dec').onclick = () => { if(amount>50) amount -= 50; display.textContent = amount; };
    
    document.getElementById('save-hydration').onclick = () => {
        const entry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'hydration',
            amountMl: amount
        };
        appEntries = Storage.saveEntry(currentUser.username, entry);
        alert('Water Logged!');
    };
}

// --- Journal ---
function renderJournal() {
    const history = document.getElementById('journal-history');
    const entries = appEntries.filter(e => e.type === 'journal');
    
    if (entries.length === 0) {
        history.innerHTML = '<div class="text-center text-secondary py-5 border border-secondary border-dashed rounded">No entries yet.</div>';
    } else {
        history.innerHTML = entries.map(e => `
            <div class="card bg-dark-950 border-secondary">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5 class="card-title text-white fw-bold">${e.title}</h5>
                        <small class="text-indigo">${new Date(e.timestamp).toLocaleDateString()}</small>
                    </div>
                    <p class="card-text text-secondary">${e.content}</p>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('save-journal').onclick = () => {
        const title = document.getElementById('journal-title').value;
        const content = document.getElementById('journal-content').value;
        if (!title || !content) return;
        
        const entry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'journal',
            title, content
        };
        appEntries = Storage.saveEntry(currentUser.username, entry);
        document.getElementById('journal-title').value = '';
        document.getElementById('journal-content').value = '';
        renderJournal();
    };
}

// --- Profile ---
function renderProfile() {
    // Populate Form
    document.getElementById('p-age').value = currentUser.age || '';
    document.getElementById('p-gender').value = currentUser.gender || 'male';
    document.getElementById('p-weight').value = currentUser.weight || '';
    document.getElementById('p-goal-weight').value = currentUser.goalWeight || '';
    document.getElementById('p-height-cm').value = currentUser.height || '';
    document.getElementById('p-goal').value = currentUser.goal || 'fitness';
    document.getElementById('p-activity').value = currentUser.activityLevel || 'moderate';
    
    // Toggles logic handled similarly to onboarding (simplified here for brevity, defaulting to Metric)

    // Chart
    const ctx = document.getElementById('profileChart').getContext('2d');
    if (profileChartInstance) profileChartInstance.destroy();
    
    const weightEntries = appEntries.filter(e => e.type === 'biometrics').reverse();
    const data = weightEntries.map(e => e.weight);
    const labels = weightEntries.map(e => new Date(e.timestamp).toLocaleDateString());

    profileChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight',
                data: data,
                borderColor: '#84cc16',
                tension: 0.4
            }]
        },
        options: {
             plugins: { legend: { display: false } },
             scales: {
                 y: { grid: { color: '#334155' } },
                 x: { grid: { color: '#334155' } }
             }
        }
    });

    // Calculate Progress
    if (currentUser.goalWeight && currentUser.weight) {
        const gap = Math.abs(currentUser.goalWeight - currentUser.weight).toFixed(1);
        document.getElementById('p-gap').textContent = gap;
        // Simple progress calc assumption
        const start = weightEntries.length > 0 ? weightEntries[0].weight : currentUser.weight;
        const total = Math.abs(currentUser.goalWeight - start);
        const currentDiff = Math.abs(currentUser.goalWeight - currentUser.weight);
        let pct = 0;
        if (total > 0) pct = Math.max(0, Math.min(100, ((total - currentDiff) / total) * 100));
        
        document.getElementById('p-progress-text').textContent = pct.toFixed(0) + '%';
        document.getElementById('p-progress-bar').style.width = pct + '%';
    }

    // Save
    document.getElementById('profile-form').onsubmit = (e) => {
        e.preventDefault();
        const updated = {
            ...currentUser,
            age: parseInt(document.getElementById('p-age').value),
            gender: document.getElementById('p-gender').value,
            weight: parseFloat(document.getElementById('p-weight').value),
            goalWeight: parseFloat(document.getElementById('p-goal-weight').value),
            height: parseInt(document.getElementById('p-height-cm').value),
            goal: document.getElementById('p-goal').value,
            activityLevel: document.getElementById('p-activity').value
        };
        
        currentUser = updated;
        Storage.updateUser(updated);
        
        // Log weight change if different
        if (weightEntries.length === 0 || weightEntries[weightEntries.length-1].weight !== updated.weight) {
             const entry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'biometrics',
                weight: updated.weight,
                bmi: (updated.weight / Math.pow(updated.height/100, 2)).toFixed(1)
            };
            appEntries = Storage.saveEntry(currentUser.username, entry);
        }
        
        renderProfile(); // refresh chart
        alert('Profile Updated');
    };
}
