const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
            ...(options.headers || {})
        },
        credentials: "same-origin"
    });

    let data = null;
    if (response.status !== 204) {
        data = await response.json().catch(() => null);
    }

    if (!response.ok) {
        let errorMessage = "Ошибка выполнения запроса";
        if (data) {
            if (typeof data === "object" && !data.detail) {
                const messages = [];
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        messages.push(data[key].join(" "));
                    } else {
                        messages.push(data[key]);
                    }
                }
                errorMessage = messages.join(" ");
            } else if (data.detail) {
                errorMessage = data.detail;
            }
        }
        throw new Error(errorMessage);
    }
    return data;
}

async function changeStatus(ticketId, newStatus) {
    await apiRequest(`/tickets/api/tickets/${ticketId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
    });
    await loadTickets();
}

async function deleteTicket(ticketId, ticketTitle) {
    const confirmed = confirm(`Удалить заявку «${ticketTitle}»?`);
    if (!confirmed) return;

    await apiRequest(`/tickets/api/tickets/${ticketId}/`, {
        method: "DELETE"
    });
    await loadTickets();
}

const categorySelect = document.getElementById("category");
const form = document.getElementById("ticket-form");
const titleInput = document.getElementById("title");
const message = document.getElementById("message");
const list = document.getElementById("tickets-list");
const loading = document.getElementById("loading");
const filter = document.getElementById("status-filter");

function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = "alert " + (isError ? "alert-danger" : "alert-success");
}

async function loadCategories() {
    const categories = await apiRequest("/tickets/api/categories/");
    categorySelect.replaceChildren();
    for (const category of categories) {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.append(option);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        await apiRequest("/tickets/api/tickets/", {
            method: "POST",
            body: JSON.stringify({
                title: titleInput.value,
                category: Number(categorySelect.value)
            })
        });
        titleInput.value = "";
        showMessage("Заявка успешно создана");
        await loadTickets();
    } catch (error) {
        showMessage("Не удалось создать заявку: " + error.message, true);
    }
});

async function loadTickets() {
    loading.hidden = false;
    
    const statTotal = document.getElementById("stat-total");
    const statProgress = document.getElementById("stat-progress");
    const statDone = document.getElementById("stat-done");
    const params = new URLSearchParams();
    if (filter.value) {
        params.set("status", filter.value);
    }
    const query = params.toString();
    const url = "/tickets/api/tickets/" + (query ? "?" + query : "");

    try {
        const tickets = await apiRequest(url);
        
        if (statTotal) {
            statTotal.textContent = tickets.length;
            statProgress.textContent = tickets.filter(t => t.status === "progress").length;
            statDone.textContent = tickets.filter(t => t.status === "done").length;
        }

        list.replaceChildren();

        if (tickets.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Заявки не найдены";
            list.append(empty);
            return;
        }

        for (const ticket of tickets) {
            const row = document.createElement("div");
            row.className = "d-flex justify-content-between align-items-center border-bottom py-3 gap-3";

            const title = document.createElement("div");
            title.textContent = ticket.title + " — " + ticket.category_name;

            const controls = document.createElement("div");
            controls.className = "d-flex align-items-center gap-2";
            
            const statusBadge = document.createElement("span");
            statusBadge.className = "badge me-2 text-white";
            
            if (ticket.status === "new") {
                statusBadge.classList.add("bg-secondary");
                statusBadge.textContent = "Новая";
            } else if (ticket.status === "progress") {
                statusBadge.classList.add("bg-primary");
                statusBadge.textContent = "В работе";
            } else if (ticket.status === "done") {
                statusBadge.classList.add("bg-success");
                statusBadge.textContent = "Выполнена";
            }

            const btnStatus = document.createElement("button");
            btnStatus.className = "btn btn-sm btn-outline-primary";
            btnStatus.textContent = "Изменить статус";

            const btnDelete = document.createElement("button");
            btnDelete.className = "btn btn-sm btn-outline-danger";
            btnDelete.textContent = "Удалить";

            const statusSelect = document.createElement("select");
            statusSelect.className = "form-select form-select-sm";
            statusSelect.style.display = "none";
            statusSelect.style.width = "130px";

            const statuses = [
                { value: "new", label: "Новая" },
                { value: "progress", label: "В работе" },
                { value: "done", label: "Выполнена" }
            ];

            statuses.forEach(s => {
                const option = document.createElement("option");
                option.value = s.value;
                option.textContent = s.label;
                if (s.value === ticket.status) {
                    option.selected = true;
                }

                if (ticket.status === "new" && s.value === "done") option.disabled = true;
                if (ticket.status === "done" && s.value !== "done") option.disabled = true;
                if (ticket.status === "progress" && s.value === "new") option.disabled = true;

                statusSelect.append(option);
            });

            btnStatus.onclick = () => {
                if (statusSelect.style.display === "none") {
                    statusSelect.style.display = "block";
                    btnStatus.style.display = "none";
                }
            };

            statusSelect.addEventListener("change", async (e) => {
                const newStatus = e.target.value;
                try {
                    await changeStatus(ticket.id, newStatus);
                    showMessage("Статус успешно изменен");
                } catch (error) {
                    showMessage("Ошибка смены статуса: " + error.message, true);
                    await loadTickets();
                }
            });

            btnDelete.onclick = () => {
                const confirmed = confirm(`Удалить заявку «${ticket.title}»?`);
                if (confirmed) {
                    deleteTicket(ticket.id, ticket.title)
                        .then(() => showMessage("Заявка удалена"))
                        .catch(err => showMessage("Ошибка удаления: " + err.message, true));
                }
            };

            controls.append(statusBadge, btnStatus, statusSelect, btnDelete);
            row.append(title, controls);
            list.append(row);
        }
    } catch (error) {
        showMessage("Не удалось загрузить заявки: " + error.message, true);
    } finally {
        loading.hidden = true;
    }
}

filter.addEventListener("change", loadTickets);

async function initialize() {
    try {
        await loadCategories();
        await loadTickets();
    } catch (error) {
        showMessage("Ошибка инициализации: " + error.message, true);
    }
}

initialize();