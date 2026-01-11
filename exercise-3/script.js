let albums = [];
let filteredAlbums = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('library.json')
        .then(response => response.json())
        .then(data => {
            albums = data;
            filteredAlbums = [...albums];
            displayAlbums(filteredAlbums);
        });

    // Search
    document.getElementById('search-input').addEventListener('input', filterAlbums);

    // Sort
    document.getElementById('sort-select').addEventListener('change', sortAlbums);

    // Back to top
    document.getElementById('back-to-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        const backToTopBtn = document.getElementById('back-to-top');
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
});

function displayAlbums(albumsToDisplay) {
    const grid = document.getElementById('album-grid');
    grid.innerHTML = '';

    albumsToDisplay.forEach(album => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <img src="https://via.placeholder.com/300x300?text=${encodeURIComponent(album.album)}" class="card-img-top" alt="${album.album}">
                <div class="card-img-overlay">
                    <h5 class="card-title text-white">${album.album}</h5>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${album.artist}</h5>
                    <p class="card-text">${album.album}</p>
                    <button class="btn btn-primary mt-auto view-tracklist" data-artist="${album.artist}" data-album="${album.album}">View Tracklist</button>
                </div>
                <div class="card-footer">
                    <small class="text-muted">${album.tracks.length} tracks</small>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.view-tracklist').forEach(btn => {
        btn.addEventListener('click', openModal);
    });
}

function openModal(event) {
    const artist = event.target.dataset.artist;
    const albumTitle = event.target.dataset.album;
    const album = albums.find(a => a.artist === artist && a.album === albumTitle);

    document.getElementById('modal-title').textContent = `${artist} - ${albumTitle}`;

    // Calculate stats
    const totalTracks = album.tracks.length;
    const totalDuration = album.tracks.reduce((sum, track) => sum + parseLength(track.length), 0);
    const avgLength = totalDuration / totalTracks;
    const lengths = album.tracks.map(track => parseLength(track.length));
    const longest = Math.max(...lengths);
    const shortest = Math.min(...lengths);

    let modalBody = `
        <div class="mb-3">
            <h6>Album Statistics:</h6>
            <p>Total tracks: ${totalTracks}</p>
            <p>Total duration: ${formatDuration(totalDuration)}</p>
            <p>Average track length: ${formatDuration(avgLength)}</p>
            <p>Longest track: ${formatDuration(longest)}</p>
            <p>Shortest track: ${formatDuration(shortest)}</p>
        </div>
        <h6>Tracklist:</h6>
        <ol>
    `;

    album.tracks.forEach((track, index) => {
        modalBody += `<li><a href="${track.url}" target="_blank" class="track-link">${track.title}</a> - ${track.length}</li>`;
    });

    modalBody += '</ol>';
    document.getElementById('modal-body').innerHTML = modalBody;

    // Set Play on Spotify button
    document.getElementById('play-spotify-btn').onclick = () => {
        window.open(album.tracks[0].url, '_blank');
    };

    const modal = new bootstrap.Modal(document.getElementById('tracklist-modal'));
    modal.show();
}

function parseLength(length) {
    const [min, sec] = length.split(':').map(Number);
    return min * 60 + sec;
}

function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function filterAlbums() {
    const query = document.getElementById('search-input').value.toLowerCase();
    filteredAlbums = albums.filter(album =>
        album.artist.toLowerCase().includes(query) ||
        album.album.toLowerCase().includes(query)
    );
    sortAlbums();
}

function sortAlbums() {
    const sortBy = document.getElementById('sort-select').value;
    filteredAlbums.sort((a, b) => {
        switch (sortBy) {
            case 'artist-asc':
                return a.artist.localeCompare(b.artist);
            case 'artist-desc':
                return b.artist.localeCompare(a.artist);
            case 'album-asc':
                return a.album.localeCompare(b.album);
            case 'album-desc':
                return b.album.localeCompare(a.album);
            case 'tracks-asc':
                return a.tracks.length - b.tracks.length;
            case 'tracks-desc':
                return b.tracks.length - a.tracks.length;
            default:
                return 0;
        }
    });
    displayAlbums(filteredAlbums);
}