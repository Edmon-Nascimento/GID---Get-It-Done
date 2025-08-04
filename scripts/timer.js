const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

let time = MODES.pomodoro;
let timer;
let isRunning = false;

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');

function updateDisplay() {
  minutesEl.textContent = String(Math.floor(time / 60)).padStart(2, '0');
  secondsEl.textContent = String(time % 60).padStart(2, '0');
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    time--;
    updateDisplay();
    if (time <= 0) {
      clearInterval(timer);
      isRunning = false;
      handleTimerEnd();
    }
  }, 1000);
  startBtn.classList.add('disable');
  pauseBtn.classList.remove('disable');
  resetBtn.classList.remove('disable');
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  startBtn.classList.remove('disable');
  pauseBtn.classList.add('disable');
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  const activeMode = document.querySelector('.mode-buttons button.active').id;
  time = MODES[activeMode];
  updateDisplay();
  startBtn.classList.remove('disable');
  pauseBtn.classList.add('disable');
  resetBtn.classList.add('disable');
}

function setMode(mode) {
  document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(mode).classList.add('active');
  time = MODES[mode];
  resetTimer();
}

function handleTimerEnd() {
  alert('Tempo esgotado!');
  navigator.vibrate?.(300);
  const timerEl = document.querySelector('.timer');
  timerEl.classList.add('timer-flash');
  setTimeout(() => timerEl.classList.remove('timer-flash'), 1000);
}

document.getElementById('pomodoro').onclick = () => setMode('pomodoro');
document.getElementById('short').onclick = () => setMode('short');
document.getElementById('long').onclick = () => setMode('long');
startBtn.onclick = startTimer;
pauseBtn.onclick = pauseTimer;
resetBtn.onclick = resetTimer;

updateDisplay();
