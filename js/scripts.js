
const sidebar   = document.getElementById('sidebar');
const menuBtn   = document.getElementById('menuBtn');
const overlay   = document.getElementById('overlay');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
}
if (overlay) {
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}


document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.tabs').dataset.group || btn.dataset.group;
    const target = btn.dataset.tab;

    // Toggle active on buttons in same tabs container
    btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Toggle panels with matching group
    document.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === target);
    });
  });
});

/* ---- READING CARD TOGGLE ---- */
document.querySelectorAll('.rc-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.reading-card');
    const body = card.querySelector('.rc-body');
    const isOpen = body.style.display === 'block';
    body.style.display = isOpen ? 'none' : 'block';
    btn.textContent = isOpen ? 'Leer más' : 'Mostrar menos';
  });
});

/* ---- AUDIO PLAYERS ---- */
document.querySelectorAll('.audio-player').forEach(player => {
  const audio    = player.querySelector('audio');
  const playBtn  = player.querySelector('.ap-play-btn');
  const progress = player.querySelector('.ap-progress');
  const volSlider= player.querySelector('.ap-volume');
  const curTime  = player.querySelector('.ap-current');
  const durTime  = player.querySelector('.ap-duration');

  if (!audio) return;

  const fmt = t => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '⏸';
      } else {
        audio.pause();
        playBtn.innerHTML = '▶';
      }
    });
  }

  if (audio && progress) {
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      progress.value = (audio.currentTime / audio.duration) * 100;
      if (curTime) curTime.textContent = fmt(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      if (durTime) durTime.textContent = fmt(audio.duration);
    });

    progress.addEventListener('input', () => {
      audio.currentTime = (progress.value / 100) * audio.duration;
    });

    audio.addEventListener('ended', () => {
      if (playBtn) playBtn.innerHTML = '▶';
      progress.value = 0;
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      audio.volume = volSlider.value / 100;
    });
  }
});

/* ---- QUIZ ENGINE ---- */
document.querySelectorAll('.quiz-card').forEach(card => {
  const type = card.dataset.quizType;

  if (type === 'multiple') {
    card.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (card.dataset.answered) return;
        card.dataset.answered = '1';

        const correct = btn.dataset.correct === 'true';
        const feedback = card.querySelector('.quiz-feedback');

        card.querySelectorAll('.option-btn').forEach(b => {
          if (b.dataset.correct === 'true') b.classList.add('correct');
        });

        if (!correct) btn.classList.add('wrong');

        if (feedback) {
          feedback.style.display = 'block';
          if (correct) {
            feedback.className = 'quiz-feedback correct';
            feedback.textContent = '✓ ¡Correcto!';
          } else {
            feedback.className = 'quiz-feedback wrong';
            feedback.textContent = '✗ Incorrecto. Revisa la respuesta correcta.';
          }
        }
        updateScore(card.closest('[data-quiz-set]'));
      });
    });
  }

  if (type === 'fill') {
    const input  = card.querySelector('.blank-input');
    const verify = card.querySelector('.btn-verify');

    if (verify && input) {
      verify.addEventListener('click', () => {
        if (card.dataset.answered) return;
        card.dataset.answered = '1';

        const correct = input.dataset.answer;
        const isOk = input.value.trim().toLowerCase() === correct.toLowerCase();
        const feedback = card.querySelector('.quiz-feedback');

        input.classList.add(isOk ? 'correct' : 'wrong');

        if (feedback) {
          feedback.style.display = 'block';
          if (isOk) {
            feedback.className = 'quiz-feedback correct';
            feedback.textContent = '✓ ¡Correcto!';
          } else {
            feedback.className = 'quiz-feedback wrong';
            feedback.textContent = `✗ La respuesta correcta es: "${correct}"`;
          }
        }
        updateScore(card.closest('[data-quiz-set]'));
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') verify.click();
      });
    }
  }
});

function updateScore(quizSet) {
  if (!quizSet) return;
  const total     = quizSet.querySelectorAll('.quiz-card').length;
  const answered  = quizSet.querySelectorAll('.quiz-card[data-answered]').length;
  const correct   = quizSet.querySelectorAll(
    '.quiz-card[data-answered] .option-btn.correct:not(.wrong), .quiz-card[data-answered] .blank-input.correct'
  ).length;
  const scoreEl   = quizSet.querySelector('.qs-score');
  const subEl     = quizSet.querySelector('.qs-sub');
  if (scoreEl) scoreEl.textContent = `${correct}/${total}`;
  if (subEl)   subEl.textContent   = `${answered} de ${total} respondidas`;
}

/* ---- VOCAB SEARCH ---- */
const vocabInput = document.getElementById('vocabSearch');
if (vocabInput) {
  vocabInput.addEventListener('input', () => {
    const q = vocabInput.value.toLowerCase().trim();
    document.querySelectorAll('.vocab-card').forEach(card => {
      const word = card.querySelector('.vocab-word')?.textContent.toLowerCase() || '';
      const def  = card.querySelector('.vocab-def')?.textContent.toLowerCase() || '';
      card.classList.toggle('vocab-hidden', q && !word.includes(q) && !def.includes(q));
    });
  });
}

/* ---- RESET QUIZ BUTTONS ---- */
document.querySelectorAll('.btn-reset-quiz').forEach(btn => {
  btn.addEventListener('click', () => {
    const quizSet = btn.closest('[data-quiz-set]');
    if (!quizSet) return;

    quizSet.querySelectorAll('.quiz-card').forEach(card => {
      delete card.dataset.answered;
      card.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected', 'correct', 'wrong');
      });
      card.querySelectorAll('.blank-input').forEach(i => {
        i.value = '';
        i.classList.remove('correct', 'wrong');
      });
      card.querySelectorAll('.quiz-feedback').forEach(f => {
        f.style.display = 'none';
      });
    });

    const scoreEl = quizSet.querySelector('.qs-score');
    const subEl   = quizSet.querySelector('.qs-sub');
    if (scoreEl) scoreEl.textContent = '0/0';
    if (subEl)   subEl.textContent   = '0 respondidas';
  });
});

/* ---- ACTIVE NAV LINK ---- */
const currentPath = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-item').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  link.classList.toggle('active', href === currentPath || (currentPath === '' && href === 'index.html'));
});