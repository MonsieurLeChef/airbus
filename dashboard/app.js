document.addEventListener('DOMContentLoaded', () => {
    // Home page navigation
    document.querySelectorAll('.dashboard-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target) window.location.href = target;
        });
    });

    // Back button navigation
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }
});