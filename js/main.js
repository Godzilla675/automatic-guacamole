// Main Entry Point

window.game = null;
window.onload = () => {
    // UI Logic
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
    }, 1000);

    document.getElementById('show-controls').addEventListener('click', () => {
        document.getElementById('controls-info').classList.toggle('hidden');
    });

    document.getElementById('start-game').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        if (!window.game) {
            window.game = new Game();
            window.game.init();
        }
    });

    document.getElementById('resume-game').addEventListener('click', () => {
        if (window.game) window.game.resumeGame();
    });

    document.getElementById('return-menu').addEventListener('click', () => {
         // Reload page to reset for now
         location.reload();
    });

    document.getElementById('close-inventory').addEventListener('click', () => {
         if (window.game) window.game.toggleInventory();
    });
};
