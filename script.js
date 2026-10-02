let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";

let selectedDate = getToday();

// ============================
// التاريخ
// ============================

function getToday() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function changeDate() {

    const input = document.getElementById("viewDate");

    selectedDate = input.value;

    displayTasks();
    updateStats();
    updateDailyScore();
    updateDateDisplay();
}

function previousDay() {

    const date = new Date(selectedDate + "T00:00:00");

    date.setDate(date.getDate() - 1);

    selectedDate = formatDate(date);

    refreshDay();
}

function nextDay() {

    const date = new Date(selectedDate + "T00:00:00");

    date.setDate(date.getDate() + 1);

    selectedDate = formatDate(date);

    refreshDay();
}

function goToToday() {

    selectedDate = getToday();

    refreshDay();
}

function formatDate(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function refreshDay() {

    document.getElementById("viewDate").value = selectedDate;

    // نجعل تاريخ إضافة المهمة هو اليوم المختار
    document.getElementById("taskDate").value = selectedDate;

    displayTasks();
    updateStats();
    updateDailyScore();
    updateDateDisplay();
}

// ============================
// عرض التاريخ
// ============================

function updateDateDisplay() {

    const date = new Date(selectedDate + "T00:00:00");

    const today = new Date(getToday() + "T00:00:00");

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    let name = date.toLocaleDateString("ar", {
        weekday: "long"
    });

    if (selectedDate === getToday()) {

        name = "اليوم";

    } else if (
        selectedDate === formatDate(tomorrow)
    ) {

        name = "غدًا";

    } else if (
        selectedDate === formatDate(yesterday)
    ) {

        name = "أمس";

    }

    document.getElementById("dayName").textContent = name;

    document.getElementById("selectedDateText").textContent =
        date.toLocaleDateString("ar", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

// ============================
// النقاط
// ============================

function getPoints(priority) {

    if (priority === "high") return 3;

    if (priority === "medium") return 2;

    return 1;
}

// ============================
// إضافة مهمة
// ============================

function addTask() {

    const textInput = document.getElementById("taskInput");

    const dateInput = document.getElementById("taskDate");

    const priorityInput = document.getElementById("priority");

    const text = textInput.value.trim();

    const date = dateInput.value;

    const priority = priorityInput.value;

    if (!text) {

        alert("اكتب المهمة أولًا.");

        return;
    }

    if (!date) {

        alert("اختر تاريخ المهمة.");

        return;
    }

    const task = {

        id: Date.now(),

        text: text,

        date: date,

        priority: priority,

        status: "pending",

        createdAt: new Date().toISOString()

    };

    tasks.push(task);

    saveTasks();

    // الانتقال تلقائيًا إلى يوم المهمة
    selectedDate = date;

    document.getElementById("viewDate").value = date;

    textInput.value = "";

    refreshDay();
}

// ============================
// تغيير حالة المهمة
// ============================

function completeTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.status = "completed";

    saveTasks();

    refreshDay();
}

function failTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.status = "failed";

    saveTasks();

    refreshDay();
}

function resetTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.status = "pending";

    saveTasks();

    refreshDay();
}

// ============================
// حذف المهمة
// ============================

function deleteTask(id) {

    const confirmed = confirm(
        "هل تريد حذف هذه المهمة؟"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    refreshDay();
}

// ============================
// تعديل المهمة
// ============================

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newText = prompt(
        "عدّل المهمة:",
        task.text
    );

    if (newText === null) return;

    const cleanText = newText.trim();

    if (!cleanText) return;

    task.text = cleanText;

    saveTasks();

    refreshDay();
}

// ============================
// الفلاتر
// ============================

function setFilter(filter) {

    currentFilter = filter;

    displayTasks();
}

// ============================
// عرض المهام
// ============================

function displayTasks() {

    const taskList = document.getElementById("taskList");

    const emptyState = document.getElementById("emptyState");

    const searchText =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    taskList.innerHTML = "";

    let filteredTasks = tasks.filter(task => {

        const sameDate =
            task.date === selectedDate;

        const matchesSearch =
            task.text
                .toLowerCase()
                .includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            task.status === currentFilter;

        return (
            sameDate &&
            matchesSearch &&
            matchesFilter
        );

    });

    // ترتيب المهام حسب الأولوية
    filteredTasks.sort((a, b) => {

        return getPoints(b.priority) -
               getPoints(a.priority);

    });

    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    filteredTasks.forEach(task => {

        const div = document.createElement("div");

        div.className =
            "task " +
            (task.status === "completed"
                ? "completed"
                : "");

        let priorityText = "";

        if (task.priority === "high") {

            priorityText = "🔴 مهمة — 3 نقاط";

        } else if (task.priority === "medium") {

            priorityText = "🟡 متوسطة — 2 نقاط";

        } else {

            priorityText = "🟢 منخفضة — 1 نقطة";

        }

        let statusText = "";

        if (task.status === "completed") {

            statusText = "✅ منجزة";

        } else if (task.status === "failed") {

            statusText = "❌ لم تنجز";

        } else {

            statusText = "⏳ متبقية";

        }

        div.innerHTML = `

            <div class="task-title">
                ${escapeHTML(task.text)}
            </div>

            <div class="task-info">

                <span class="priority">
                    ${priorityText}
                </span>

                <span class="priority">
                    ${statusText}
                </span>

            </div>

            <div class="task-actions">

                ${
                    task.status !== "completed"
                    ?
                    `<button onclick="completeTask(${task.id})">
                        ✅ أنجزت
                    </button>`
                    :
                    ""
                }

                ${
                    task.status !== "failed"
                    ?
                    `<button onclick="failTask(${task.id})">
                        ❌ لم أنجز
                    </button>`
                    :
                    ""
                }

                ${
                    task.status !== "pending"
                    ?
                    `<button onclick="resetTask(${task.id})">
                        🔄 إعادة
                    </button>`
                    :
                    ""
                }

                <button onclick="editTask(${task.id})">
                    ✏️ تعديل
                </button>

                <button onclick="deleteTask(${task.id})">
                    🗑️ حذف
                </button>

            </div>
        `;

        taskList.appendChild(div);

    });
}

// ============================
// الإحصائيات
// ============================

function updateStats() {

    const todayTasks =
        tasks.filter(task =>
            task.date === selectedDate
        );

    const completed =
        todayTasks.filter(
            task => task.status === "completed"
        ).length;

    const failed =
        todayTasks.filter(
            task => task.status === "failed"
        ).length;

    const pending =
        todayTasks.filter(
            task => task.status === "pending"
        ).length;

    document.getElementById("totalTasks")
        .textContent = todayTasks.length;

    document.getElementById("completedTasks")
        .textContent = completed;

    document.getElementById("failedTasks")
        .textContent = failed;

    document.getElementById("pendingTasks")
        .textContent = pending;
}

// ============================
// التقييم اليومي
// ============================

function updateDailyScore() {

    const dayTasks =
        tasks.filter(task =>
            task.date === selectedDate
        );

    let possiblePoints = 0;

    let earnedPoints = 0;

    dayTasks.forEach(task => {

        const points =
            getPoints(task.priority);

        possiblePoints += points;

        if (task.status === "completed") {

            earnedPoints += points;

        }

    });

    let percentage = 0;

    if (possiblePoints > 0) {

        percentage =
            Math.round(
                (earnedPoints / possiblePoints) * 100
            );

    }

    document.getElementById("percentage")
        .textContent = percentage + "%";

    document.getElementById("earnedPoints")
        .textContent = earnedPoints;

    document.getElementById("possiblePoints")
        .textContent = possiblePoints;

    document.getElementById("progressBar")
        .style.width = percentage + "%";

    const message =
        document.getElementById("scoreMessage");

    if (dayTasks.length === 0) {

        message.textContent =
            "لا توجد مهام لهذا اليوم.";

    } else if (percentage === 100) {

        message.textContent =
            "🔥 ممتاز! أنجزت كل مهام هذا اليوم!";

    } else if (percentage >= 75) {

        message.textContent =
            "💪 أداء قوي جدًا!";

    } else if (percentage >= 50) {

        message.textContent =
            "👍 بداية جيدة، حاول رفع النسبة.";

    } else {

        message.textContent =
            "🎯 ركّز على المهام ذات الأولوية العالية.";

    }
}

// ============================
// حفظ البيانات
// ============================

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

// ============================
// حماية النص
// ============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

// ============================
// زر Enter
// ============================

document
    .getElementById("taskInput")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            addTask();

        }

    });

// ============================
// التشغيل الأول
// ============================

document.getElementById("viewDate").value =
    selectedDate;

document.getElementById("taskDate").value =
    selectedDate;

updateDateDisplay();

displayTasks();

updateStats();

updateDailyScore();