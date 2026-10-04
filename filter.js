// Interactive project filtering system
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('projectSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const statusEl = document.getElementById('filterStatus');
    const noProjectsMessage = document.getElementById('noProjectsMessage');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const isFrench = document.documentElement.lang === 'fr';

    if (!projectCards.length) return;

    let activeFilter = 'all';
    let searchQuery = '';

    // Calculate dynamic counts for each filter button based on cards
    function updateCounts() {
        filterButtons.forEach(btn => {
            const filter = btn.dataset.filter;
            const countSpan = btn.querySelector('.filter-count');
            if (!countSpan) return;

            if (filter === 'all') {
                countSpan.textContent = projectCards.length;
            } else {
                let count = 0;
                projectCards.forEach(card => {
                    if (cardMatches(card, filter, '')) {
                        count++;
                    }
                });
                countSpan.textContent = count;
            }
        });
    }

    function cardMatches(card, filter, search) {
        const textContent = (
            (card.getAttribute('data-tech') || '') + ' ' +
            card.textContent
        ).toLowerCase();

        // Check filter tag
        if (filter && filter !== 'all') {
            const filterNorm = filter.toLowerCase();
            // Handle aliases e.g. sqlite matching sql
            if (filterNorm === 'sqlite') {
                if (!textContent.includes('sqlite') && !textContent.includes('sqlalchemy') && !textContent.includes('sql')) {
                    return false;
                }
            } else if (filterNorm === 'gaming') {
                if (!textContent.includes('gaming') && !textContent.includes('game') && !textContent.includes('jeu') && !textContent.includes('3d')) {
                    return false;
                }
            } else if (filterNorm === 'fullstack') {
                if (!textContent.includes('full-stack') && !textContent.includes('fullstack') && !textContent.includes('web app')) {
                    return false;
                }
            } else if (filterNorm === 'devops') {
                if (!textContent.includes('devops') && !textContent.includes('docker') && !textContent.includes('kubernetes') && !textContent.includes('terraform') && !textContent.includes('gcp') && !textContent.includes('ci/cd')) {
                    return false;
                }
            } else if (filterNorm === 'data') {
                if (!textContent.includes('data') && !textContent.includes('etl') && !textContent.includes('données')) {
                    return false;
                }
            } else {
                if (!textContent.includes(filterNorm)) {
                    return false;
                }
            }
        }

        // Check search query
        if (search) {
            const searchNorm = search.trim().toLowerCase();
            if (!textContent.includes(searchNorm)) {
                return false;
            }
        }

        return true;
    }

    function applyFilters() {
        let visibleCount = 0;

        projectCards.forEach(card => {
            const matches = cardMatches(card, activeFilter, searchQuery);
            if (matches) {
                card.style.display = '';
                card.classList.remove('card-hidden');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.add('card-hidden');
            }
        });

        // Update clear search button visibility
        if (clearSearchBtn) {
            clearSearchBtn.style.visibility = searchQuery ? 'visible' : 'hidden';
        }

        // Update status text
        if (statusEl) {
            if (isFrench) {
                if (activeFilter === 'all' && !searchQuery) {
                    statusEl.innerHTML = `Affichage de <strong>${visibleCount}</strong> projet${visibleCount > 1 ? 's' : ''}`;
                } else {
                    const criteria = [];
                    if (activeFilter !== 'all') {
                        const activeBtn = document.querySelector(`.filter-btn[data-filter="${activeFilter}"]`);
                        const label = activeBtn ? activeBtn.textContent.replace(/[0-9]/g, '').trim() : activeFilter;
                        criteria.push(`technologie « <strong>${label}</strong> »`);
                    }
                    if (searchQuery) criteria.push(`recherche « <strong>${escapeHtml(searchQuery)}</strong> »`);
                    statusEl.innerHTML = `Affichage de <strong>${visibleCount}</strong> projet${visibleCount > 1 ? 's' : ''} (${criteria.join(', ')})`;
                }
            } else {
                if (activeFilter === 'all' && !searchQuery) {
                    statusEl.innerHTML = `Showing <strong>${visibleCount}</strong> project${visibleCount > 1 ? 's' : ''}`;
                } else {
                    const criteria = [];
                    if (activeFilter !== 'all') {
                        const activeBtn = document.querySelector(`.filter-btn[data-filter="${activeFilter}"]`);
                        const label = activeBtn ? activeBtn.textContent.replace(/[0-9]/g, '').trim() : activeFilter;
                        criteria.push(`tag "<strong>${label}</strong>"`);
                    }
                    if (searchQuery) criteria.push(`search "<strong>${escapeHtml(searchQuery)}</strong>"`);
                    statusEl.innerHTML = `Showing <strong>${visibleCount}</strong> project${visibleCount > 1 ? 's' : ''} (${criteria.join(', ')})`;
                }
            }
        }

        // Toggle empty message
        if (noProjectsMessage) {
            noProjectsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    // Filter button clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFilters();
        });
    }

    // Clear search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                searchInput.focus();
                applyFilters();
            }
        });
    }

    // Reset button
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            activeFilter = 'all';
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            filterButtons.forEach(b => {
                b.classList.toggle('active', b.dataset.filter === 'all');
            });
            applyFilters();
        });
    }

    // Clicking tags on cards to filter
    document.querySelectorAll('.tech-tag, .type-tag').forEach(tag => {
        tag.style.cursor = 'pointer';
        tag.title = isFrench ? `Filtrer par "${tag.textContent.trim()}"` : `Filter by "${tag.textContent.trim()}"`;
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tagText = tag.textContent.trim();
            const norm = tagText.toLowerCase();

            // Check if there is an exact button for this tag
            let matchedBtn = null;
            filterButtons.forEach(btn => {
                const btnFilter = btn.dataset.filter.toLowerCase();
                if (btnFilter !== 'all' && (norm.includes(btnFilter) || btnFilter.includes(norm))) {
                    if (!matchedBtn) matchedBtn = btn;
                }
            });

            if (matchedBtn) {
                matchedBtn.click();
            } else if (searchInput) {
                searchInput.value = tagText;
                searchQuery = tagText;
                filterButtons.forEach(b => b.classList.remove('active'));
                const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
                activeFilter = 'all';
                applyFilters();
            }

            const container = document.querySelector('.filter-container');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });

    // Initialize counts and initial filter
    updateCounts();
    applyFilters();
});
