// script.js

document.addEventListener('DOMContentLoaded', () => {
    // ... (все старые переменные) ...
    const addProjectBtn = document.getElementById('add-project-btn');
    const addModal = document.getElementById('add-project-modal');
    const addForm = document.getElementById('add-project-form');
    const projectsList = document.getElementById('projects-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    
    const viewModal = document.getElementById('image-modal');
    const viewModalContent = viewModal.querySelector('.image-modal-content');
    
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const confirmDeleteBtn = deleteConfirmationModal.querySelector('.confirm-delete');
    const cancelDeleteBtn = deleteConfirmationModal.querySelector('.cancel-delete');
    const deleteCloseBtn = deleteConfirmationModal.querySelector('.delete-close');
    
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    
    let projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
    let currentProjectData = null;
    let uploadedFileBase64 = null; // Храним Base64 текущего загруженного файла
    let projectToDelete = null;

    // --- Логика обработки файла ---
    const fileInput = document.getElementById('project-image-upload');
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Сохраняем Base64 строку
                uploadedFileBase64 = e.target.result;
                // (Опционально: показать превью в модальном окне добавления)
                console.log("Файл загружен и готов к сохранению.");
            };
            reader.readAsDataURL(file);
        } else {
            uploadedFileBase64 = null;
        }
    });


    // --- 1. Управление модальным окном добавления ---
    addProjectBtn.onclick = function() {
        addModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Сбрасываем Base64 при открытии нового окна
        uploadedFileBase64 = null; 
        fileInput.value = ''; // Очищаем поле ввода файла
    }

    // ... (функции closeModal и обработчик window.onclick остаются прежними) ...
    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (modal === viewModal) {
            viewModalContent.innerHTML = '<span class="close">&times;</span>'; // Очищаем контент
            currentProjectData = null;
        }
        if (modal === deleteConfirmationModal) {
            projectToDelete = null;
        }
    }
    addModal.querySelector('.close').onclick = () => closeModal(addModal);
    viewModal.querySelector('.close').onclick = () => closeModal(viewModal);
    deleteCloseBtn.onclick = () => closeModal(deleteConfirmationModal);

    confirmDeleteBtn.onclick = () => {
        if (projectToDelete !== null) {
            projects = projects.filter(p => p.id !== projectToDelete);
            localStorage.setItem('portfolioProjects', JSON.stringify(projects));
            renderProjects();
            closeModal(deleteConfirmationModal);
            projectToDelete = null;
        }
    };

    cancelDeleteBtn.onclick = () => closeModal(deleteConfirmationModal);

    window.onclick = function(event) {
        if (event.target == addModal) {
            closeModal(addModal);
        }
        if (event.target == viewModal && !viewModalContent.contains(event.target)) {
            closeModal(viewModal);
        }
        if (event.target == deleteConfirmationModal) {
            closeModal(deleteConfirmationModal);
        }
        if (event.target == contactModal) {
            closeModal(contactModal);
        }
    }

    // --- Управление модальным окном контакта ---
    contactBtn.onclick = function() {
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    contactModal.querySelector('.close').onclick = () => closeModal(contactModal);

    contactForm.onsubmit = function(e) {
        e.preventDefault();
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Пожалуйста, введите корректный email адрес.');
            return;
        }

        if (!message.trim()) {
            alert('Пожалуйста, введите сообщение.');
            return;
        }

        // Здесь укажите свой реальный email вместо 'your-email@example.com'
        const recipientEmail = 'michael.moroyuk01@gmail.com'; // <-- ВСТАВЬТЕ СЮДА СВОЙ EMAIL, КУДА ДОЛЖНО ПРИЙТИ FEEDBACK

        const subject = 'Feedback from Portfolio';
        const body = `From: ${email}\n\nMessage:\n${message}`;
        window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        alert('Спасибо за feedback! Ваше сообщение отправлено.');
        closeModal(contactModal);
        contactForm.reset();
    }

    window.onclick = function(event) {
        // ... existing ...
        if (event.target == contactModal) {
            closeModal(contactModal);
        }
    }

    // --- 2. Сохранение проекта (обновлено) ---

    addForm.onsubmit = function(e) {
        e.preventDefault();
        
        // Проверка: файл должен быть загружен
        if (!uploadedFileBase64) {
            alert("Пожалуйста, загрузите изображение проекта!");
            return;
        }

        const newProject = {
            id: Date.now(),
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            link: document.getElementById('project-link').value,
            // Сохраняем Base64 как URL изображения
            imageUrl: uploadedFileBase64 
        };
        
        projects.push(newProject);
        localStorage.setItem('portfolioProjects', JSON.stringify(projects));
        
        renderProjects();
        closeModal(addModal);
        addForm.reset();
        uploadedFileBase64 = null; // Очистка после сохранения
    }

    // --- Delete All Projects ---
    deleteAllBtn.onclick = function() {
        if (confirm('Are you sure you want to delete all projects? This action cannot be undone.')) {
            projects = [];
            localStorage.removeItem('portfolioProjects');
            renderProjects();
        }
    }

    // --- Функция открытия подтверждения удаления ---
    function openDeleteConfirmation(projectId) {
        projectToDelete = projectId;
        deleteConfirmationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // --- 3. Рендеринг и Логика Карточек (остается прежней) ---

    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.id = project.id;
        
        card.innerHTML = `
            <img src="${project.imageUrl}" alt="${project.name}">
            <div class="project-card-content">
                <h3>${project.name}</h3>
            </div>
            <button class="delete-btn" data-id="${project.id}">&times;</button>
        `;

        card.onclick = (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                openProjectView(project.id);
            }
        };

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            openDeleteConfirmation(project.id);
        };

        return card;
    }

    function renderProjects() {
        projectsList.innerHTML = '';
        if (projects.length === 0) {
            projectsList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #aaa;">Нажмите "+" чтобы добавить первый проект!</p>';
            return;
        }
        projects.forEach(project => {
            projectsList.appendChild(createProjectCard(project));
        });
    }
    
    // --- 4. Логика увеличения карточки (остается прежней) ---

    function openProjectView(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        currentProjectData = project;
        
        viewModalContent.innerHTML = `
            <span class="close">&times;</span>
            <img id="modal-project-image" src="${project.imageUrl}" alt="${project.name}">
            <div class="details-container">
                <h2>${project.name}</h2>
                <p>${project.description}</p>
                <p>
                    <a href="${project.link}" target="_blank">Посмотреть на GitHub &rarr;</a>
                </p>
            </div>
        `;
        
        const closeBtn = viewModalContent.querySelector('.close');
        closeBtn.onclick = () => closeModal(viewModal);
        
        viewModal.classList.add('active', 'viewing');
        document.body.style.overflow = 'hidden';
    }
    
    // Инициализация
    renderProjects();
});