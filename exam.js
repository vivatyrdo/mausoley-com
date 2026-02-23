// --- 1. СЮДА ВСТАВЬ ВСЕ СВОИ 12 МАССИВОВ С ВОПРОСАМИ ---
// Просто скопируй const module1Questions = [...] и так до module12Questions из старого файла

// ВСТАВЛЯТЬ СЮДА:



// --------------------------------------------------------

// Склеиваем базы (Проверь, чтобы названия массивов совпадали с теми, что ты вставил выше)
const sstFullBase = [].concat(module1Questions, module2Questions, module3Questions, module4Questions, module5Questions, module6Questions);
const trpoFullBase = [].concat(module7Questions, module8Questions, module9Questions, module10Questions, module11Questions, module12Questions);

// --- ЭЛЕМЕНТЫ DOM ---
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const quizTitle = document.getElementById('quiz-title');
const questionContainer = document.getElementById('question-container');
const answerButtons = document.getElementById('answer-buttons');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const resultText = document.getElementById('result-text');
const correctCountEl = document.getElementById('correct-count');
const incorrectCountEl = document.getElementById('incorrect-count');
const accuracyPercentEl = document.getElementById('accuracy-percent');
const incorrectQuestionsListEl = document.getElementById('incorrect-questions-list');
const incorrectListEl = document.getElementById('incorrect-list');

// --- ПЕРЕМЕННЫЕ СОСТОЯНИЯ ---
let questionsToAsk = [];
let currentQuestionIndex = 0;
let correctlyAnsweredCount = 0;
const QUESTIONS_PER_EXAM = 40; // Сколько вопросов будет на экзамене
let incorrectlyAnsweredList = []; 

// --- ФУНКЦИИ ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startExam(subject) {
    let baseArray = [];
    if (subject === 'sst') {
        baseArray = [...sstFullBase];
        quizTitle.textContent = "Экзамен: Сети (ССТ)";
    } else if (subject === 'trpo') {
        baseArray = [...trpoFullBase];
        quizTitle.textContent = "Экзамен: ТРПО";
    }

    // Перемешиваем все 300 вопросов и берем только первые 40
    shuffleArray(baseArray);
    questionsToAsk = baseArray.slice(0, QUESTIONS_PER_EXAM);
    
    // Сброс счетчиков
    currentQuestionIndex = 0;
    correctlyAnsweredCount = 0;
    incorrectlyAnsweredList = [];

    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    updateProgressBar();
    showNextQuestion();
}

function updateProgressBar() {
    // В экзамене прогресс идет просто по номеру текущего вопроса
    const progressPercentage = (currentQuestionIndex / QUESTIONS_PER_EXAM) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressText.innerText = `Вопрос: ${currentQuestionIndex + 1} / ${QUESTIONS_PER_EXAM}`;
}

function showNextQuestion() {
    if (currentQuestionIndex >= QUESTIONS_PER_EXAM) {
        endExam();
        return;
    }

    updateProgressBar();
    questionContainer.classList.add('fade-out');
    answerButtons.classList.add('fade-out');
    
    setTimeout(() => {
        // Очищаем старые кнопки
        while (answerButtons.firstChild) {
            answerButtons.removeChild(answerButtons.firstChild);
        }
        
        const currentQuestion = questionsToAsk[currentQuestionIndex];
        questionContainer.innerText = currentQuestion.question;

        // Перемешиваем варианты ответов
        const shuffledAnswers = [...currentQuestion.answers];
        shuffleArray(shuffledAnswers);

        shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn', 'btn-animate-in', 'color-' + (index % 5));
            button.style.animationDelay = `${index * 0.1}s`;
            
            if (answer.correct) {
                button.dataset.correct = true;
            }
            button.addEventListener('click', selectAnswer);
            answerButtons.appendChild(button);
        });

        questionContainer.classList.remove('fade-out');
        answerButtons.classList.remove('fade-out');
    }, 400);
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === 'true';

    // Отключаем все кнопки
    Array.from(answerButtons.children).forEach(button => {
        button.disabled = true;
        button.classList.remove('btn-animate-in');
    });

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        correctlyAnsweredCount++;
    } else {
        selectedBtn.classList.add('incorrect');
        // Сохраняем вопрос в список ошибок (без шанса на повтор)
        incorrectlyAnsweredList.push(questionsToAsk[currentQuestionIndex]);
        
        // Показываем правильный ответ зеленым
        Array.from(answerButtons.children).forEach(button => {
            if (button.dataset.correct === 'true') {
                button.classList.add('correct');
            }
        });
    }
    
    currentQuestionIndex++;
    
    // Переход к следующему вопросу чуть быстрее, чем при обучении
    setTimeout(showNextQuestion, 1500);
}

function endExam() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const accuracy = Math.round((correctlyAnsweredCount / QUESTIONS_PER_EXAM) * 100);
    
    correctCountEl.textContent = correctlyAnsweredCount;
    incorrectCountEl.textContent = incorrectlyAnsweredList.length;
    
    // Выставляем оценку в зависимости от процента
    let grade = "";
    if (accuracy >= 90) {
        grade = "5 (Отлично) 🌟";
        accuracyPercentEl.style.color = "#28a745";
    } else if (accuracy >= 75) {
        grade = "4 (Хорошо) 👍";
        accuracyPercentEl.style.color = "#17a2b8";
    } else if (accuracy >= 60) {
        grade = "3 (Удовлетворительно) 😐";
        accuracyPercentEl.style.color = "#fd7e14";
    } else {
        grade = "2 (Неуд) 💀";
        accuracyPercentEl.style.color = "#dc3545";
    }
    
    accuracyPercentEl.textContent = grade;
    resultText.textContent = `Твой результат: ${correctlyAnsweredCount} из ${QUESTIONS_PER_EXAM} (${accuracy}%)`;
    
    // Вывод списка ошибок
    if (incorrectlyAnsweredList.length > 0) {
        incorrectQuestionsListEl.classList.remove('hidden');
        incorrectListEl.innerHTML = '';
        
        incorrectlyAnsweredList.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q.question;
            li.style.marginBottom = '5px';
            incorrectListEl.appendChild(li);
        });
    } else {
        incorrectQuestionsListEl.classList.add('hidden');
    }
}
