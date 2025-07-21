let vidoValue = 1;
let vidoTurn = null;
let currentPlayer = null;
let currentGameAction = null;

let totalBlackScore = 0;
let totalWhiteScore = 0;
let partyCount = 0;

let lastAction = null;
let lastScoreState = { black: 0, white: 0 };
let lastVidoState = { value: 1, turn: null };

let blackPlayerName = 'Siyah'; // Siyah oyuncunun varsayılan ismi
let whitePlayerName = 'Beyaz'; // Beyaz oyuncunun varsayılan ismi

// 10 puana ulaşan oyuncular için kontrol değişkenleri
let hasReached10PointsBlack = false;
let hasReached10PointsWhite = false;
let disableVidoForOpponent = false; // Vido tuşunu geçici olarak devre dışı bırakmak için

// Ses dosyaları
const diceSound = new Audio('https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/dice-sound.mp3');
const applauseSound = new Audio('https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/applause-sound.wav');
const disappointedSound = new Audio('https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/dissapointed-sound.wav');
const wowSound = new Audio('https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/wow-sound.wav');

let isSoundOn = true; // Ses varsayılan olarak açık

// Ses aç/kapa fonksiyonu
function toggleSound() {
    isSoundOn = !isSoundOn; // Durumu tersine çevir

    const soundIcon = document.getElementById('sound-icon');
    if (isSoundOn) {
        soundIcon.src = 'https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/sound-on.png'; // Ses açık ikonunu göster
        soundIcon.alt = 'Ses Açık';
    } else {
        soundIcon.src = 'https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/sound-off.png'; // Ses kapalı ikonunu göster
        soundIcon.alt = 'Ses Kapalı';
    }
}

// Ses çalınacak fonksiyonlarda kontrol ekleyin
function playSound(sound) {
    if (isSoundOn) {
        sound.play();
    }
}

// Modal açma ve kapama fonksiyonları (Vido işlemi için)
function openVidoModal() {
    const modal = document.getElementById('vido-modal');
    modal.classList.add('show');
}

function closeVidoModal() {
    const modal = document.getElementById('vido-modal');
    modal.classList.remove('show');
}

// Modal açma ve kapama fonksiyonları (Oyun, Mars, 3'lük işlemleri için)
function openGameModal() {
    const gameModal = document.getElementById('game-modal');
    gameModal.classList.add('show');
}

function closeGameModal() {
    const gameModal = document.getElementById('game-modal');
    gameModal.classList.remove('show');
}

function vido(player) {
    if (vidoTurn === null || vidoTurn === player) {
        playSound(diceSound); // Zar sesi çal
        currentPlayer = player === 'black' ? 'white' : 'black';  // Akışı bozmamak için bu kısım aynı kalacak
        const playerName = player === 'black' ? blackPlayerName : whitePlayerName;  // Mesaj için doğru oyuncu adı
        document.getElementById('vido-message').textContent = `${playerName} vido diyor. Ne diyorsun?`;  // Dinamik mesaj
        openVidoModal();
    }
}

// currentPlayer'e göre doğru oyuncu adını gösterme
function handleVidoAction(action) {
    closeVidoModal(); // Modalı kapat
    lastVidoState = { value: vidoValue, turn: vidoTurn }; // Son vido durumunu kaydet

    if (action === 'kabul') {
        playSound(applauseSound); // Alkış sesi çal
        vidoValue *= 2;
    } else if (action === 'kontur') {
        playSound(wowSound); // "Wow" sesi çal
        vidoValue *= 4;
    } else if (action === 'red') {
        playSound(disappointedSound); // Hayal kırıklığı sesi çal
        const playerName = currentPlayer === 'black' ? blackPlayerName : whitePlayerName;
        alert(`${playerName} vido reddetti. Skor güncellenecek.`);
        updateScore(currentPlayer === 'black' ? 'white' : 'black', vidoValue);
        resetVido();
        return;
    }

    updateVidoDisplay();
    vidoTurn = currentPlayer;
    toggleVidoButtons();
    lastAction = { type: 'vido' }; // Vido işlemini kaydet
}

function oyun(player) {
    currentPlayer = player;
    currentGameAction = 'oyun';
    const playerName = currentPlayer === 'black' ? blackPlayerName : whitePlayerName;
    document.getElementById('game-message').textContent = `${playerName} oyun diyor. Ne diyorsun?`; // Dinamik mesaj
    openGameModal();
}

function mars(player) {
    currentPlayer = player;
    currentGameAction = 'mars';
    const playerName = currentPlayer === 'black' ? blackPlayerName : whitePlayerName;
    document.getElementById('game-message').textContent = `${playerName} mars diyor. Ne diyorsun?`; // Dinamik mesaj
    openGameModal();
}

function threex(player) {
    currentPlayer = player;
    currentGameAction = 'threex';
    const playerName = currentPlayer === 'black' ? blackPlayerName : whitePlayerName;
    document.getElementById('game-message').textContent = `${playerName} 3'lük diyor. Ne diyorsun?`; // Dinamik mesaj
    openGameModal();
}

// Oyun Kabul ve Red modalını yönetme
function handleGameAction(action) {
    closeGameModal();
    if (action === 'kabul') {
        if (currentGameAction === 'oyun') {
            playSound(applauseSound); // Alkış sesi çal
            updateScore(currentPlayer, vidoValue);
        } else if (currentGameAction === 'mars') {
            playSound(applauseSound); // Alkış sesi çal
            updateScore(currentPlayer, vidoValue * 2);
        } else if (currentGameAction === 'threex') {
            playSound(applauseSound); // Alkış sesi çal
            updateScore(currentPlayer, vidoValue * 3);
        }
        resetVido();
    }
    lastAction = { type: 'score', player: currentPlayer, action: currentGameAction };
}

// Skorları güncelleme
function updateScore(player, points) {
    const scoreElem = document.getElementById(`${player}-score`);
    let currentScore = parseInt(scoreElem.textContent);
    let newScore = currentScore + points;

    let interval = setInterval(() => {
        if (currentScore < newScore) {
            currentScore++;
            scoreElem.textContent = currentScore;
        } else {
            clearInterval(interval);
        }
    }, 50);
}

function updateVidoDisplay() {
    const vidoDisplay = document.getElementById('vido-value');
    const vidoCube = document.getElementById('vido');
    
    vidoCube.classList.add('spin'); // Spin sınıfı eklenir, zar döner
    setTimeout(() => {
        vidoCube.classList.remove('spin'); // Animasyon tamamlanınca kaldırılır
    }, 500);

    vidoDisplay.textContent = vidoValue; // Zar değeri güncellenir
}

function toggleVidoButtons() {
    if (vidoTurn === null) {
        document.getElementById('black-vido').disabled = false;
        document.getElementById('white-vido').disabled = false;
    } else {
        document.getElementById('black-vido').disabled = vidoTurn !== 'black';
        document.getElementById('white-vido').disabled = vidoTurn !== 'white';
    }
}

function undoLastAction() {
    if (lastAction) {
        if (lastAction.type === 'score') {
            document.getElementById('black-score').textContent = lastScoreState.black;
            document.getElementById('white-score').textContent = lastScoreState.white;
        } else if (lastAction.type === 'vido') {
            vidoValue = lastVidoState.value;
            vidoTurn = lastVidoState.turn;
            updateVidoDisplay();
            toggleVidoButtons();
        }
        lastAction = null;
        alert("Son işlem geri alındı.");
    } else {
        alert("Geri alacak bir işlem yok.");
    }
}

function finishParty() {
    const blackScore = parseInt(document.getElementById('black-score').textContent);
    const whiteScore = parseInt(document.getElementById('white-score').textContent);

    totalBlackScore += blackScore;
    totalWhiteScore += whiteScore;

    partyCount++;
    const scoreTable = document.getElementById('party-scores');
    const newRow = document.createElement('tr');

    const partyNoCell = document.createElement('td');
    const blackScoreCell = document.createElement('td');
    const whiteScoreCell = document.createElement('td');

    partyNoCell.textContent = `Parti ${partyCount}`;
    blackScoreCell.textContent = blackScore;
    whiteScoreCell.textContent = whiteScore;

    newRow.appendChild(partyNoCell);
    newRow.appendChild(blackScoreCell);
    newRow.appendChild(whiteScoreCell);
    scoreTable.appendChild(newRow);

    document.getElementById('total-black-score').textContent = totalBlackScore;
    document.getElementById('total-white-score').textContent = totalWhiteScore;

    document.getElementById('black-score').textContent = 0;
    document.getElementById('white-score').textContent = 0;
    resetVido();
}

function resetAll() {
    document.getElementById('black-score').textContent = 0;
    document.getElementById('white-score').textContent = 0;

    totalBlackScore = 0;
    totalWhiteScore = 0;
    document.getElementById('total-black-score').textContent = 0;
    document.getElementById('total-white-score').textContent = 0;

    document.getElementById('party-scores').innerHTML = '';
    partyCount = 0;

    vidoValue = 1;
    updateVidoDisplay();
    vidoTurn = null;
    toggleVidoButtons();

    alert("Tüm veriler sıfırlandı.");
}

function resetVido() {
    vidoValue = 1;
    updateVidoDisplay();
    vidoTurn = null;
    toggleVidoButtons();
}

function updatePlayerNames() {
    // Text kutularındaki oyuncu adlarını alıyoruz
    blackPlayerName = document.getElementById('black-name').value || 'Siyah';
    whitePlayerName = document.getElementById('white-name').value || 'Beyaz';

    // Tüm Siyah ve Beyaz oyuncu adlarını güncelle
    document.querySelector('#black-player h2').textContent = blackPlayerName;
    document.querySelector('#white-player h2').textContent = whitePlayerName;

    // Parti tablolarını güncelleme
    const partyRows = document.querySelectorAll('#party-scores tr');
    partyRows.forEach((row) => {
        if (row.children[1]) {
            row.children[1].textContent = blackPlayerName; // Siyah oyuncu skoru
        }
        if (row.children[2]) {
            row.children[2].textContent = whitePlayerName; // Beyaz oyuncu skoru
        }
    });

    // Toplam skor başlıklarını da güncelle
    document.querySelectorAll('td').forEach((td) => {
        if (td.textContent.includes('Siyah Toplam')) {
            td.textContent = td.textContent.replace('Siyah Toplam', `${blackPlayerName} Toplam`);
        }
        if (td.textContent.includes('Beyaz Toplam')) {
            td.textContent = td.textContent.replace('Beyaz Toplam', `${whitePlayerName} Toplam`);
        }
    });
}

toggleVidoButtons();

document.addEventListener('dblclick', function(e) {
    e.preventDefault(); // Çift tıklamayla zoom yapmayı engelle
});

