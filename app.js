document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const viewContainer = document.getElementById('view-container');
    const bottomNav = document.getElementById('bottom-nav');
    const backBtn = document.getElementById('back-btn');
    const langBtns = document.querySelectorAll('.lang-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // --- State ---
    let currentLang = 'malayalam'; // 'malayalam' | 'manglish'
    let currentView = 'list'; // 'list' | 'detail'
    let currentPrayerId = null;

    // --- Data Dictionary (Mapping IDs to global variables from our JS data files) ---
    // In a production app with a server, we'd use fetch(), but globally assigned 
    // variables avoid local CORS issues when opened directly from file://
    const PRAYER_DATA_MAP = {
        'pesaha': typeof PESAHA_PRAYER !== 'undefined' ? PESAHA_PRAYER : null,
    };

    // --- Initialization ---
    initTheme();
    renderList();

    // --- Event Listeners ---
    
    // Language Toggle
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            langBtns.forEach(b => b.classList.remove('active'));
            const clickedBtn = e.target;
            clickedBtn.classList.add('active');
            
            // Set language
            currentLang = clickedBtn.dataset.lang;
            
            // Re-render current view with new language
            if (currentView === 'list') {
                renderList();
            } else if (currentView === 'detail' && currentPrayerId) {
                renderDetail(currentPrayerId);
            }
        });
    });

    // Back Button
    backBtn.addEventListener('click', () => {
        currentView = 'list';
        currentPrayerId = null;
        renderList();
        bottomNav.classList.add('hidden');
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- Rendering Functions ---

    function renderList() {
        if (typeof PRAYERS_LIST === 'undefined') {
            viewContainer.innerHTML = '<div class="loading">Error loading prayer list data...</div>';
            return;
        }

        let html = '<ul class="prayer-list">';
        
        PRAYERS_LIST.forEach(prayer => {
            html += `
                <li class="prayer-card" data-id="${prayer.id}">
                    <h3>${prayer.title}</h3>
                    <p>Tap to read</p>
                </li>
            `;
        });
        
        html += '</ul>';
        viewContainer.innerHTML = html;

        // Attach listeners to cards
        const cards = viewContainer.querySelectorAll('.prayer-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                currentView = 'detail';
                currentPrayerId = id;
                renderDetail(id);
                bottomNav.classList.remove('hidden');
                window.scrollTo(0, 0); // Scroll to top
            });
        });
    }

    function renderDetail(id) {
        const data = PRAYER_DATA_MAP[id];
        
        if (!data) {
            viewContainer.innerHTML = '<div class="loading">Prayer content not found or still loading...</div>';
            return;
        }

        const title = currentLang === 'malayalam' ? data.title_malayalam : data.title_manglish;
        
        let html = `
            <div class="prayer-detail">
                <h2 class="prayer-title">${title}</h2>
        `;

        data.sections.forEach(section => {
            const sectionTitle = currentLang === 'malayalam' ? section.title_malayalam : section.title_manglish;
            const content = currentLang === 'malayalam' ? section.malayalam : section.manglish;
            
            html += `
                <div class="prayer-section">
                    <h3 class="prayer-section-title">${sectionTitle}</h3>
                    <div class="prayer-stanza">${content}</div>
                </div>
            `;
        });

        html += '</div>';
        viewContainer.innerHTML = html;
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        // Check system preference if no saved theme
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.body.setAttribute('data-theme', 'dark');
        }
    }
});
