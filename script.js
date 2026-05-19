// script.js

const LOCAL_STORAGE_LANGUAGE_KEY = 'userLanguage';
const LOCAL_STORAGE_THEME_KEY = 'userTheme';
const LANGUAGE_ATTRIBUTE_NAME = 'lang';
const HIDDEN_CLASS_NAME = 'hidden';
const ACTIVE_LANGUAGE_BUTTON_CLASS_NAME = 'active';
const DARK_THEME_CLASS_NAME = 'dark-theme';

function getFromLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value;
    } catch (error) {
        console.error(`Ошибка при чтении из локального хранилища: ${error}`);
        return null;
    }
}

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error(`Ошибка при записи в локальное хранилище: ${error}`);
        return false;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Ошибка при удалении из локального хранилища: ${error}`);
        return false;
    }
}

function setLanguage(languageCode) {
    const elementsToTranslate = document.querySelectorAll(`[${LANGUAGE_ATTRIBUTE_NAME}]`);
    elementsToTranslate.forEach(element => {
        const elementLanguage = element.getAttribute(LANGUAGE_ATTRIBUTE_NAME);
        if (elementLanguage === languageCode) {
            element.classList.remove(HIDDEN_CLASS_NAME);
        } else {
            element.classList.add(HIDDEN_CLASS_NAME);
        }
    });

    const languageButtons = document.querySelectorAll('.lang-button');
    languageButtons.forEach(button => {
        const buttonLanguage = button.getAttribute('data-lang');
        if (buttonLanguage === languageCode) {
            button.classList.add(ACTIVE_LANGUAGE_BUTTON_CLASS_NAME);
        } else {
            button.classList.remove(ACTIVE_LANGUAGE_BUTTON_CLASS_NAME);
        }
    });

    saveToLocalStorage(LOCAL_STORAGE_LANGUAGE_KEY, languageCode);
    document.documentElement.setAttribute(LANGUAGE_ATTRIBUTE_NAME, languageCode);
}

function initializeLanguageSwitcher() {
    const savedLanguage = getFromLocalStorage(LOCAL_STORAGE_LANGUAGE_KEY);
    const defaultLanguage = savedLanguage ? savedLanguage : 'ru';
    setLanguage(defaultLanguage);

    const languageButtons = document.querySelectorAll('.language-switcher .lang-button');
    languageButtons.forEach(button => {
        button.addEventListener('click', () => {
            const languageCode = button.getAttribute('data-lang');
            setLanguage(languageCode);

             if (document.body.classList.contains('index-page')) {
                 fetchTopSpecialists().then(specialists => {
                     renderTopSpecialists(specialists, languageCode);
                 });
             } else if (document.body.classList.contains('vacancies-page')) {
                 fetchVacancies().then(vacancies => {
                     renderVacancies(vacancies, languageCode);
                 });
             } else if (document.body.classList.contains('profile-page')) {
                 fetchUserProfile().then(userProfile => {
                     renderUserProfile(userProfile, languageCode);
                 });
             } else if (document.body.classList.contains('vacancy-page')) {
                 const vacancyId = getVacancyIdFromUrl();
                 if (vacancyId) {
                     fetchVacancyById(vacancyId).then(vacancy => {
                         if (vacancy) {
                              renderVacancyDetails(vacancy, languageCode);
                         } else {
                              renderVacancyNotFoundError(languageCode);
                         }
                     }).catch(error => {
                         console.error('Ошибка загрузки деталей вакансии:', error);
                          renderVacancyLoadError(languageCode);
                     });
                 } else {
                     renderVacancyIdMissingError(languageCode);
                 }
             }
        });
    });
}

function toggleTheme() {
    const bodyElement = document.body;
    const isDarkTheme = bodyElement.classList.contains(DARK_THEME_CLASS_NAME);

    if (isDarkTheme) {
        bodyElement.classList.remove(DARK_THEME_CLASS_NAME);
        saveToLocalStorage(LOCAL_STORAGE_THEME_KEY, 'light');
    } else {
        bodyElement.classList.add(DARK_THEME_CLASS_NAME);
        saveToLocalStorage(LOCAL_STORAGE_THEME_KEY, 'dark');
    }
}

function initializeThemeSwitcher() {
    const savedTheme = getFromLocalStorage(LOCAL_STORAGE_THEME_KEY);
    const bodyElement = document.body;

    if (savedTheme) {
        if (savedTheme === 'dark') {
            bodyElement.classList.add(DARK_THEME_CLASS_NAME);
        } else {
            bodyElement.classList.remove(DARK_THEME_CLASS_NAME);
        }
    } else {
        bodyElement.classList.remove(DARK_THEME_CLASS_NAME);
    }

    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
}

function isValidEmail(email) {
    if (typeof email !== 'string' || email.trim() === '') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    if (typeof password !== 'string' || password.length < 8) {
        return false;
    }
    return true;
}

function showValidationError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.classList.add('error-message');
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
        formGroup.classList.add('has-error');
    }
}

function hideValidationError(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        formGroup.classList.remove('has-error');
    }
}

function handleLoginFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');

    hideValidationError(emailInput);
    hideValidationError(passwordInput);

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let hasError = false;

    if (!isValidEmail(email)) {
        showValidationError(emailInput, 'Пожалуйста, введите корректный Email.');
        hasError = true;
    }

    if (!isValidPassword(password)) {
        showValidationError(passwordInput, 'Пароль должен содержать минимум 8 символов.');
        hasError = true;
    }

    if (!hasError) {
        console.log('Данные для входа:', { email, password });
        alert('Форма входа успешно валидирована (имитация отправки).');
        form.reset();
        saveToLocalStorage('isLoggedIn', 'true');
        window.location.href = 'profile.html';
    } else {
        console.log('В форме входа есть ошибки.');
    }
}

function handleRegisterFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm-password');

    hideValidationError(nameInput);
    hideValidationError(emailInput);
    hideValidationError(passwordInput);
    hideValidationError(confirmPasswordInput);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let hasError = false;

    if (name === '') {
        showValidationError(nameInput, 'Пожалуйста, введите ваше имя.');
        hasError = true;
    }

    if (!isValidEmail(email)) {
        showValidationError(emailInput, 'Пожалуйста, введите корректный Email.');
        hasError = true;
    }

    if (!isValidPassword(password)) {
        showValidationError(passwordInput, 'Пароль должен содержать минимум 8 символов.');
        hasError = true;
    }

    if (password !== confirmPassword) {
        showValidationError(confirmPasswordInput, 'Пароли не совпадают.');
        hasError = true;
    }

    if (!hasError) {
        console.log('Данные для регистрации:', { name, email, password });
        alert('Форма регистрации успешно валидирована (имитация отправки).');
        form.reset();
        alert('Регистрация прошла успешно! Теперь вы можете войти.');
        window.location.href = 'login.html';
    } else {
        console.log('В форме регистрации есть ошибки.');
    }
}

function handleContactFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');

    hideValidationError(nameInput);
    hideValidationError(emailInput);
    hideValidationError(messageInput);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    let hasError = false;

    if (name === '') {
        showValidationError(nameInput, 'Пожалуйста, введите ваше имя.');
        hasError = true;
    }

    if (!isValidEmail(email)) {
        showValidationError(emailInput, 'Пожалуйста, введите корректный Email.');
        hasError = true;
    }

    if (message === '') {
        showValidationError(messageInput, 'Пожалуйста, введите ваше сообщение.');
        hasError = true;
    }

    if (!hasError) {
        console.log('Данные обратной связи:', { name, email, message });
        alert('Форма обратной связи успешно валидирована (имитация отправки).');
        form.reset();
         alert('Ваше сообщение успешно отправлено (имитация).');
    } else {
        console.log('В форме обратной связи есть ошибки.');
    }
}

function handleProfileEditFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const universityInput = form.querySelector('#university');
    const facultyInput = form.querySelector('#faculty');
    const courseInput = form.querySelector('#course');

    hideValidationError(nameInput);
    hideValidationError(emailInput);
    hideValidationError(universityInput);
    hideValidationError(facultyInput);
    if (courseInput) {
        hideValidationError(courseInput);
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const university = universityInput ? universityInput.value.trim() : '';
    const faculty = facultyInput ? facultyInput.value.trim() : '';
    const course = courseInput ? courseInput.value.trim() : '';

    let hasError = false;

    if (name === '') {
        showValidationError(nameInput, 'Пожалуйста, введите ваше имя.');
        hasError = true;
    }

    if (!isValidEmail(email)) {
        showValidationError(emailInput, 'Пожалуйста, введите корректный Email.');
        hasError = true;
    }

    if (courseInput && course !== '') {
        const courseNumber = parseInt(course, 10);
        const minCourse = parseInt(courseInput.min, 10) || 1;
        const maxCourse = parseInt(courseInput.max, 10) || 6;

        if (isNaN(courseNumber) || courseNumber < minCourse || courseNumber > maxCourse) {
            showValidationError(courseInput, `Пожалуйста, введите корректный курс (от ${minCourse} до ${maxCourse}).`);
            hasError = true;
        }
    }

    if (!hasError) {
        console.log('Обновленные данные профиля:', { name, email, university, faculty, course });
        alert('Профиль успешно валидирован (имитация отправки).');
         const updatedProfileData = { name, email, university, faculty, course };
         saveToLocalStorage('userProfile', JSON.stringify(updatedProfileData));
        window.location.href = 'profile.html';
    } else {
        console.log('В форме редактирования профиля есть ошибки.');
    }
}

function handleLogout() {
    console.log('Выход из системы (имитация).');
    removeFromLocalStorage('isLoggedIn');
    removeFromLocalStorage('userProfile');
    window.location.href = 'login.html';
}


// --- Мок-данные для имитации бэкенда ---

const mockVacancies = [
    {
        id: 1,
        title: { ru: 'Младший разработчик (Java)', kz: 'Кіші әзірлеуші (Java)' },
        description: { ru: 'Требуется младший разработчик Java для участия в разработке университетских проектов. Вы будете работать в команде опытных инженеров, участвовать в полном цикле разработки, от проектирования до тестирования и внедрения. Ожидается активное участие в обсуждениях и принятие решений.', kz: 'Университет жобаларын әзірлеуге қатысу үшін кіші Java әзірлеушісі қажет. Сіз тәжірибелі инженерлер командасында жұмыс істейсіз, жобалаудан бастап тестілеуге және енгізуге дейінгі толық әзірлеу цикліне қатысасыз. Талқылауларға белсенді қатысу және шешім қабылдау күтіледі.' },
        department: { ru: 'Кафедра информатики', kz: 'Информатика кафедрасы' },
        requirements: { ru: ['Знание основ Java Core', 'Понимание принципов ООП', 'Базовые навыки работы с системами контроля версий (Git)', 'Желание учиться и развиваться'], kz: ['Java Core негіздерін білу', 'ООП қағидаттарын түсіну', 'Нұсқаларды басқару жүйелерімен (Git) жұмыс істеудің базалық дағдылары', 'Оқуға және дамуға деген ниет'] },
        contactEmail: 'informatics.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X1'
    },
    {
        id: 2,
        title: { ru: 'Веб-дизайнер', kz: 'Веб-дизайнер' },
        description: { ru: 'Ищем креативного веб-дизайнера для разработки интерфейсов университетских сайтов и приложений. Вам предстоит работать над улучшением пользовательского опыта и визуального стиля наших онлайн-ресурсов.', kz: 'Университет веб-сайттары мен қосымшаларының интерфейстерін әзірлеуге арналған креативті веб-дизайнер іздейміз. Сіз біздің онлайн-ресурстарымыздың пайдаланушы тәжірибесін және визуалды стилін жақсарту бойынша жұмыс істейсіз.' },
        department: { ru: 'Отдел по связям с общественностью', kz: 'Қоғаммен байланыс бөлімі' },
        requirements: { ru: ['Опыт работы с Figma, Sketch или Adobe XD', 'Знание принципов UX/UI дизайна', 'Наличие портфолио с примерами работ'], kz: ['Figma, Sketch немесе Adobe XD бағдарламаларымен жұмыс істеу тәжірибесі', 'UX/UI дизайны қағидаттарын білу', 'Жұмыс мысалдары бар портфолио болуы'] },
        contactEmail: 'pr.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X2'
    },
     {
        id: 3,
        title: { ru: 'Специалист технической поддержки', kz: 'Техникалық қолдау маманы' },
        description: { ru: 'Требуется специалист для оказания технической поддержки пользователям университетской сети и программного обеспечения. Работа включает консультирование, решение типовых проблем и эскалацию сложных случаев.', kz: 'Университет желісінің және бағдарламалық қамтамасыз етудің пайдаланушыларына техникалық қолдау көрсету үшін маман қажет. Жұмыс кеңес беруді, типтік мәселелерді шешуді және күрделі жағдайларды эскалациялауды қамтиды.' },
        department: { ru: 'ИТ-отдел', kz: 'Ақпараттық технологиялар бөлімі' },
        requirements: { ru: ['Знание основ работы с ПК и оргтехникой', 'Коммуникабельность и стрессоустойчивость', 'Умение четко излагать мысли и объяснять сложные вещи простым языком'], kz: ['Компьютерлермен және кеңсе техникасымен жұмыс істеу негіздерін білу', 'Коммуникативтілік және стресске төзімділік', 'Ойды нақты жеткізу және күрделі нәрселерді қарапайым тілмен түсіндіру қабілеті'] },
        contactEmail: 'it.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X3'
    },
     {
        id: 6,
        title: { ru: 'Преподаватель математики', kz: 'Математика оқытушысы' },
        description: { ru: 'Требуется преподаватель для ведения занятий по высшей математике для студентов технических специальностей.', kz: 'Техникалық мамандықтар студенттеріне жоғары математика бойынша сабақ беру үшін оқытушы қажет.' },
        department: { ru: 'Кафедра высшей математики', kz: 'Жоғары математика кафедрасы' },
        requirements: { ru: ['Ученая степень (кандидат/доктор наук)', 'Опыт преподавательской деятельности в вузе', 'Знание современных методик преподавания'], kz: ['Ғылыми дәреже (кандидат/ғылым докторы)', 'ЖОО-да оқытушылық тәжірибесі', 'Заманауи оқыту әдістемелерін білу'] },
        contactEmail: 'math.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X6'
    },
    {
        id: 7,
        title: { ru: 'Секретарь кафедры', kz: 'Кафедра хатшысы' },
        description: { ru: 'Организация документооборота кафедры, взаимодействие со студентами и преподавателями. Ведение расписания, подготовка документов.', kz: 'Кафедраның құжат айналымын ұйымдастыру, студенттермен және оқытушылармен өзара іс-қимыл жасау. Кестені жүргізу, құжаттарды дайындау.' },
        department: { ru: 'Различные кафедры', kz: 'Әр түрлі кафедралар' },
        requirements: { ru: ['Знание основ делопроизводства', 'Уверенное владение ПК (Word, Excel)', 'Коммуникабельность и ответственность'], kz: ['Іс қағаздарын жүргізу негіздерін білу', 'Компьютерді сенімді меңгеру (Word, Excel)', 'Коммуникативтілік және жауапкершілік'] },
        contactEmail: 'hr.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X7'
    },
    {
        id: 11,
        title: { ru: 'Инженер-исследователь', kz: 'Инженер-зерттеуші' },
        description: { ru: 'Участие в научно-исследовательских проектах университета, проведение экспериментов, анализ результатов.', kz: 'Университеттің ғылыми-зерттеу жобаларына қатысу, эксперименттер жүргізу, нәтижелерді талдау.' },
        department: { ru: 'Научно-исследовательский институт', kz: 'Ғылыми-зерттеу институты' },
        requirements: { ru: ['Высшее техническое образование', 'Опыт работы в исследовательских проектах', 'Знание методов обработки данных'], kz: ['Жоғары техникалық білім', 'Зерттеу жобаларында жұмыс тәжірибесі', 'Деректерді өңдеу әдістерін білу'] },
        contactEmail: 'research.institute@university.com',
        contactPhone: '+7 (XXX) XXX-XX-11'
    },
    {
        id: 12,
        title: { ru: 'Переводчик', kz: 'Аудармашы' },
        description: { ru: 'Письменный и устный перевод материалов университета (документы, презентации, выступления).', kz: 'Университет материалдарын жазбаша және ауызша аудару (құжаттар, презентациялар, баяндамалар).' },
        department: { ru: 'Международный отдел', kz: 'Халықаралық бөлім' },
        requirements: { ru: ['Высшее филологическое/лингвистическое образование', 'Свободное владение русским, казахским и английским языками', 'Опыт переводческой деятельности'], kz: ['Жоғары филологиялық/лингвистикалық білім', 'Орыс, қазақ және ағылшын тілдерін еркін меңгеру', 'Аудармашылық тәжірибесі'] },
        contactEmail: 'international.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-12'
    }
];

const mockOtherVacancies = [
     {
        id: 4,
        title: { ru: 'Старший разработчик (Python)', kz: 'Жоғары әзірлеуші (Python)' },
        description: { ru: 'Опытный разработчик Python для руководства проектом. Вам предстоит заниматься проектированием архитектуры, написанием чистого и поддерживаемого кода, а также наставничеством для младших членов команды.', kz: 'Жобаны басқаруға арналған тәжірибелі Python әзірлеушісі. Сіз архитектураны жобалаумен, таза және қолдау көрсетілетін код жазумен, сондай-ақ команданың кіші мүшелеріне тәлімгерлік жасаумен айналысасыз.' },
        department: { ru: 'Кафедра информатики', kz: 'Информатика кафедрасы' },
        requirements: { ru: ['Опыт работы от 3 лет на Python', 'Глубокие знания фреймворков (Django, Flask)', 'Опыт работы с базами данных (PostgreSQL, MySQL)', 'Понимание принципов RESTful API'], kz: ['Python-да 3 жылдан астам жұмыс тәжірибесі', 'Фреймворктерді терең білу (Django, Flask)', 'Дерекқорлармен жұмыс тәжірибесі (PostgreSQL, MySQL)', 'RESTful API қағидаттарын түсіну'] },
        contactEmail: 'informatics.lead@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X4'
    },
    {
        id: 5,
        title: { ru: 'Аналитик данных', kz: 'Деректерді талдаушы' },
        description: { ru: 'Требуется аналитик для работы с большими объемами данных университета. Задачи включают сбор, обработку, анализ данных и подготовку отчетов для принятия управленческих решений.', kz: 'Университеттің үлкен көлемді деректерімен жұмыс істеу үшін талдаушы қажет. Міндеттерге деректерді жинау, өңдеу, талдау және басқарушылық шешімдер қабылдау үшін есептерді дайындау кіреді.' },
        department: { ru: 'Отдел исследований', kz: 'Зерттеу бөлімі' },
        requirements: { ru: ['Уверенное знание SQL', 'Опыт работы с Python или R для анализа данных', 'Знание инструментов визуализации данных (Tableau, Power BI)', 'Аналитический склад ума'], kz: ['SQL-ді сенімді білу', 'Деректерді талдау үшін Python немесе R бағдарламаларымен жұмыс тәжірибесі', 'Деректерді визуализациялау құралдарын білу (Tableau, Power BI)', 'Талдамалы ойлау қабілеті'] },
        contactEmail: 'research.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X5'
    },
     {
        id: 8,
        title: { ru: 'Лаборант', kz: 'Лаборант' },
        description: { ru: 'Выполнение лабораторных работ под руководством преподавателя. Подготовка оборудования, помощь студентам во время занятий.', kz: 'Оқытушының басшылығымен зертханалық жұмыстарды орындау. Жабдықты дайындау, сабақ кезінде студенттерге көмектесу.' },
        department: { ru: 'Различные кафедры', kz: 'Әр түрлі кафедралар' },
        requirements: { ru: ['Внимательность к деталям', 'Умение работать с лабораторным оборудованием', 'Ответственность'], kz: ['Детальдарға мұқият болу', 'Зертханалық жабдықпен жұмыс істей білу', 'Жауапкершілік'] },
        contactEmail: 'hr.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X8'
    },
     {
        id: 9,
        title: { ru: 'Помощник библиотекаря', kz: 'Кітапханашы көмекшісі' },
        description: { ru: 'Помощь в обслуживании читателей, приеме и расстановке книг, поддержание порядка в читальных залах.', kz: 'Оқырмандарға қызмет көрсетуге көмектесу, кітаптарды қабылдау және орналастыру, оқу залдарында тәртіпті сақтау.' },
        department: { ru: 'Библиотека', kz: 'Кітапхана' },
        requirements: { ru: ['Аккуратность и внимательность', 'Коммуникабельность и вежливость'], kz: ['Ұқыптылық және мұқияттылық', 'Коммуникативтілік және сыпайылық'] },
        contactEmail: 'library@university.com',
        contactPhone: '+7 (XXX) XXX-XX-X9'
    },
     {
        id: 10,
        title: { ru: 'Администратор сайта университета', kz: 'Университет сайтының әкімшісі' },
        description: { ru: 'Поддержка и обновление информации на официальном сайте университета. Работа с контентом, исправление ошибок, взаимодействие с отделами.', kz: 'Университеттің ресми сайтындағы ақпаратты қолдау және жаңарту. Контентпен жұмыс істеу, қателерді түзету, бөлімдермен өзара іс-қимыл жасау.' },
        department: { ru: 'ИТ-отдел', kz: 'Ақпараттық технологиялар бөлімі' },
        requirements: { ru: ['Базовые знания HTML/CSS', 'Опыт работы с CMS (например, WordPress, Joomla)', 'Внимательность к деталям'], kz: ['HTML/CSS базалық білімдері', 'CMS-пен жұмыс тәжірибесі (мысалы, WordPress, Joomla)', 'Мұқияттылық'] },
        contactEmail: 'it.dept@university.com',
        contactPhone: '+7 (XXX) XXX-XX-10'
    }
];


const mockTopSpecialists = [
    {
        id: 101,
        name: 'Петров Сергей',
        specialization: { ru: 'Веб-разработка', kz: 'Веб-әзірлеу' },
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
        profileUrl: '#'
    },
    {
        id: 102,
        name: 'Сидорова Анна',
        specialization: { ru: 'Дизайн интерфейсов', kz: 'Интерфейстер дизайны' },
        skills: ['Figma', 'Sketch', 'Adobe XD', 'UX/UI', 'Прототипирование'],
        profileUrl: '#'
    },
     {
        id: 103,
        name: 'Козлов Алексей',
        specialization: { ru: 'Мобильная разработка (Android)', kz: 'Мобильді әзірлеу (Android)' },
        skills: ['Kotlin', 'Java', 'Android Studio', 'RESTful API'],
        profileUrl: '#'
    },
    {
        id: 104,
        name: 'Морозова Елена',
        specialization: { ru: 'Анализ данных', kz: 'Деректерді талдау' },
        skills: ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Matplotlib'],
        profileUrl: '#'
    },
    {
        id: 105,
        name: 'Федоров Дмитрий',
        specialization: { ru: 'Кибербезопасность', kz: 'Киберқауіпсіздік' },
        skills: ['Сетевая безопасность', 'Криптография', 'Тестирование на проникновение'],
        profileUrl: '#'
    }
];


// --- Функции для работы с вакансиями и профилем ---

async function fetchVacancies() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockVacancies;
}

async function fetchUserProfile() {
    await new Promise(resolve => setTimeout(resolve, 500));
    const isLoggedIn = getFromLocalStorage('isLoggedIn') === 'true';
    if (isLoggedIn) {
         const savedProfileData = getFromLocalStorage('userProfile');
         if (savedProfileData) {
             try {
                 const parsedData = JSON.parse(savedProfileData);
                 return { ...mockUserProfile, ...parsedData };
             } catch (e) {
                 console.error("Ошибка парсинга сохраненных данных профиля:", e);
                 return mockUserProfile;
             }
         }
        return mockUserProfile;
    } else {
        return null;
    }
}

async function fetchVacancyById(vacancyId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const id = parseInt(vacancyId, 10);
    if (isNaN(id)) return undefined;

    return mockVacancies.find(vacancy => vacancy.id === id) || mockOtherVacancies.find(vacancy => vacancy.id === id);
}

async function fetchTopSpecialists() {
     await new Promise(resolve => setTimeout(resolve, 400));
     return mockTopSpecialists;
}


function renderVacancies(vacancies, currentLanguage) {
    const vacanciesListContainer = document.querySelector('.vacancies-list');
    if (!vacanciesListContainer) {
        console.error('Контейнер .vacancies-list не найден на странице.');
        return;
    }

    vacanciesListContainer.innerHTML = '';

    if (!vacancies || vacancies.length === 0) {
        vacanciesListContainer.innerHTML = `
            <p lang="ru">Вакансий пока нет.</p>
            <p lang="kz" class="hidden">Әзірге бос жұмыс орындары жоқ.</p>
        `;
        setLanguage(currentLanguage);
        return;
    }

    vacancies.forEach(vacancy => {
        const title = vacancy.title[currentLanguage] || vacancy.title['ru'];
        const description = (vacancy.description[currentLanguage] || vacancy.description['ru']).substring(0, 150) + '...';
        const department = vacancy.department[currentLanguage] || vacancy.department['ru'];

        const vacancyElement = `
            <div class="vacancy-item">
                <h3>${title}</h3>
                <p><strong>${currentLanguage === 'ru' ? 'Отдел/Кафедра:' : 'Бөлім/Кафедра:'}</strong> ${department}</p>
                <p>${description}</p>
                 <a href="vacancy.html?id=${vacancy.id}" class="button blue small">
                     <span lang="ru">Подробнее</span>
                     <span lang="kz" class="hidden">Толығырақ</span>
                </a>
                <button class="button gray small apply-button" data-vacancy-id="${vacancy.id}">
                     <span lang="ru">Откликнуться</span>
                     <span lang="kz" class="hidden">Жауап беру</span>
                </button>
            </div>
        `;
        vacanciesListContainer.innerHTML += vacancyElement;
    });

    setLanguage(currentLanguage);

    const applyButtons = vacanciesListContainer.querySelectorAll('.apply-button');
    applyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const vacancyId = event.target.closest('.apply-button').getAttribute('data-vacancy-id');
            handleApply(vacancyId);
        });
    });
}

function renderTopSpecialists(specialists, currentLanguage) {
     const specialistsListContainer = document.querySelector('.top-specialists .specialists-list');
    if (!specialistsListContainer) {
        console.error('Контейнер .top-specialists .specialists-list не найден на странице.');
        return;
    }

    specialistsListContainer.innerHTML = '';

    if (!specialists || specialists.length === 0) {
        specialistsListContainer.innerHTML = `
            <p lang="ru">Список специалистов пока пуст.</p>
            <p lang="kz" class="hidden">Мамандар тізімі әзірге бос.</p>
        `;
         setLanguage(currentLanguage);
        return;
    }

    specialists.forEach(specialist => {
        const specialization = specialist.specialization[currentLanguage] || specialist.specialization['ru'];
        const skillsHtml = (specialist.skills || [])
            .map(skill => `<li>${skill}</li>`)
            .join('');

        const specialistElement = `
            <div class="specialist-item">
                <h3>${specialist.name}</h3>
                <p><strong>${currentLanguage === 'ru' ? 'Специализация:' : 'Мамандануы:'}</strong> ${specialization}</p>
                <h4>${currentLanguage === 'ru' ? 'Навыки:' : 'Дағдылары:'}</h4>
                <ul>
                    ${skillsHtml}
                </ul>
                <a href="${specialist.profileUrl}" class="button blue small">
                     <span lang="ru">Профиль</span>
                     <span lang="kz" class="hidden">Профиль</span>
                </a>
            </div>
        `;
        specialistsListContainer.innerHTML += specialistElement;
    });

    setLanguage(currentLanguage);
}


function renderUserProfile(userProfile, currentLanguage) {
    const nameElement = document.querySelector('.user-info #name-placeholder');
    const emailElement = document.querySelector('.user-info #email-placeholder');
    const universityElement = document.querySelector('.user-info #university-placeholder');
    const facultyElement = document.querySelector('.user-info #faculty-placeholder');
    const courseElement = document.querySelector('.user-info #course-placeholder');
    const courseLabelElement = document.querySelector('.user-info #course-label');


    if (!userProfile) {
         console.warn('Данные профиля пользователя не загружены или пользователь не авторизован.');
         return;
    }

    if (nameElement) nameElement.textContent = userProfile.name;
    if (emailElement) emailElement.textContent = userProfile.email;
    if (universityElement) universityElement.textContent = userProfile.university || (currentLanguage === 'ru' ? 'Не указано' : 'Көрсетілмеген');
    if (facultyElement) facultyElement.textContent = userProfile.faculty || (currentLanguage === 'ru' ? 'Не указано' : 'Көрсетілмеген');

    if (courseElement && courseLabelElement) {
        if (userProfile.course !== undefined && userProfile.course !== null && userProfile.course !== '') {
             courseElement.textContent = userProfile.course;
             const formGroupOrP = courseElement.closest('.form-group, p');
             if(formGroupOrP) formGroupOrP.classList.remove(HIDDEN_CLASS_NAME);
        } else {
             const formGroupOrP = courseElement.closest('.form-group, p');
             if(formGroupOrP) formGroupOrP.classList.add(HIDDEN_CLASS_NAME);
        }
    }

    const applicationsListContainer = document.querySelector('.application-list');
    if (applicationsListContainer && userProfile.applications) {
        applicationsListContainer.innerHTML = '';

         const allMockVacancies = [...mockVacancies, ...mockOtherVacancies];

        userProfile.applications.forEach(async app => {
             const vacancy = await fetchVacancyById(app.vacancyId);

             if (vacancy) {
                const vacancyTitle = vacancy.title[currentLanguage] || vacancy.title['ru'];
                let statusText = '';
                let statusClass = '';

                if (app.status === 'pending') {
                    statusText = currentLanguage === 'ru' ? 'В ожидании' : 'Күтуде';
                    statusClass = 'pending';
                } else if (app.status === 'accepted') {
                    statusText = currentLanguage === 'ru' ? 'Принято' : 'Қабылданды';
                    statusClass = 'accepted';
                } else if (app.status === 'rejected') {
                    statusText = currentLanguage === 'ru' ? 'Отклонено' : 'Қабылданбады';
                    statusClass = 'rejected';
                }

                const applicationElement = `
                    <li>
                         <strong lang="ru">Вакансия:</strong>
                         <strong lang="kz" class="hidden">Вакансия:</strong>
                         <a href="vacancy.html?id=${vacancy.id}" lang="ru">${vacancyTitle}</a>
                         <a href="vacancy.html?id=${vacancy.id}" lang="kz" class="hidden">${vacancyTitle}</a>
                         <span class="status ${statusClass}" lang="ru">${statusText}</span>
                         <span class="status ${statusClass} hidden" lang="kz">${statusText}</span>
                    </li>
                `;
                 applicationsListContainer.insertAdjacentHTML('beforeend', applicationElement);
             }
        });
          setTimeout(() => setLanguage(currentLanguage), 600);

    }

    const savedVacanciesListContainer = document.querySelector('.saved-list');
     if (savedVacanciesListContainer && userProfile.savedVacancies) {
        savedVacanciesListContainer.innerHTML = '';

        const allMockVacancies = [...mockVacancies, ...mockOtherVacancies];

        userProfile.savedVacancies.forEach(async vacancyId => {
            const vacancy = await fetchVacancyById(vacancyId);

            if (vacancy) {
                const vacancyTitle = vacancy.title[currentLanguage] || vacancy.title['ru'];

                const savedVacancyElement = `
                    <li>
                        <a href="vacancy.html?id=${vacancy.id}" lang="ru">${vacancyTitle}</a>
                        <a href="vacancy.html?id=${vacancy.id}" lang="kz" class="hidden">${vacancyTitle}</a>
                        <button class="button small remove-saved-button" data-vacancy-id="${vacancy.id}">
                             <span lang="ru">Удалить</span>
                             <span lang="kz" class="hidden">Жою</span>
                        </button>
                    </li>
                `;
                 savedVacanciesListContainer.insertAdjacentHTML('beforeend', savedVacancyElement);
            }
        });
        setTimeout(() => setLanguage(currentLanguage), 600);

        setTimeout(() => {
            const removeSavedButtons = savedVacanciesListContainer.querySelectorAll('.remove-saved-button');
             removeSavedButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                     const vacancyId = event.target.closest('.remove-saved-button').getAttribute('data-vacancy-id');
                     handleRemoveSaved(vacancyId);
                });
            });
        }, 700);
    }

     const userFormsListContainer = document.querySelector('.user-forms .form-list');
     if (userFormsListContainer) {
         setLanguage(currentLanguage);
     }

     setLanguage(currentLanguage);
}


function handleApply(vacancyId) {
    const isLoggedIn = getFromLocalStorage('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('Пожалуйста, войдите или зарегистрируйтесь, чтобы откликнуться на вакансию.');
        window.location.href = 'login.html';
        return;
    }

    console.log(`Отклик на вакансию ID: ${vacancyId} (имитация)`);
    alert(`Вы успешно откликнулись на вакансию ID ${vacancyId} (имитация).`);
}


function handleRemoveSaved(vacancyId) {
    const isLoggedIn = getFromLocalStorage('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('Пожалуйста, войдите, чтобы управлять сохраненными вакансиями.');
        window.location.href = 'login.html';
        return;
    }

    console.log(`Удаление сохраненной вакансии ID: ${vacancyId} (имитация)`);
    alert(`Вакансия ID ${vacancyId} удалена из сохраненных (имитация).`);

    const savedItemElement = document.querySelector(`.saved-list li a[href="vacancy.html?id=${vacancyId}"]`);
    if (savedItemElement) {
        savedItemElement.closest('li').remove();
         let userProfile = JSON.parse(getFromLocalStorage('userProfile')) || mockUserProfile;
         userProfile.savedVacancies = userProfile.savedVacancies.filter(id => id != vacancyId);
         saveToLocalStorage('userProfile', JSON.stringify(userProfile));
    }
}

function getVacancyIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderVacancyDetails(vacancy, currentLanguage) {
    const detailsContainer = document.querySelector('.vacancy-details');
     if (!detailsContainer) {
         console.error('Контейнер .vacancy-details не найден на странице.');
         return;
     }

    if (!vacancy) {
         renderVacancyNotFoundError(currentLanguage);
         return;
    }

    const title = vacancy.title[currentLanguage] || vacancy.title['ru'];
    const description = vacancy.description[currentLanguage] || vacancy.description['ru'];
    const department = vacancy.department[currentLanguage] || vacancy.department['ru'];
    const requirementsHtml = (vacancy.requirements[currentLanguage] || vacancy.requirements['ru'] || [])
        .map(req => `<li>${req}</li>`)
        .join('');

    detailsContainer.innerHTML = `
        <div class="vacancy-item-details">
            <h2>${title}</h2>
            <p><strong>${currentLanguage === 'ru' ? 'Отдел/Кафедра:' : 'Бөлім/Кафедра:'}</strong> ${department}</p>
            <h3>${currentLanguage === 'ru' ? 'Описание:' : 'Сипаттамасы:'}</h3>
            <p>${description}</p>
            <h3>${currentLanguage === 'ru' ? 'Требования:' : 'Талаптар:'}</h3>
            <ul>
                ${requirementsHtml}
            </ul>
            <h3>${currentLanguage === 'ru' ? 'Контакты:' : 'Байланыстар:'}</h3>
            <p><strong>${currentLanguage === 'ru' ? 'Email:' : 'Email:'}</strong> ${vacancy.contactEmail}</p>
            <p><strong>${currentLanguage === 'ru' ? 'Телефон:' : 'Телефон:'}</strong> ${vacancy.contactPhone}</p>
            <button class="button blue apply-button-details" data-vacancy-id="${vacancy.id}">
                <span lang="ru">Откликнуться</span>
                <span lang="kz" class="hidden">Жауап беру</span>
            </button>
             <button class="button gray save-vacancy-button" data-vacancy-id="${vacancy.id}">
                <span lang="ru">Сохранить</span>
                <span lang="kz" class="hidden">Сақтау</span>
             </button>
        </div>
    `;

     setLanguage(currentLanguage);

    const applyButtonDetails = detailsContainer.querySelector('.apply-button-details');
     if(applyButtonDetails) {
         applyButtonDetails.addEventListener('click', (event) => {
            const vacancyId = event.target.closest('.apply-button-details').getAttribute('data-vacancy-id');
            handleApply(vacancyId);
        });
     }

     const saveVacancyButton = detailsContainer.querySelector('.save-vacancy-button');
     if(saveVacancyButton) {
         saveVacancyButton.addEventListener('click', (event) => {
             const vacancyId = event.target.closest('.save-vacancy-button').getAttribute('data-vacancy-id');
              handleSaveVacancy(vacancyId);
         });
     }

}

function handleSaveVacancy(vacancyId) {
     const isLoggedIn = getFromLocalStorage('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('Пожалуйста, войдите, чтобы сохранить вакансию.');
        window.location.href = 'login.html';
        return;
    }

    console.log(`Сохранение вакансии ID: ${vacancyId} (имитация)`);
    alert(`Вакансия ID ${vacancyId} сохранена (имитация).`);

     let userProfile = JSON.parse(getFromLocalStorage('userProfile')) || mockUserProfile;
     if (!userProfile.savedVacancies.includes(parseInt(vacancyId, 10))) {
         userProfile.savedVacancies.push(parseInt(vacancyId, 10));
         saveToLocalStorage('userProfile', JSON.stringify(userProfile));
         console.log('Текущие сохраненные вакансии (имитация):', userProfile.savedVacancies);
     } else {
         console.log(`Вакансия ID ${vacancyId} уже была сохранена.`);
     }
}


function renderVacancyNotFoundError(currentLanguage) {
     const detailsContainer = document.querySelector('.vacancy-details');
      if(detailsContainer) {
        detailsContainer.innerHTML = `
            <h2 lang="ru">Ошибка</h2>
            <h2 lang="kz" class="hidden">Қате</h2>
            <p lang="ru">Вакансия не найдена. Возможно, она была удалена или ссылка неверна.</p>
            <p lang="kz" class="hidden">Вакансия табылмады. Мүмкін, ол жойылған немесе сілтеме қате.</p>
        `;
        setLanguage(currentLanguage);
     }
}

function renderVacancyLoadError(currentLanguage) {
     const detailsContainer = document.querySelector('.vacancy-details');
      if(detailsContainer) {
        detailsContainer.innerHTML = `
            <h2 lang="ru">Ошибка загрузки</h2>
            <h2 lang="kz" class="hidden">Жүктеу қатесі</h2>
            <p lang="ru">Произошла ошибка при попытке загрузить детали вакансии. Пожалуйста, попробуйте позже.</p>
            <p lang="kz" class="hidden">Вакансия деректерін жүктеу кезінде қате пайда болды. Кейінірек қайталап көріңіз.</p>
        `;
        setLanguage(currentLanguage);
     }
}

function renderVacancyIdMissingError(currentLanguage) {
     const detailsContainer = document.querySelector('.vacancy-details');
      if(detailsContainer) {
        detailsContainer.innerHTML = `
            <h2 lang="ru">Ошибка запроса</h2>
            <h2 lang="kz" class="hidden">Сұрау қатесі</h2>
            <p lang="ru">Не указан ID вакансии для просмотра.</p>
            <p lang="kz" class="hidden">Қарау үшін вакансияның ID көрсетілмеген.</p>
        `;
        setLanguage(currentLanguage);
     }
}


function updateAuthButtonsVisibility() {
     const isLoggedIn = getFromLocalStorage('isLoggedIn') === 'true';

     const authButtonsContainer = document.querySelector('.header-actions .auth-buttons');
     if (!authButtonsContainer) return;

     const loginButton = authButtonsContainer.querySelector('a[href="login.html"]');
     const registerButton = authButtonsContainer.querySelector('a[href="register.html"]');
     const profileButton = authButtonsContainer.querySelector('a[href="profile.html"]');
     const logoutButtons = document.querySelectorAll('#logout-button, #logout-button-profile, #logout-button-edit-profile, #logout-button-vacancy');

     if (isLoggedIn) {
         if (loginButton) loginButton.classList.add(HIDDEN_CLASS_NAME);
         if (registerButton) registerButton.classList.add(HIDDEN_CLASS_NAME);
         if (profileButton) profileButton.classList.remove(HIDDEN_CLASS_NAME);
         logoutButtons.forEach(button => button.classList.remove(HIDDEN_CLASS_NAME));
     } else {
          if (loginButton) loginButton.classList.remove(HIDDEN_CLASS_NAME);
         if (registerButton) registerButton.classList.remove(HIDDEN_CLASS_NAME);
          if (profileButton) profileButton.classList.add(HIDDEN_CLASS_NAME);
          logoutButtons.forEach(button => button.classList.add(HIDDEN_CLASS_NAME));
     }
}


// --- Инициализация скриптов при загрузке страницы ---

function documentReadyHandler() {
    initializeLanguageSwitcher();
    initializeThemeSwitcher();
    updateAuthButtonsVisibility();

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
        console.log('Обработчик формы входа инициализирован.');
    }

    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterFormSubmit);
        console.log('Обработчик формы регистрации инициализирован.');
    }

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
        console.log('Обработчик формы обратной связи инициализирован.');
    }

     const profileEditForm = document.querySelector('.profile-edit-form');
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', handleProfileEditFormSubmit);
        console.log('Обработчик формы редактирования профиля инициализирован.');
        fetchUserProfile().then(userProfile => {
             if (userProfile) {
                 const nameInput = profileEditForm.querySelector('#name');
                 const emailInput = profileEditForm.querySelector('#email');
                 const universityInput = profileEditForm.querySelector('#university');
                 const facultyInput = profileEditForm.querySelector('#faculty');
                 const courseInput = profileEditForm.querySelector('#course');

                 if (nameInput) nameInput.value = userProfile.name || '';
                 if (emailInput) emailInput.value = userProfile.email || '';
                 if (universityInput) universityInput.value = userProfile.university || '';
                 if (facultyInput) facultyInput.value = userProfile.faculty || '';
                 if (courseInput) courseInput.value = userProfile.course !== undefined && userProfile.course !== null ? userProfile.course : '';

             } else {
                  console.warn('Данные пользователя для редактирования не загружены. Возможно, требуется авторизация.');
             }
         });
    }

    const logoutButtons = document.querySelectorAll('#logout-button, #logout-button-profile, #logout-button-edit-profile, #logout-button-vacancy');
     if (logoutButtons.length > 0) {
        logoutButtons.forEach(button => {
            button.addEventListener('click', handleLogout);
        });
        console.log('Обработчики кнопок выхода инициализированы.');
    }

    if (document.body.classList.contains('index-page')) {
         console.log('Инициализация главной страницы...');
         fetchTopSpecialists().then(specialists => {
              const currentLanguage = document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE_NAME) || 'ru';
              renderTopSpecialists(specialists, currentLanguage);
         }).catch(error => {
             console.error('Ошибка загрузки топ специалистов:', error);
             const specialistsListContainer = document.querySelector('.top-specialists .specialists-list');
              if (specialistsListContainer) {
                 specialistsListContainer.innerHTML = `<p lang="ru">Не удалось загрузить список специалистов.</p><p lang="kz" class="hidden">Мамандар тізімін жүктеу мүмкін болмады.</p>`;
                 setLanguage(document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE_NAME) || 'ru');
             }
         });
    } else if (document.body.classList.contains('vacancies-page')) {
         console.log('Инициализация страницы вакансий...');
         fetchVacancies().then(vacancies => {
              const currentLanguage = document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE_NAME) || 'ru';
              renderVacancies(vacancies, currentLanguage);
         }).catch(error => {
             console.error('Ошибка загрузки вакансий:', error);
             const vacanciesListContainer = document.querySelector('.vacancies-list');
              if (vacanciesListContainer) {
                 vacanciesListContainer.innerHTML = `<p lang="ru">Не удалось загрузить вакансии. Пожалуйста, попробуйте позже.</p><p lang="kz" class="hidden">Бос жұмыс орындарын жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.</p>`;
                 setLanguage(document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE_NAME) || 'ru');
             }
         });
    } else if (document.body.classList.contains('profile-page')) {
         console.log('Инициализация страницы личного кабинета...');
         fetchUserProfile().then(userProfile => {
             const currentLanguage = document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE_NAME) || 'ru';
             renderUserProfile(userProfile, currentLanguage);
         }).catch(error => {
             console.error('Ошибка загрузки профиля пользователя:', error);
              const mainContent = document.querySelector('main');
              if (mainContent) {
                mainContent.innerHTML = `
                     <h2 lang="ru">Ошибка</h2>
                     <h2 lang="kz" class="hidden">Қате</h2>
                     <p lang="ru">Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.</p>
                     <p lang="kz" class="hidden">Профиль деректерін жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.</p>
                 `;
                setLanguage(document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE_NAME) || 'ru');
            }
         });
    } else if (document.body.classList.contains('vacancy-page')) {
         console.log('Инициализация страницы конкретной вакансии...');
         const vacancyId = getVacancyIdFromUrl();
         const currentLanguage = document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE_NAME) || 'ru';
         if (vacancyId) {
             fetchVacancyById(vacancyId).then(vacancy => {
                 if (vacancy) {
                      renderVacancyDetails(vacancy, currentLanguage);
                 } else {
                      console.error(`Вакансия с ID ${vacancyId} не найдена.`);
                      renderVacancyNotFoundError(currentLanguage);
                 }
             }).catch(error => {
                 console.error('Ошибка загрузки деталей вакансии:', error);
                  renderVacancyLoadError(currentLanguage);
             });
         } else {
             console.error('ID вакансии не указан в URL.');
             renderVacancyIdMissingError(currentLanguage);
         }
     } else {
         console.log('Неизвестная страница. Инициализация основных элементов.');
     }


    console.log('DOM полностью загружен и скрипты инициализированы.');
}


document.addEventListener('DOMContentLoaded', documentReadyHandler);