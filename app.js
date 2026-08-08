/**
 * PicaTracker 3000 - Core Application Logic
 */

// ==========================================
// 1. DATA STRUCTURES & CONSTANTS
// ==========================================

const PATENTS = [
    { level: 0, title: "Novato Curioso", min: 0, icon: "🐣" },
    { level: 1, title: "Aprendiz de Pica", min: 5, icon: "🥉" },
    { level: 2, title: "Entusiasta Picanil", min: 15, icon: "🥈" },
    { level: 3, title: "Colecionador de Pica", min: 30, icon: "🥇" },
    { level: 4, title: "Mestre da Pica", min: 50, icon: "🔥" },
    { level: 5, title: "Pica de Ouro", min: 100, icon: "👑" },
    { level: 6, title: "Lorde Supremo", min: 250, icon: "💎" },
    { level: 7, title: "Pica Intergaláctica", min: 500, icon: "🚀" },
    { level: 8, title: "Deus da Pica", min: 1000, icon: "⚡" }
];

const ACHIEVEMENTS = [
    { id: "a1", icon: "🌱", title: "Primeira de Muitas", desc: "Registrou sua 1ª pica no app." },
    { id: "a2", icon: "🥉", title: "Trilogia Lendária", desc: "Alcançou o total de 3 picas." },
    { id: "a3", icon: "🔥", title: "Clube dos 10", desc: "Alcançou 10 picas registradas." },
    { id: "a4", icon: "⭐", title: "Meia Centena", desc: "Chegou a 50 picas no contador." },
    { id: "a5", icon: "👑", title: "Pica de Ouro", desc: "Bateu a marca épica de 100 picas!" },
    { id: "a6", icon: "🦉", title: "Coruja Noturna", desc: "Registrou entre 01:00 e 05:00 da manhã." },
    { id: "a7", icon: "⚡", title: "Maratona Diária", desc: "Registrou 5 ou mais picas em um único dia." },
    { id: "a8", icon: "🚀", title: "Dedos de Ouro", desc: "Registrou 3 vezes seguidas em menos de 3 segundos." },
    { id: "a9", icon: "🌟", title: "Crítico VIP", desc: "Deu nota 5 estrelas em um registro." },
    { id: "a10", icon: "✍️", title: "Poeta da Pica", desc: "Escreveu uma nota detalhada em um registro." },
    { id: "a11", icon: "🎯", title: "Meta Cumprida", desc: "Atingiu 100% da sua meta mensal." },
    { id: "a12", icon: "💎", title: "Lenda Suprema", desc: "Alcançou a patente de Lorde Supremo!" },
    { id: "a13", icon: "🕺", title: "Membro do Reboleichon", desc: "Desbloqueou o segredo lendário do Grupo do Reboleichon! 💃" }
];

const WISDOM_QUOTES = [
    "Tamanho não é documento, mas o PicaTracker conta cada uma com precisão!",
    "Quem conta pica, seus males espanta!",
    "Uma pica por dia mantém o mau humor distante.",
    "A vida é feita de momentos, e aqui a gente registra os melhores!",
    "Foco na meta: o céu é o limite (ou a próxima patente)!",
    "Contar é fácil, o difícil é esquecer uma pica inesquecível.",
    "No balanço final da vida, o que vale são as picas contadas com alegria!",
    "Pica logada é pica celebrada! Continue o bom trabalho.",
    "Bota a mão na cabeça que vai começar o Reboleation do Contador! 🕺",
    "No Grupo do Reboleichon, cada pica registrada merece aquele passinho maroto! 💃",
    "A pica é boa, mas o gingado do Reboleation é incomparável!",
    "Diretamente do Grupo do Reboleichon: suor, ritmo e estatística de respeito!"
];

// Initial State
let appState = {
    totalCount: 0,
    history: [], // Array of { id, timestamp, dateStr, amount, tags, rating, notes }
    monthlyGoal: 10,
    soundEnabled: true,
    cyberTheme: false,
    unlockedAchievements: []
};

let clickTimestamps = [];
let chartInstance = null;
let audioCtx = null;

// ==========================================
// 2. AUDIO SYNTHESIZER (WEB AUDIO API)
// ==========================================

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!appState.soundEnabled) return;
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'pop') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'combo') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'fanfare') {
            // Milestone Sound
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((f, idx) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'sine';
                o.frequency.value = f;
                o.connect(g);
                g.connect(audioCtx.destination);
                const startTime = now + idx * 0.1;
                g.gain.setValueAtTime(0.2, startTime);
                g.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
                o.start(startTime);
                o.stop(startTime + 0.25);
            });
        } else if (type === 'decrement') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(150, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    } catch (e) {
        console.warn("Audio Error:", e);
    }
}

// ==========================================
// 3. STORAGE & STATE MANAGEMENT
// ==========================================

function loadState() {
    const saved = localStorage.getItem('picatracker_state_v3');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error("Failed to parse stored state:", e);
        }
    }
    // Calculate totalCount from history for consistency
    recalculateTotalFromHistory();
}

function saveState() {
    localStorage.setItem('picatracker_state_v3', JSON.stringify(appState));
}

function recalculateTotalFromHistory() {
    appState.totalCount = appState.history.reduce((sum, item) => sum + (item.amount || 1), 0);
}

// ==========================================
// 4. UI RENDERING & UPDATES
// ==========================================

function updateUI() {
    renderMainCounter();
    renderRankBanner();
    renderGoal();
    renderStats();
    renderPatents();
    renderAchievements();
    renderHistory();
    renderChart();
}

function renderMainCounter() {
    const el = document.getElementById('counterNumber');
    if (el) {
        el.textContent = appState.totalCount;
    }
    
    // Render Streak
    const streakEl = document.getElementById('streakCount');
    if (streakEl) {
        streakEl.textContent = calculateStreak();
    }
}

function calculateStreak() {
    if (appState.history.length === 0) return 0;
    
    const dates = appState.history.map(item => {
        const d = new Date(item.timestamp);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    });
    
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b) - new Date(a));
    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Allow streak if today or yesterday was logged
    let checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
    if (!uniqueDates.includes(checkStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
        if (!uniqueDates.includes(checkStr)) {
            return 0;
        }
    }

    while (uniqueDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
    }

    return streak;
}

function getCurrentPatent() {
    const count = appState.totalCount;
    let current = PATENTS[0];
    for (let i = PATENTS.length - 1; i >= 0; i--) {
        if (count >= PATENTS[i].min) {
            current = PATENTS[i];
            break;
        }
    }
    return current;
}

function getNextPatent() {
    const count = appState.totalCount;
    for (let i = 0; i < PATENTS.length; i++) {
        if (count < PATENTS[i].min) {
            return PATENTS[i];
        }
    }
    return null; // Max patent
}

function renderRankBanner() {
    const current = getCurrentPatent();
    const next = getNextPatent();
    
    document.getElementById('rankBadgeIcon').textContent = current.icon;
    document.getElementById('rankTitle').textContent = current.title;
    
    const fillEl = document.getElementById('rankProgressFill');
    const xpTextEl = document.getElementById('rankXpText');
    const rankSubEl = document.getElementById('rankSub');
    
    if (next) {
        const prevMin = current.min;
        const nextMin = next.min;
        const progress = Math.min(100, Math.max(0, ((appState.totalCount - prevMin) / (nextMin - prevMin)) * 100));
        fillEl.style.width = `${progress}%`;
        xpTextEl.textContent = `${appState.totalCount} / ${nextMin} XP`;
        rankSubEl.innerHTML = `Faltam <strong id="rankNextCount">${nextMin - appState.totalCount}</strong> para ${next.icon} ${next.title}!`;
    } else {
        fillEl.style.width = `100%`;
        xpTextEl.textContent = `${appState.totalCount} XP (MAX)`;
        rankSubEl.textContent = `Você atingiu a patente máxima! Suprema Lenda! 🔥`;
    }
}

function renderGoal() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthCount = appState.history
        .filter(item => {
            const d = new Date(item.timestamp);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, item) => sum + (item.amount || 1), 0);

    const goal = appState.monthlyGoal || 10;
    const percent = Math.min(100, Math.round((monthCount / goal) * 100));

    const fillCircle = document.getElementById('goalFillCircle');
    const percentText = document.getElementById('goalPercentText');
    const statusText = document.getElementById('goalStatusText');
    const subText = document.getElementById('goalSubText');

    if (fillCircle) {
        // Circumference is ~264
        const offset = 264 - (264 * percent) / 100;
        fillCircle.style.strokeDashoffset = offset;
    }
    if (percentText) percentText.textContent = `${percent}%`;
    if (statusText) statusText.textContent = `${monthCount} de ${goal} picas este mês`;
    
    if (subText) {
        if (percent >= 100) {
            subText.textContent = "🎉 Meta do mês concluída com sucesso! Incrível!";
            checkAchievement("a11");
        } else {
            subText.textContent = `Faltam ${goal - monthCount} picas para bater a meta mensal!`;
        }
    }
}

function renderStats() {
    const total = appState.totalCount;
    document.getElementById('statTotal').textContent = total;

    const todayStr = new Date().toDateString();
    const todayCount = appState.history
        .filter(item => new Date(item.timestamp).toDateString() === todayStr)
        .reduce((sum, item) => sum + (item.amount || 1), 0);
    document.getElementById('statToday').textContent = todayCount;

    // Week Count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekCount = appState.history
        .filter(item => new Date(item.timestamp) >= oneWeekAgo)
        .reduce((sum, item) => sum + (item.amount || 1), 0);
    document.getElementById('statWeek').textContent = weekCount;

    // Record single day
    const dayCounts = {};
    appState.history.forEach(item => {
        const dStr = new Date(item.timestamp).toDateString();
        dayCounts[dStr] = (dayCounts[dStr] || 0) + (item.amount || 1);
    });
    const maxRecord = Object.values(dayCounts).reduce((max, val) => Math.max(max, val), 0);
    document.getElementById('statRecord').textContent = maxRecord;

    // Fun facts calculations
    const heightMeters = (total * 0.15).toFixed(2);
    document.getElementById('factHeight').textContent = `Se enfileiradas (méd. 15cm), seu total mediria ${heightMeters} metros!`;

    const everestPercent = ((heightMeters / 8848) * 100).toFixed(4);
    document.getElementById('factSpace').textContent = `Equivale a ${everestPercent}% da altura do Monte Everest (8.848m).`;

    let avgPerDay = 0;
    if (appState.history.length > 0) {
        const firstDate = new Date(appState.history[appState.history.length - 1].timestamp);
        const daysDiff = Math.max(1, Math.ceil((new Date() - firstDate) / (1000 * 60 * 60 * 24)));
        avgPerDay = (total / daysDiff).toFixed(1);
    }
    document.getElementById('factFrequency').textContent = `Você registra uma média de ${avgPerDay} picas por dia desde o início.`;
}

function renderPatents() {
    const listEl = document.getElementById('patentsList');
    if (!listEl) return;
    
    const currentPatent = getCurrentPatent();

    listEl.innerHTML = PATENTS.map(p => {
        const isUnlocked = appState.totalCount >= p.min;
        const isCurrent = p.level === currentPatent.level;
        
        return `
            <div class="patent-item ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : ''}">
                <div class="patent-icon">${p.icon}</div>
                <div class="patent-info">
                    <div class="patent-name">${p.title}</div>
                    <div class="patent-req">Requisito: ${p.min} picas ${isCurrent ? ' • <strong>(PATENTE ATUAL)</strong>' : ''}</div>
                </div>
                <span class="patent-status-badge ${isUnlocked ? 'unlocked' : 'locked'}">
                    ${isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
                </span>
            </div>
        `;
    }).join('');
}

function renderAchievements() {
    const gridEl = document.getElementById('achievementsGrid');
    const countEl = document.getElementById('achievementsCount');
    if (!gridEl) return;

    const unlocked = appState.unlockedAchievements || [];
    countEl.textContent = `${unlocked.length}/${ACHIEVEMENTS.length}`;

    gridEl.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-details">
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderHistory() {
    const emptyEl = document.getElementById('historyEmptyState');
    const timelineEl = document.getElementById('historyTimeline');
    const searchTerm = (document.getElementById('historySearch')?.value || '').toLowerCase();

    if (!timelineEl) return;

    let filtered = [...appState.history];
    if (searchTerm) {
        if (/reboleichon|reboleation|parangole|passinho/i.test(searchTerm)) {
            checkAchievement("a13");
            showToast("💃 Segredo do Reboleichon encontrado no histórico!", "achievement");
        }

        filtered = filtered.filter(item => 
            (item.notes && item.notes.toLowerCase().includes(searchTerm)) ||
            (item.tags && item.tags.some(t => t.toLowerCase().includes(searchTerm))) ||
            (item.dateStr && item.dateStr.toLowerCase().includes(searchTerm))
        );
    }

    if (filtered.length === 0) {
        emptyEl.style.display = 'block';
        timelineEl.innerHTML = '';
        return;
    }

    emptyEl.style.display = 'none';

    timelineEl.innerHTML = filtered.map(item => {
        const d = new Date(item.timestamp);
        const formattedDate = d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const stars = item.rating ? '★'.repeat(item.rating) : '';
        const tagsHtml = item.tags ? item.tags.map(t => `<span class="log-tag">${t}</span>`).join('') : '';

        return `
            <div class="log-item" data-id="${item.id}">
                <div class="log-main">
                    <div class="log-amount-badge">+${item.amount || 1}</div>
                    <div class="log-meta">
                        <div class="log-date">📅 ${formattedDate} ${stars ? `<span class="log-stars">${stars}</span>` : ''}</div>
                        ${item.notes ? `<div class="log-notes">"${escapeHtml(item.notes)}"</div>` : ''}
                        ${tagsHtml ? `<div class="log-tags-row">${tagsHtml}</div>` : ''}
                    </div>
                </div>
                <button class="log-delete-btn" onclick="deleteHistoryItem('${item.id}')" title="Excluir este registro">🗑️</button>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

function renderChart(periodDays = 7) {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;

    // Aggregate counts by day
    const labels = [];
    const dataPoints = [];
    
    for (let i = periodDays - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const formattedLabel = `${date.getDate()}/${date.getMonth() + 1}`;
        
        const sum = appState.history
            .filter(item => new Date(item.timestamp).toDateString() === dateStr)
            .reduce((total, item) => total + (item.amount || 1), 0);
            
        labels.push(formattedLabel);
        dataPoints.push(sum);
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Picas Registradas',
                data: dataPoints,
                borderColor: '#c084fc',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ec4899',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: '#94a3b8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { display: false }
                }
            }
        }
    });
}

// ==========================================
// 5. EVENT HANDLERS & LOGIC
// ==========================================

function addPicaLog(amount = 1, tags = [], rating = 5, notes = "") {
    const timestamp = Date.now();
    const d = new Date(timestamp);
    const dateStr = d.toISOString();

    const logEntry = {
        id: 'log_' + timestamp + '_' + Math.random().toString(36).substr(2, 4),
        timestamp: timestamp,
        dateStr: dateStr,
        amount: amount,
        tags: tags,
        rating: rating,
        notes: notes
    };

    appState.history.unshift(logEntry);
    recalculateTotalFromHistory();

    // Check click speed achievement
    clickTimestamps.push(timestamp);
    if (clickTimestamps.length > 3) clickTimestamps.shift();
    if (clickTimestamps.length === 3 && (clickTimestamps[2] - clickTimestamps[0]) < 3000) {
        checkAchievement("a8"); // Dedos de Ouro
    }

    // Check Night owl achievement (1am - 5am)
    const hour = d.getHours();
    if (hour >= 1 && hour < 5) {
        checkAchievement("a6");
    }

    // Check rating & notes achievements
    if (rating === 5) checkAchievement("a9");
    if (notes && notes.trim().length > 0) checkAchievement("a10");

    // Check Reboleichon Easter Egg tag/notes
    if ((tags && tags.includes("🕺 Reboleichon")) || (notes && /reboleichon|reboleation|parangole|passinho/i.test(notes))) {
        checkAchievement("a13");
        showToast("🕺 RITMO DO REBOLEICHON! Bota a mão na cabeça!", "achievement");
    }

    // Check single day record
    const todayStr = d.toDateString();
    const todayCount = appState.history
        .filter(item => new Date(item.timestamp).toDateString() === todayStr)
        .reduce((sum, item) => sum + (item.amount || 1), 0);
        
    if (todayCount >= 5) checkAchievement("a7");

    // Check totals achievements
    if (appState.totalCount >= 1) checkAchievement("a1");
    if (appState.totalCount >= 3) checkAchievement("a2");
    if (appState.totalCount >= 10) checkAchievement("a3");
    if (appState.totalCount >= 50) checkAchievement("a4");
    if (appState.totalCount >= 100) checkAchievement("a5");

    if (getCurrentPatent().level >= 6) checkAchievement("a12");

    saveState();
    updateUI();

    // Trigger visual bump & confetti on milestones
    triggerCounterBump();
    playSound(amount > 1 ? 'combo' : 'pop');

    if (appState.totalCount === 1 || appState.totalCount % 10 === 0) {
        triggerConfetti();
        playSound('fanfare');
        showToast(`🎉 Parabéns! Você atingiu ${appState.totalCount} picas!`);
    }
}

function deleteHistoryItem(id) {
    if (confirm("Tem certeza de que deseja remover este registro do histórico?")) {
        appState.history = appState.history.filter(item => item.id !== id);
        recalculateTotalFromHistory();
        saveState();
        updateUI();
        playSound('decrement');
        showToast("Registro removido com sucesso.", "info");
    }
}

function checkAchievement(id) {
    if (!appState.unlockedAchievements.includes(id)) {
        appState.unlockedAchievements.push(id);
        saveState();
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
            triggerConfetti();
            playSound('fanfare');
            showToast(`🏆 Conquista Desbloqueada: ${ach.title}!`, 'achievement');
        }
    }
}

function triggerCounterBump() {
    const el = document.getElementById('counterNumber');
    if (el) {
        el.classList.remove('bump');
        void el.offsetWidth; // Trigger reflow
        el.classList.add('bump');
    }
}

function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'achievement' ? '🏆' : '🍆'}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==========================================
// 6. INITIALIZATION & EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initBackgroundCanvas();
    updateUI();

    // Secret Reboleichon Logo Clicks Easter Egg
    let logoClickCount = 0;
    let logoClickTimer = null;
    const logoGroup = document.querySelector('.logo-group');
    if (logoGroup) {
        logoGroup.style.cursor = 'pointer';
        logoGroup.setAttribute('title', 'Dica: Clica 5 vezes seguidas para uma surpresa...');
        logoGroup.addEventListener('click', () => {
            logoClickCount++;
            clearTimeout(logoClickTimer);
            logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2000);
            
            if (logoClickCount >= 5) {
                logoClickCount = 0;
                document.body.classList.toggle('reboleichon-mode');
                checkAchievement("a13");
                triggerConfetti();
                playSound('fanfare');
                showToast("🕺 MODO REBOLEICHON ATIVADO! BOTA A MÃO NA CABEÇA E REBOLA! 💃🎉", "achievement");
            }
        });
    }

    // Main Count Button Event
    const mainBtn = document.getElementById('mainCountBtn');
    if (mainBtn) {
        mainBtn.addEventListener('click', (e) => {
            // Open Detailed Modal or Quick Add
            openLogModal(1);
        });
    }

    // Quick Add Buttons
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.getAttribute('data-amount')) || 1;
            addPicaLog(amount);
            showToast(`+${amount} Pica(s) adicionada(s)!`);
        });
    });

    // Custom Add Button
    document.getElementById('customAddBtn')?.addEventListener('click', () => {
        const val = prompt("Digite quantas picas deseja adicionar:", "3");
        if (val && !isNaN(val) && parseInt(val) > 0) {
            addPicaLog(parseInt(val));
            showToast(`+${val} Pica(s) adicionada(s)!`);
        }
    });

    // Decrement Button
    document.getElementById('decrementBtn')?.addEventListener('click', () => {
        if (appState.history.length > 0) {
            deleteHistoryItem(appState.history[0].id);
        } else {
            showToast("Não há registros para remover!", "info");
        }
    });

    // Wisdom Quote Generator
    const quoteBtn = document.getElementById('newQuoteBtn');
    if (quoteBtn) {
        quoteBtn.addEventListener('click', generateNewQuote);
    }

    // Goal Modal Controls
    document.getElementById('setGoalBtn')?.addEventListener('click', () => {
        document.getElementById('goalInput').value = appState.monthlyGoal || 10;
        document.getElementById('goalModal').classList.add('active');
    });
    
    document.getElementById('closeGoalModalBtn')?.addEventListener('click', closeGoalModal);
    document.getElementById('cancelGoalBtn')?.addEventListener('click', closeGoalModal);
    document.getElementById('saveGoalBtn')?.addEventListener('click', () => {
        const val = parseInt(document.getElementById('goalInput').value);
        if (val && val > 0) {
            appState.monthlyGoal = val;
            saveState();
            renderGoal();
            closeGoalModal();
            showToast("Meta mensal atualizada!");
        }
    });

    // Log Modal Controls
    document.getElementById('closeLogModalBtn')?.addEventListener('click', closeLogModal);
    document.getElementById('cancelLogBtn')?.addEventListener('click', closeLogModal);
    document.getElementById('saveLogBtn')?.addEventListener('click', () => {
        const amount = parseInt(document.getElementById('modalAmount').value) || 1;
        const notes = document.getElementById('modalNotes').value;
        const selectedTags = Array.from(document.querySelectorAll('.tag-btn.selected')).map(b => b.getAttribute('data-tag'));
        const activeStar = document.querySelector('.star-rating .star.active');
        const rating = activeStar ? parseInt(activeStar.getAttribute('data-rating')) : 5;

        addPicaLog(amount, selectedTags, rating, notes);
        closeLogModal();
    });

    // Star Rating Click in Modal
    document.querySelectorAll('.star-rating .star').forEach(star => {
        star.addEventListener('click', () => {
            const r = parseInt(star.getAttribute('data-rating'));
            document.querySelectorAll('.star-rating .star').forEach(s => {
                const sr = parseInt(s.getAttribute('data-rating'));
                s.classList.toggle('active', sr <= r);
            });
        });
    });

    // Tags Selector in Modal
    document.querySelectorAll('.tag-btn').forEach(tagBtn => {
        tagBtn.addEventListener('click', () => {
            tagBtn.classList.toggle('selected');
        });
    });

    // Nav Tabs switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId)?.classList.add('active');
            
            if (targetId === 'tab-stats') {
                renderChart();
            }
        });
    });

    // Sound & Theme Toggles
    document.getElementById('soundToggleBtn')?.addEventListener('click', () => {
        appState.soundEnabled = !appState.soundEnabled;
        document.getElementById('soundIcon').textContent = appState.soundEnabled ? '🔊' : '🔇';
        saveState();
        showToast(appState.soundEnabled ? 'Sons Ativados!' : 'Sons Desativados!');
    });

    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
        appState.cyberTheme = !appState.cyberTheme;
        document.body.classList.toggle('cyber-mode', appState.cyberTheme);
        saveState();
        showToast(appState.cyberTheme ? 'Tema Cyberpunk Ativado!' : 'Tema Dark Neon Ativado!');
    });

    if (appState.cyberTheme) {
        document.body.classList.add('cyber-mode');
    }

    // Backup Export / Import
    document.getElementById('exportBtn')?.addEventListener('click', exportBackup);
    document.getElementById('importBtn')?.addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput')?.addEventListener('change', importBackup);

    // History Search
    document.getElementById('historySearch')?.addEventListener('input', renderHistory);

    // Clear all history
    document.getElementById('clearAllHistoryBtn')?.addEventListener('click', () => {
        if (confirm("⚠️ ATENÇÃO: Deseja apagar TODO o histórico e resetar o contador?")) {
            if (confirm("Tem certeza absoluta? Essa ação não pode ser desfeita!")) {
                appState.history = [];
                appState.unlockedAchievements = [];
                recalculateTotalFromHistory();
                saveState();
                updateUI();
                showToast("Todos os dados foram resetados.", "info");
            }
        }
    });

    // Chart period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const days = parseInt(btn.getAttribute('data-period'));
            renderChart(days);
        });
    });
});

function openLogModal(amount = 1) {
    document.getElementById('modalAmount').value = amount;
    document.getElementById('modalNotes').value = '';
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('logModal').classList.add('active');
}

function closeLogModal() {
    document.getElementById('logModal').classList.remove('active');
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('active');
}

function generateNewQuote() {
    const el = document.getElementById('wisdomQuoteText');
    if (!el) return;
    const randomIndex = Math.floor(Math.random() * WISDOM_QUOTES.length);
    el.textContent = `"${WISDOM_QUOTES[randomIndex]}"`;
    playSound('pop');
}

function exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PicaTracker_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup exportado com sucesso!");
}

function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            if (imported && Array.isArray(imported.history)) {
                appState = { ...appState, ...imported };
                recalculateTotalFromHistory();
                saveState();
                updateUI();
                showToast("Dados importados com sucesso! 🎉");
            } else {
                alert("Arquivo de backup inválido.");
            }
        } catch (err) {
            alert("Erro ao ler o arquivo de backup.");
        }
    };
    reader.readAsText(file);
}

// ==========================================
// 7. PARTICLES BACKGROUND CANVAS
// ==========================================

function initBackgroundCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? '#a855f7' : '#06b6d4',
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    animate();
}
