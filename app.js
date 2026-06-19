const candidates = [
  {
    id: "PILOT-001",
    token: "andrey_7kP4mN9x",
    name: "Андрей",
    direction: "Голосовая водительская поддержка",
    schedule: "2/2, с 09:00 до 21:00",
    averageIncome: 35000,
    speedMin: 30,
    meeting: "20 июня 2026",
    meetingTime: "12:00 МСК",
    zoom: "http://kakayato.ssylka.ru",
    training: "21 июня 2026",
    trainingTime: "08:00 МСК",
    trainingLength: "2 недели",
    expectedIncome: null,
    current: 0,
    done: [],
    access: true,
    transferUsed: false,
    alerts: []
  },
  {
    id: "PILOT-002",
    token: "maria_2vR8qL6d",
    name: "Мария",
    direction: "Письменная поддержка",
    schedule: "5/2, с 09:00 до 18:00",
    averageIncome: 30000,
    speedMin: 20,
    meeting: "23 июня 2026",
    meetingTime: "12:00 МСК",
    zoom: "http://kakayato.ssylka.ru",
    training: "25 июня 2026",
    trainingTime: "08:00 МСК",
    trainingLength: "3 недели",
    expectedIncome: null,
    current: 0,
    done: [],
    access: true,
    transferUsed: false,
    alerts: []
  },
  {
    id: "C-1042",
    token: "demo_anya_8f31",
    name: "Аня Воронова",
    direction: "Голосовая водительская поддержка",
    schedule: "2/2, с 09:00 до 21:00",
    averageIncome: 62000,
    speedMin: 30,
    meeting: "25 июня 2026",
    meetingTime: "16:00 МСК",
    zoom: "https://zoom.us/j/demo-voice",
    training: "29 июня 2026",
    trainingTime: "09:00 МСК",
    trainingLength: "2 недели",
    expectedIncome: null,
    current: 0,
    done: [],
    access: true,
    transferUsed: false,
    alerts: []
  },
  {
    id: "C-1077",
    token: "demo_max_17ca",
    name: "Максим Орлов",
    direction: "Пользовательская письменная поддержка",
    schedule: "5/2, с 08:00 до 17:00",
    averageIncome: 55000,
    speedMin: 20,
    meeting: "25 июня 2026",
    meetingTime: "18:30 МСК",
    zoom: "https://zoom.us/j/demo-text",
    training: "29 июня 2026",
    trainingTime: "08:00 МСК",
    trainingLength: "3 недели",
    expectedIncome: 70000,
    current: 3,
    done: [0, 1, 2],
    access: true,
    transferUsed: false,
    alerts: [
      { title: "Ожидание по доходу выше среднего", text: "70 000 ₽ вместо 55 000 ₽ · разница +15 000 ₽" }
    ]
  },
  {
    id: "C-1091",
    token: "demo_lera_935d",
    name: "Лера Соколова",
    direction: "Голосовая водительская поддержка",
    schedule: "2/2, с 09:00 до 21:00",
    averageIncome: 62000,
    speedMin: 30,
    meeting: "25 июня 2026",
    meetingTime: "16:00 МСК",
    zoom: "https://zoom.us/j/demo-voice",
    training: "29 июня 2026",
    trainingTime: "09:00 МСК",
    trainingLength: "2 недели",
    expectedIncome: 63000,
    current: 4,
    done: [0, 1, 2, 3],
    access: true,
    transferUsed: false,
    alerts: []
  }
];

const stages = [
  { name: "Онлайн-встреча", short: "Встреча" },
  { name: "Проверка интернета", short: "Интернет" },
  { name: "Подтверждение графика", short: "График" },
  { name: "Ожидаемый доход", short: "Доход" },
  { name: "Подготовка к обучению", short: "Обучение" }
];

const personalToken = new URLSearchParams(window.location.search).get("invite");
const tokenIndex = personalToken ? candidates.findIndex(item => item.token === personalToken) : -1;
let selectedIndex = tokenIndex >= 0 ? tokenIndex : 0;
const el = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const candidate = () => candidates[selectedIndex];
const progressFields = ["expectedIncome", "current", "done", "access", "transferUsed", "alerts"];

function restoreProgress(item) {
  const saved = localStorage.getItem(`candidate-progress:${item.token}`);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    progressFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(parsed, field)) item[field] = parsed[field];
    });
  } catch {
    localStorage.removeItem(`candidate-progress:${item.token}`);
  }
}

function saveProgress() {
  const c = candidate();
  const state = {};
  progressFields.forEach(field => { state[field] = c[field]; });
  localStorage.setItem(`candidate-progress:${c.token}`, JSON.stringify(state));
}

candidates.forEach(restoreProgress);

function addAlert(title, text) {
  const c = candidate();
  if (c.alerts.some(alert => alert.title === title && alert.text === text)) return;
  c.alerts.unshift({ title, text });
  renderSide();
}

function completeStage(index) {
  const c = candidate();
  if (!c.done.includes(index)) c.done.push(index);
  c.current = Math.min(index + 1, stages.length - 1);
  render();
}

function botMessage(html) {
  return `<div class="message-row"><div class="bubble">${html}</div></div>`;
}

function userMessage(text) {
  return `<div class="message-row user"><div class="bubble">${text}</div></div>`;
}

function stageContent(c, index) {
  if (!c.access) {
    return {
      messages: [
        botMessage("<p><strong>Доступ к сопровождению закрыт.</strong></p><p>Если это произошло по ошибке, напиши сотруднику адаптации — доступ можно восстановить.</p>")
      ],
      actions: ""
    };
  }

  if (index === 0) {
    return {
      messages: [
        botMessage(`<p>Привет, ${c.name.split(" ")[0]}! Я помогу спокойно добраться до первого дня обучения.</p><p class="fine">Без квестов на выживание и потерянных ссылок.</p>`),
        botMessage(`<p>Первый шаг — онлайн-встреча по направлению <strong>${c.direction}</strong>.</p><p><strong>${c.meeting}, ${c.meetingTime}</strong></p><p>На встрече расскажем про работу и ответим на вопросы. Подтверди, что сможешь быть.</p>`)
      ],
      actions: `<div class="action-area">
        <button class="choice" data-action="meeting-yes">Буду на встрече</button>
        <button class="choice alt" data-action="meeting-question">Есть вопрос</button>
      </div>`
    };
  }

  if (index === 1) {
    return {
      messages: [
        botMessage(`<p>Теперь проверим интернет. Для твоего направления нужно не меньше <strong>${c.speedMin} Мбит/с</strong> на входящую и исходящую скорость.</p>`),
        botMessage(`<p>Пройди проверку на <a href="https://yandex.ru/INTERNET" target="_blank" rel="noreferrer">yandex.ru/INTERNET</a> и пришли полноэкранный скриншот результата.</p><p class="fine">На скриншоте должны быть видны дата и время. Цифры тоже введи ниже — их я проверю автоматически.</p>`)
      ],
      actions: `<div class="action-area">
        <div class="input-stack">
          <label>Входящая скорость<input id="downloadSpeed" inputmode="decimal" placeholder="${c.speedMin}" /></label>
          <label>Исходящая скорость<input id="uploadSpeed" inputmode="decimal" placeholder="${c.speedMin}" /></label>
          <label class="upload">Полноэкранный скриншот<input id="speedScreenshot" type="file" accept="image/*" /></label>
          <div id="speedError" class="form-error"></div>
          <button class="primary-button" data-action="check-speed">Проверить результат</button>
        </div>
      </div>`
    };
  }

  if (index === 2) {
    return {
      messages: [
        botMessage(`<p>С отделом найма ты согласовал график:</p><p><strong>${c.schedule}</strong></p><p>Он всё ещё тебе подходит?</p>`)
      ],
      actions: `<div class="action-area">
        <button class="choice" data-action="schedule-yes">Да, всё верно</button>
        <button class="choice alt" data-action="schedule-change">Хочу изменить</button>
      </div>`
    };
  }

  if (index === 3) {
    const existing = c.expectedIncome ? userMessage(`Ожидаю примерно ${money(c.expectedIncome)} в месяц`) : "";
    return {
      messages: [
        botMessage(`<p>Какой среднемесячный доход ты ожидаешь получать после обучения?</p><p class="fine">Это не экзамен на угадывание. Нам важно заранее сверить ожидания.</p>`),
        existing
      ],
      actions: `<div class="action-area">
        <div class="input-stack single">
          <label>Ожидаемый доход, ₽<input id="incomeInput" inputmode="numeric" value="${c.expectedIncome || ""}" placeholder="Например, 60 000" /></label>
          <div id="incomeError" class="form-error"></div>
          <button class="primary-button" data-action="save-income">Сохранить ожидание</button>
        </div>
      </div>`
    };
  }

  if (c.done.includes(4)) {
    return {
      messages: [
        botMessage(`<p><strong>Подготовка завершена.</strong></p><p>Жду тебя ${c.training} в ${c.trainingTime}. Камера, микрофон и стабильный интернет — на месте, остальное разберём вместе.</p><p class="fine">Я ещё напомню за сутки, за час, за 15 минут и в момент старта.</p>`)
      ],
      actions: ""
    };
  }

  return {
    messages: [
      botMessage(`<p>Обучение начинается <strong>${c.training} в ${c.trainingTime}</strong> и длится <strong>${c.trainingLength}</strong>.</p>`),
      botMessage(`<p>К старту понадобятся камера, микрофон и стабильный интернет. Во время обучения нужно быть в Zoom полный день, не пропускать сессии с тренером и выполнять домашние задания.</p><p class="fine">Явка влияет на оплату обучения и на его успешное прохождение.</p>`)
    ],
    actions: `<div class="action-area">
      <button class="choice" data-action="training-confirm">Всё готово, буду</button>
      <button class="choice alt" data-global="transfer">Нужно перенести</button>
    </div>`
  };
}

function renderStages() {
  const c = candidate();
  el("stageList").innerHTML = stages.map((stage, i) => {
    const done = c.done.includes(i);
    const current = c.current === i && !done;
    return `<li><button class="stage-button ${done ? "done" : ""} ${current ? "current" : ""}" data-stage="${i}">
      <span class="stage-index">${i + 1}</span>
      <span><span class="stage-label">${stage.name}</span><span class="stage-state">${done ? "Готово" : current ? "Сейчас здесь" : "Впереди"}</span></span>
    </button></li>`;
  }).join("");
  el("progressText").textContent = `${c.done.length} из ${stages.length} этапов`;
  el("progressBar").style.width = `${(c.done.length / stages.length) * 100}%`;
}

function renderSide() {
  const c = candidate();
  const trainingStage = c.current >= 4;
  el("eventDate").textContent = trainingStage ? c.training : c.meeting;
  el("eventTitle").textContent = trainingStage ? "Старт обучения" : "Онлайн-встреча";
  el("eventMeta").textContent = `${trainingStage ? c.trainingTime : c.meetingTime} · ${c.direction}`;
  el("eventLink").style.display = trainingStage ? "none" : "inline-block";
  el("eventLink").href = c.zoom;
  el("candidateFacts").innerHTML = `
    <div><dt>ID</dt><dd>${c.id}</dd></div>
    <div><dt>Направление</dt><dd>${c.direction}</dd></div>
    <div><dt>График</dt><dd>${c.schedule}</dd></div>
    <div><dt>Средний доход</dt><dd>${money(c.averageIncome)}</dd></div>
    <div><dt>Интернет</dt><dd>${c.speedMin} / ${c.speedMin} Мбит/с</dd></div>`;
  el("alertCount").textContent = c.alerts.length;
  el("alerts").innerHTML = c.alerts.length
    ? c.alerts.map(a => `<div class="alert-row"><strong>${a.title}</strong><span>${c.name} · ${a.text}</span></div>`).join("")
    : `<p class="empty-alerts">Пока тихо. Сюда прилетят расхождения и запросы, где нужен человек.</p>`;
}

function renderChat() {
  const c = candidate();
  el("candidateName").textContent = c.name;
  el("accessStatus").textContent = c.access ? "Доступ активен" : "Доступ закрыт";
  el("accessStatus").className = `status-pill ${c.access ? "" : "locked"}`;
  el("composer").style.display = c.access ? "flex" : "none";
  const content = stageContent(c, c.current);
  el("chat").innerHTML = content.messages.join("") + content.actions;
}

function render() {
  renderStages();
  renderChat();
  renderSide();
  saveProgress();
}

function openModal(type) {
  const c = candidate();
  if (!c.access) return;
  const modal = el("modal");
  if (type === "help") {
    el("modalEyebrow").textContent = "База знаний";
    el("modalTitle").textContent = "Что хочешь уточнить?";
    el("modalBody").innerHTML = `<div class="input-stack single">
      <label>Вопрос<textarea id="helpText" placeholder="Например: оплачивается ли обучение?"></textarea></label>
      <div class="modal-actions"><button class="primary-button" type="button" data-modal="ask-help">Спросить</button></div>
    </div>`;
  }
  if (type === "transfer") {
    el("modalEyebrow").textContent = "Перенос обучения";
    el("modalTitle").textContent = c.transferUsed ? "Перенос уже использован" : "Передать запрос адаптации?";
    el("modalBody").innerHTML = c.transferUsed
      ? `<p class="muted">В MVP обучение можно перенести один раз. Я передам команде просьбу связаться с тобой лично.</p><div class="modal-actions"><button class="primary-button" type="button" data-modal="contact-transfer">Связаться с адаптацией</button></div>`
      : `<p class="muted">Новую дату согласует сотрудник адаптации. Причину можно указать, но это необязательно.</p><div class="input-stack single"><label>Причина<textarea id="transferReason" placeholder="Можно оставить пустым"></textarea></label></div><div class="modal-actions"><button class="primary-button" type="button" data-modal="confirm-transfer">Отправить запрос</button></div>`;
  }
  if (type === "refuse") {
    el("modalEyebrow").textContent = "Отказ от вакансии";
    el("modalTitle").textContent = "Точно хочешь отказаться?";
    const reasons = ["Не подошла специфика работы", "Семейные обстоятельства", "Нашёл другую работу", "Не устраивает доход", "Другая причина", "Не хочу указывать"];
    el("modalBody").innerHTML = `<p class="muted">После подтверждения доступ закроется. Команда адаптации сможет открыть его снова.</p><div class="reason-list">${reasons.map((r,i) => `<label class="reason-option"><input type="radio" name="reason" value="${r}" ${i === 5 ? "checked" : ""} />${r}</label>`).join("")}</div><div class="modal-actions"><button class="choice danger" type="button" data-modal="confirm-refuse">Подтвердить отказ</button></div>`;
  }
  modal.showModal();
}

document.addEventListener("click", (event) => {
  const stageButton = event.target.closest("[data-stage]");
  if (stageButton) {
    const requested = Number(stageButton.dataset.stage);
    const c = candidate();
    if (requested <= c.current || c.done.includes(requested)) {
      c.current = requested;
      render();
    }
    return;
  }

  const global = event.target.closest("[data-global]")?.dataset.global;
  if (global) {
    openModal(global);
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "meeting-yes") completeStage(0);
  if (action === "meeting-question") openModal("help");
  if (action === "schedule-yes") completeStage(2);
  if (action === "schedule-change") {
    addAlert("Кандидат хочет изменить график", `Сейчас выбран: ${candidate().schedule}`);
    completeStage(2);
  }
  if (action === "check-speed") {
    const down = Number(el("downloadSpeed")?.value.replace(",", "."));
    const up = Number(el("uploadSpeed")?.value.replace(",", "."));
    const file = el("speedScreenshot")?.files[0];
    if (!down || !up || !file) {
      el("speedError").textContent = "Нужны обе скорости и полноэкранный скриншот.";
    } else if (down < candidate().speedMin || up < candidate().speedMin) {
      el("speedError").textContent = `Пока не хватает скорости: нужно минимум ${candidate().speedMin} / ${candidate().speedMin} Мбит/с. Можно повторить проверку.`;
      addAlert("Интернет ниже требований", `${down} / ${up} Мбит/с при норме ${candidate().speedMin} / ${candidate().speedMin}`);
    } else {
      addAlert("Скриншот интернета ждёт проверки", `${down} / ${up} Мбит/с · цифры соответствуют требованиям`);
      completeStage(1);
    }
  }
  if (action === "save-income") {
    const value = Number((el("incomeInput")?.value || "").replace(/\s/g, ""));
    if (!value || value < 10000) {
      el("incomeError").textContent = "Напиши ожидаемую сумму одним числом.";
    } else {
      const c = candidate();
      c.expectedIncome = value;
      const difference = value - c.averageIncome;
      if (difference >= 10000) addAlert("Ожидание по доходу выше среднего", `${money(value)} вместо ${money(c.averageIncome)} · разница +${money(difference)}`);
      completeStage(3);
    }
  }
  if (action === "training-confirm") completeStage(4);

  const modalAction = event.target.closest("[data-modal]")?.dataset.modal;
  if (modalAction === "ask-help") {
    const question = el("helpText").value.trim();
    if (!question) return;
    addAlert("Новый вопрос кандидата", question);
    el("modal").close();
  }
  if (modalAction === "confirm-transfer") {
    const reason = el("transferReason").value.trim() || "Причина не указана";
    candidate().transferUsed = true;
    addAlert("Запрошен перенос обучения", reason);
    el("modal").close();
  }
  if (modalAction === "contact-transfer") {
    addAlert("Нужна ручная помощь с переносом", "Кандидат уже использовал один перенос");
    el("modal").close();
  }
  if (modalAction === "confirm-refuse") {
    const reason = document.querySelector('input[name="reason"]:checked')?.value || "Не указана";
    addAlert("Кандидат отказался от вакансии", reason);
    candidate().access = false;
    el("modal").close();
    render();
  }
});

if (personalToken && tokenIndex < 0) {
  document.querySelector(".candidate-picker").style.display = "none";
  document.querySelector(".layout").innerHTML = `
    <section style="grid-column:1/-1;display:grid;place-items:center;padding:40px">
      <div style="max-width:520px;text-align:center">
        <p class="eyebrow">Персональная ссылка</p>
        <h1>Доступ не найден</h1>
        <p class="muted">Проверь ссылку или обратись к сотруднику адаптации. Мы не сообщаем, есть ли конкретный кандидат в базе.</p>
      </div>
    </section>`;
} else {
  el("candidateSelect").innerHTML = candidates.map((c, i) => `<option value="${i}">${c.name} · ${c.id}</option>`).join("");
  el("candidateSelect").value = String(selectedIndex);
  if (personalToken) document.querySelector(".candidate-picker").style.display = "none";
  el("candidateSelect").addEventListener("change", (event) => {
    selectedIndex = Number(event.target.value);
    render();
  });
  render();
}
