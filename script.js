const XP_KEY = "salabranca_xp";
const LEVEL_NAMES = ["Normal", "Focado", "Imparável", "Elite", "Lendário"];

const state = {
    xp: Number(localStorage.getItem(XP_KEY) || 0),
    activeMission: null,
    timerSeconds: 0,
    timerInterval: null
};

const els = {
    xp: document.getElementById("xp"),
    nivel: document.getElementById("nivel"),
    statusNivel: document.getElementById("statusNivel"),
    statusDetalhado: document.getElementById("statusDetalhado"),
    nivelPill: document.getElementById("nivelPill"),
    xpResumo: document.getElementById("xpResumo"),
    progressPercent: document.getElementById("progressPercent"),
    progressText: document.getElementById("progressText"),
    progressFill: document.getElementById("progressFill"),
    nextGoal: document.getElementById("nextGoal"),
    missionRunner: document.getElementById("missionRunner"),
    activeMissionTitle: document.getElementById("activeMissionTitle"),
    activeMissionDescription: document.getElementById("activeMissionDescription"),
    missionTimer: document.getElementById("missionTimer"),
    missionTimerState: document.getElementById("missionTimerState"),
    recommendedWorkoutTitle: document.getElementById("recommendedWorkoutTitle"),
    recommendedWorkoutDescription: document.getElementById("recommendedWorkoutDescription"),
    startMission: document.getElementById("startMission"),
    completeMission: document.getElementById("completeMission"),
    tabs: [...document.querySelectorAll(".tab")],
    panels: [...document.querySelectorAll(".panel")],
    missions: [...document.querySelectorAll(".mission")],
    workouts: [...document.querySelectorAll(".workout")]
};

const missionDetails = {
    "Treino completo": {
        description: "Faça seu treino principal com foco total.",
        workoutId: "workout-a",
        workoutTitle: "Treino A - Peitoral e tríceps",
        workoutDescription: "Força e consistência - Execute todos os exercícios com foco máximo.",
        durationSeconds: 25 * 60, // 25 minutos
        xpReward: 50
    },
    "Disciplina": {
        description: "Cumpra sua rotina sem falhar.",
        workoutId: "workout-b",
        workoutTitle: "Treino B - Costas e bíceps",
        workoutDescription: "Postura e firmeza - Mantenha a disciplina em cada série.",
        durationSeconds: 20 * 60, // 20 minutos
        xpReward: 40
    },
    "Leitura": {
        description: "Estude e evolua.",
        workoutId: "workout-c",
        workoutTitle: "Treino C - Pernas",
        workoutDescription: "Treino pesado - Foco total nas pernas.",
        durationSeconds: 15 * 60, // 15 minutos
        xpReward: 30
    },
    "Controle emocional": {
        description: "Mantenha foco e equilíbrio.",
        workoutId: "workout-c",
        workoutTitle: "Treino C - Pernas",
        workoutDescription: "Controle total - Respiração e concentração.",
        durationSeconds: 10 * 60, // 10 minutos
        xpReward: 25
    }
};

function getLevel(xp) {
    let level = 1;
    let xpNeeded = 50;
    let totalXp = xp;
    
    while (totalXp >= xpNeeded) {
        totalXp -= xpNeeded;
        level++;
        xpNeeded = Math.floor(xpNeeded * 1.3);
    }
    
    const progress = totalXp;
    const percent = Math.min(100, Math.floor((progress / xpNeeded) * 100));
    const title = LEVEL_NAMES[Math.min(LEVEL_NAMES.length - 1, level - 1)];
    
    return { level, progress, percent, nextAt: xpNeeded, title };
}

function updateView() {
    const { level, progress, percent, nextAt, title } = getLevel(state.xp);
    
    if (els.xp) els.xp.textContent = state.xp;
    if (els.nivel) els.nivel.textContent = `Lv ${level}`;
    if (els.statusNivel) els.statusNivel.textContent = title;
    if (els.statusDetalhado) els.statusDetalhado.textContent = title;
    if (els.nivelPill) els.nivelPill.textContent = `Lv ${level}`;
    if (els.xpResumo) els.xpResumo.textContent = `${progress} de ${nextAt} XP`;
    if (els.progressPercent) els.progressPercent.textContent = `${percent}%`;
    if (els.progressFill) els.progressFill.style.width = `${percent}%`;
    if (els.nextGoal) els.nextGoal.textContent = `${nextAt} XP`;
    
    localStorage.setItem(XP_KEY, state.xp);
}

function showSection(sectionId) {
    els.panels.forEach(panel => {
        panel.classList.add("hidden");
    });
    
    const activePanel = document.getElementById(sectionId);
    if (activePanel) {
        activePanel.classList.remove("hidden");
    }
    
    els.tabs.forEach(tab => {
        tab.classList.remove("is-active");
    });
    
    const activeTab = document.querySelector(`.tab[data-target="${sectionId}"]`);
    if (activeTab) {
        activeTab.classList.add("is-active");
    }
}

function highlightWorkout(id) {
    els.workouts.forEach(w => w.classList.remove("is-highlighted"));
    if (id) {
        const workout = document.getElementById(id);
        if (workout) workout.classList.add("is-highlighted");
        // Rola suavemente até o treino destacado
        setTimeout(() => {
            workout.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function startTimer(duration) {
    stopTimer();
    state.timerSeconds = duration;
    
    if (els.missionTimer) {
        els.missionTimer.textContent = formatTime(state.timerSeconds);
    }
    
    if (els.missionTimerState) {
        els.missionTimerState.textContent = "⏱️ Em andamento...";
    }
    
    state.timerInterval = setInterval(() => {
        if (state.timerSeconds > 0) {
            state.timerSeconds--;
            if (els.missionTimer) {
                els.missionTimer.textContent = formatTime(state.timerSeconds);
            }
            
            // Atualiza o texto com emoji diferente quando faltam 5 minutos
            if (state.timerSeconds <= 300 && state.timerSeconds > 0) {
                if (els.missionTimerState) {
                    els.missionTimerState.textContent = "⚡ Quase lá!";
                }
            }
        }
        
        if (state.timerSeconds <= 0) {
            stopTimer();
            if (els.completeMission) {
                els.completeMission.disabled = false;
            }
            if (els.missionTimerState) {
                els.missionTimerState.textContent = "✅ Concluído!";
            }
            showToast("🎉 Tempo concluído! Clique em 'Concluir missão' para ganhar XP!", 4000);
        }
    }, 1000);
}

function startMission(name, xpReward) {
    const details = missionDetails[name];
    if (!details) {
        console.error("Missão não encontrada:", name);
        return;
    }
    
    state.activeMission = { name, xp: xpReward };
    
    // Atualiza o runner de missão
    if (els.missionRunner) {
        els.missionRunner.classList.remove("hidden");
    }
    
    if (els.activeMissionTitle) els.activeMissionTitle.textContent = name;
    if (els.activeMissionDescription) els.activeMissionDescription.textContent = details.description;
    if (els.recommendedWorkoutTitle) els.recommendedWorkoutTitle.textContent = details.workoutTitle;
    if (els.recommendedWorkoutDescription) els.recommendedWorkoutDescription.textContent = details.workoutDescription;
    
    // Destaca o treino recomendado
    highlightWorkout(details.workoutId);
    
    // Inicia o cronômetro
    startTimer(details.durationSeconds);
    
    // Mostra a seção de treinos
    showSection("treinos");
    
    // Desabilita o botão de completar missão até o tempo acabar
    if (els.completeMission) {
        els.completeMission.disabled = true;
    }
    
    // Mostra toast de confirmação
    showToast(`🚀 Missão "${name}" iniciada! Complete o treino para ganhar ${xpReward} XP!`, 3000);
}

function completeMission() {
    if (!state.activeMission) {
        showToast("❌ Nenhuma missão ativa!", 2000);
        return;
    }
    
    if (state.timerSeconds > 0) {
        showToast(`⏰ Aguarde ${formatTime(state.timerSeconds)} para concluir a missão!`, 3000);
        return;
    }
    
    // Adiciona XP
    const gainedXP = state.activeMission.xp;
    state.xp += gainedXP;
    
    // Mostra feedback
    showToast(`✨ Missão completa! +${gainedXP} XP conquistado! ✨`, 4000);
    
    // Limpa estado da missão
    state.activeMission = null;
    stopTimer();
    
    // Esconde o runner de missão
    if (els.missionRunner) {
        els.missionRunner.classList.add("hidden");
    }
    
    // Reseta o timer display
    if (els.missionTimer) {
        els.missionTimer.textContent = "00:00";
    }
    
    if (els.missionTimerState) {
        els.missionTimerState.textContent = "Aguardando missão";
    }
    
    // Atualiza a view
    updateView();
    
    // Desabilita botão de completar novamente
    if (els.completeMission) {
        els.completeMission.disabled = true;
    }
    
    // Mostra a home após completar
    setTimeout(() => {
        showSection("home");
    }, 1500);
}

function treinoDoDia() {
    const today = new Date().getDay();
    let workoutToHighlight = null;
    
    if (today >= 1 && today <= 5) {
        workoutToHighlight = today % 2 === 1 ? "workout-a" : "workout-b";
    } else if (today === 6) {
        workoutToHighlight = "workout-c";
    }
    
    if (workoutToHighlight) {
        highlightWorkout(workoutToHighlight);
    }
}

function showToast(message, duration = 3000) {
    // Cria o toast se não existir
    let toast = document.getElementById("custom-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "custom-toast";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,30,0.95));
            backdrop-filter: blur(12px);
            color: white;
            padding: 14px 28px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.95rem;
            z-index: 10000;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,92,122,0.3);
            font-family: 'Manrope', sans-serif;
            white-space: nowrap;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.transform = "translateX(-50%) translateY(0)";
    
    setTimeout(() => {
        toast.style.transform = "translateX(-50%) translateY(100px)";
    }, duration);
}

function initializeEventListeners() {
    // Tabs
    els.tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.target;
            if (target) {
                showSection(target);
            }
        });
    });
    
    // MISSÕES - Aqui é onde o cronômetro começa!
    els.missions.forEach(mission => {
        mission.addEventListener("click", (e) => {
            const label = mission.dataset.label;
            const xp = Number(mission.dataset.xp);
            if (label && xp) {
                startMission(label, xp);
            }
        });
    });
    
    // Botão completar missão
    if (els.completeMission) {
        els.completeMission.addEventListener("click", completeMission);
    }
    
    // Botão abrir treino
    if (els.startMission) {
        els.startMission.addEventListener("click", () => {
            if (state.activeMission) {
                const details = missionDetails[state.activeMission.name];
                if (details && details.workoutId) {
                    const workoutElement = document.getElementById(details.workoutId);
                    if (workoutElement) {
                        workoutElement.scrollIntoView({ behavior: "smooth", block: "center" });
                        workoutElement.classList.add("is-highlighted");
                        setTimeout(() => {
                            workoutElement.classList.remove("is-highlighted");
                        }, 2000);
                    }
                }
            } else {
                showToast("❌ Nenhuma missão ativa! Escolha uma missão primeiro.", 2000);
            }
        });
    }
}

// Inicialização
function init() {
    initializeEventListeners();
    updateView();
    treinoDoDia();
    showSection("home");
    
    // Esconde o runner de missão inicialmente
    if (els.missionRunner) {
        els.missionRunner.classList.add("hidden");
    }
    
    if (els.completeMission) {
        els.completeMission.disabled = true;
    }
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// Variável para armazenar o SVG e o círculo de progresso
let chartCircle = null;
let chartGradient = null;

// Função para criar o gráfico de pizza dinamicamente
function createPizzaChart(percent) {
    const progressRing = document.querySelector('.progress-ring');
    if (!progressRing) return;
    
    // Limpa o conteúdo existente
    progressRing.innerHTML = '';
    
    // Cria o SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.classList.add("pizza-chart");
    svg.setAttribute("viewBox", "0 0 100 100");
    
    // Cria o gradiente
    const defs = document.createElementNS(svgNS, "defs");
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "chartGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "100%");
    
    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#ff5c7a");
    
    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#ff9fb0");
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Círculo de fundo
    const bgCircle = document.createElementNS(svgNS, "circle");
    bgCircle.setAttribute("cx", "50");
    bgCircle.setAttribute("cy", "50");
    bgCircle.setAttribute("r", "42");
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", "rgba(255, 255, 255, 0.08)");
    bgCircle.setAttribute("stroke-width", "12");
    svg.appendChild(bgCircle);
    
    // Círculo de progresso
    const progressCircle = document.createElementNS(svgNS, "circle");
    progressCircle.setAttribute("cx", "50");
    progressCircle.setAttribute("cy", "50");
    progressCircle.setAttribute("r", "42");
    progressCircle.setAttribute("fill", "none");
    progressCircle.setAttribute("stroke", "url(#chartGradient)");
    progressCircle.setAttribute("stroke-width", "12");
    progressCircle.setAttribute("stroke-linecap", "round");
    progressCircle.setAttribute("stroke-dasharray", `${percent * 2.64} 264`);
    progressCircle.setAttribute("stroke-dashoffset", "0");
    svg.appendChild(progressCircle);
    
    progressRing.appendChild(svg);
    
    // Cria a div central
    const ringValues = document.createElement("div");
    ringValues.className = "ring-values";
    ringValues.innerHTML = `
        <strong id="progressPercent">${percent}%</strong>
        <span>até o próximo nível</span>
    `;
    progressRing.appendChild(ringValues);
    
    return { svg, progressCircle };
}

// Função para atualizar o gráfico de pizza
function updatePizzaChart(percent) {
    const progressRing = document.querySelector('.progress-ring');
    if (!progressRing) return;
    
    let progressCircle = progressRing.querySelector('.chart-progress');
    const percentElement = document.getElementById('progressPercent');
    
    if (percentElement) {
        percentElement.textContent = `${percent}%`;
    }
    
    if (progressCircle) {
        const circumference = 264; // 2 * PI * 42 ≈ 264
        const dashArray = (percent / 100) * circumference;
        progressCircle.setAttribute("stroke-dasharray", `${dashArray} ${circumference}`);
        
        // Adiciona animação de pulso
        progressCircle.style.animation = 'none';
        progressCircle.offsetHeight; // Força reflow
        progressCircle.style.animation = 'chartPulse 0.6s ease';
        
        setTimeout(() => {
            if (progressCircle) {
                progressCircle.style.animation = '';
            }
        }, 600);
    }
}

// Função para criar o gráfico de barras empilhadas (alternativa)
function createStackedBarChart(percent) {
    const container = document.querySelector('.progress-ring');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stacked-bar-container">
            <div class="stacked-bar-bg">
                <div class="stacked-bar-fill" style="width: ${percent}%">
                    <span class="bar-percent">${percent}%</span>
                </div>
            </div>
            <div class="bar-labels">
                <span>0 XP</span>
                <span>${Math.round((percent / 100) * 50)} XP</span>
                <span>50 XP</span>
            </div>
        </div>
        <div class="ring-values" style="position: relative; transform: none; width: 100%; margin-top: 20px;">
            <strong id="progressPercent">${percent}%</strong>
            <span>até o próximo nível</span>
        </div>
    `;
}

// Função para criar gráfico de pizza ESTILO PIZZA REAL (fatias)
function createRealPizzaChart(percent) {
    const progressRing = document.querySelector('.progress-ring');
    if (!progressRing) return;
    
    progressRing.innerHTML = '';
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.transform = "rotate(-90deg)";
    
    // Gradiente
    const defs = document.createElementNS(svgNS, "defs");
    const gradient = document.createElementNS(svgNS, "radialGradient");
    gradient.setAttribute("id", "pizzaGradient");
    gradient.setAttribute("cx", "30%");
    gradient.setAttribute("cy", "30%");
    
    const stopOuter = document.createElementNS(svgNS, "stop");
    stopOuter.setAttribute("offset", "0%");
    stopOuter.setAttribute("stop-color", "#ff5c7a");
    
    const stopInner = document.createElementNS(svgNS, "stop");
    stopInner.setAttribute("offset", "100%");
    stopInner.setAttribute("stop-color", "#ff9fb0");
    
    gradient.appendChild(stopOuter);
    gradient.appendChild(stopInner);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Círculo de fundo (parte não preenchida)
    const bgCircle = document.createElementNS(svgNS, "circle");
    bgCircle.setAttribute("cx", "50");
    bgCircle.setAttribute("cy", "50");
    bgCircle.setAttribute("r", "42");
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
    bgCircle.setAttribute("stroke-width", "14");
    svg.appendChild(bgCircle);
    
    // Círculo de progresso (pizza)
    const progressCircle = document.createElementNS(svgNS, "circle");
    progressCircle.setAttribute("cx", "50");
    progressCircle.setAttribute("cy", "50");
    progressCircle.setAttribute("r", "42");
    progressCircle.setAttribute("fill", "none");
    progressCircle.setAttribute("stroke", "url(#pizzaGradient)");
    progressCircle.setAttribute("stroke-width", "14");
    progressCircle.setAttribute("stroke-linecap", "butt");
    
    const circumference = 2 * Math.PI * 42;
    const dashArray = (percent / 100) * circumference;
    progressCircle.setAttribute("stroke-dasharray", `${dashArray} ${circumference}`);
    progressCircle.setAttribute("stroke-dashoffset", "0");
    
    svg.appendChild(progressCircle);
    progressRing.appendChild(svg);
    
    // Centro
    const centerDiv = document.createElement("div");
    centerDiv.className = "ring-values";
    centerDiv.innerHTML = `
        <strong id="progressPercent">${percent}%</strong>
        <span>completo</span>
    `;
    progressRing.appendChild(centerDiv);
}

// Função para atualizar o gráfico (chame esta função no updateView)
function updateProgressChart(percent) {
    const progressRing = document.querySelector('.progress-ring');
    if (!progressRing) return;
    
    // Verifica se o gráfico já existe e atualiza
    let progressCircle = progressRing.querySelector('circle:last-of-type');
    const ringValues = progressRing.querySelector('.ring-values');
    
    if (progressCircle && progressCircle.getAttribute('stroke-dasharray')) {
        // Atualiza gráfico existente
        const circumference = 2 * Math.PI * 42;
        const dashArray = (percent / 100) * circumference;
        progressCircle.setAttribute("stroke-dasharray", `${dashArray} ${circumference}`);
        
        // Animação de pulso
        progressCircle.style.animation = 'none';
        progressCircle.offsetHeight;
        progressCircle.style.animation = 'chartPulse 0.5s ease';
        setTimeout(() => {
            if (progressCircle) progressCircle.style.animation = '';
        }, 500);
    } else {
        // Cria novo gráfico (primeira vez)
        createRealPizzaChart(percent);
    }
    
    // Atualiza o percentual no centro
    const percentElement = document.getElementById('progressPercent');
    if (percentElement) {
        percentElement.textContent = `${percent}%`;
    }
}

// Modifique a função updateView para incluir o gráfico
const originalUpdateView = updateView;
updateView = function() {
    originalUpdateView();
    const { percent } = getLevel(state.xp);
    updateProgressChart(percent);
};
