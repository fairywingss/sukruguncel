let currentSlide = 0;
const galleryWall = document.querySelector('.gallery-wall');
const backgroundWall = document.querySelector('.background-wall');
const spotlight = document.querySelector('.spotlight');
const artistProfile = document.querySelector('.artist-profile');
const artistCard = document.querySelector('.artist-card');
const blurOverlay = document.querySelector('.blur-overlay');
let artworksData = [];
const backgroundWidth = 1920;
let autoScrollInterval;
let autoScrollDirection = 1;
let currentLang = 'tr';
let hasAppeared = [];
let isProfileVisible = true;
let isAutoScrollPaused = false;

async function loadArtworks() {
    try {
        const response = await fetch('/artworks.json');
        artworksData = await response.json();
        hasAppeared = Array(artworksData.length).fill(false);
        createArtworks();
        setupArtworkEvents();
        goToSlide(0);
        filterArtworks('all');
        startAutoScroll();
        changeLanguage('tr');
    } catch (error) {
        console.error('Artworks yüklenirken hata oluştu:', error);
    }
}

function createArtworks() {
    galleryWall.innerHTML = '';
    artworksData.forEach(artwork => {
        const artworkDiv = document.createElement('div');
        artworkDiv.classList.add('artwork');
        artworkDiv.setAttribute('data-category', artwork.category);

        const img = document.createElement('img');
        img.src = artwork.main_image;
        img.alt = artwork.title;
        img.classList.add('artwork-image');
        img.setAttribute('data-artwork-id', artwork.id);

        const labelDiv = document.createElement('div');
        labelDiv.classList.add('label');

        const title = document.createElement('h2');
        title.textContent = artwork.title;

        const description = document.createElement('p');
        description.setAttribute('data-lang-tr', artwork.description_tr);
        description.setAttribute('data-lang-en', artwork.description_en);
        description.textContent = artwork.description_tr;

        const details = document.createElement('p');
        details.classList.add('artwork-details');
        details.setAttribute('data-lang-tr', artwork.details_tr);
        details.setAttribute('data-lang-en', artwork.details_en);
        details.textContent = artwork.details_tr;

        labelDiv.appendChild(title);
        labelDiv.appendChild(description);
        labelDiv.appendChild(details);
        artworkDiv.appendChild(img);
        artworkDiv.appendChild(labelDiv);
        galleryWall.appendChild(artworkDiv);
    });
}

function goToSlide(index, fromArtworksButton = false) {
    const visibleArtworks = Array.from(document.querySelectorAll('.artwork')).filter(artwork => artwork.style.display !== 'none');
    if (index < 0 || index >= visibleArtworks.length) return;

    currentSlide = index;

    const slidePercentage = window.innerWidth <= 768 ? 100 : 50;
    galleryWall.style.transform = `translateX(-${currentSlide * slidePercentage}%)`;

    const backgroundOffset = -(currentSlide * window.innerWidth * 0.75);
    backgroundWall.style.transform = `translateX(${backgroundOffset}px)`;

    const profileOffset = -(currentSlide * artistProfile.offsetWidth);
    artistProfile.style.transform = `translateX(${profileOffset}px)`;

    if (fromArtworksButton || currentSlide > 0) {
        isProfileVisible = false;
        artistCard.classList.add('visible');
        if (window.innerWidth <= 768) {
            artistProfile.classList.add('hidden');
        }
    } else {
        isProfileVisible = true;
        artistCard.classList.remove('visible');
        artistProfile.classList.remove('hidden');
    }

    spotlight.classList.add('visible');
    setTimeout(() => {
        spotlight.classList.remove('visible');
    }, 1000);

    if (fromArtworksButton) {
        artistProfile.style.transform = `translateX(-${artistProfile.offsetWidth}px)`;
    }

    visibleArtworks.forEach((artwork, i) => {
        const description = artwork.querySelector('.label p:not(.artwork-details)');
        const details = artwork.querySelector('.label .artwork-details');

        if (i === currentSlide) {
            const artworkIndex = Array.from(document.querySelectorAll('.artwork')).indexOf(artwork);
            if (!hasAppeared[artworkIndex]) {
                description.classList.add('visible');
                details.classList.add('visible');
                hasAppeared[artworkIndex] = true;
            }
        }
    });
}

function filterArtworks(category) {
    const visibleArtworks = Array.from(document.querySelectorAll('.artwork')).filter(artwork => {
        const artworkCategory = artwork.getAttribute('data-category');
        if (category === 'all') {
            artwork.style.display = 'flex';
            return true;
        } else if (artworkCategory === category) {
            artwork.style.display = 'flex';
            return true;
        } else {
            artwork.style.display = 'none';
            return false;
        }
    });

    currentSlide = 0;
    goToSlide(0, true);
}

function changeLanguage(lang) {
    currentLang = lang;

    document.querySelectorAll('.menu-item').forEach(item => {
        const target = item.getAttribute('data-target');
        if (target === 'about') {
            item.textContent = lang === 'tr' ? 'Hakkında' : 'About';
        } else if (target === 'artworks') {
            item.textContent = lang === 'tr' ? 'Eserleri' : 'Artworks';
        } else if (target === 'awards') {
            item.textContent = lang === 'tr' ? 'Ödülleri' : 'Awards';
        } else if (target === 'contact') {
            item.textContent = lang === 'tr' ? 'İletişim' : 'Contact';
        }
    });

    document.querySelectorAll('.submenu-item').forEach(item => {
        const category = item.getAttribute('data-category');
        if (category === 'resim') {
            item.textContent = lang === 'tr' ? 'Resim' : 'Painting';
        } else if (category === 'heykel') {
            item.textContent = lang === 'tr' ? 'Heykel' : 'Sculpture';
        }
    });

    document.querySelectorAll('[data-lang-tr][data-lang-en]').forEach(element => {
        if (element.classList.contains('social-link')) {
            const linkText = element.getAttribute(`data-lang-${lang}`);
            if (linkText) {
                element.textContent = linkText;
            }
        } else if (element.classList.contains('artist-title')) {
            element.textContent = element.getAttribute(`data-lang-${lang}`);
        } else if (element.classList.contains('artwork-details')) {
            const artwork = element.closest('.artwork');
            const category = artwork.getAttribute('data-category');
            const baseText = element.getAttribute(`data-lang-${lang}`).replace(/^(Resim|Heykel|Sculpture|Painting): /, '');
            const categoryText = category === 'resim' 
                ? (lang === 'tr' ? 'Resim: ' : 'Painting: ') 
                : (lang === 'tr' ? 'Heykel: ' : 'Sculpture: ');
            element.textContent = categoryText + baseText;
        } else {
            const baseText = element.getAttribute(`data-lang-${lang}`);
            const socialLink = element.querySelector('.social-link');
            if (socialLink) {
                element.childNodes[0].textContent = baseText;
                const linkText = socialLink.getAttribute(`data-lang-${lang}`);
                if (linkText) {
                    socialLink.textContent = linkText;
                }
            } else {
                element.textContent = baseText;
            }
        }
    });

    document.querySelectorAll('.popup-content .about-text').forEach(element => {
        element.classList.remove('active');
        if (element.hasAttribute(`data-lang-${lang}`)) {
            element.classList.add('active');
        }
    });

    const artworkGalleryPopup = document.getElementById('artwork-gallery');
    if (artworkGalleryPopup.style.display === 'flex') {
        const description = artworkGalleryPopup.querySelector('.artwork-gallery-header p');
        if (description) {
            description.textContent = description.getAttribute(`data-lang-${lang}`);
        }
    }
}

document.querySelectorAll('.lang-flag').forEach(flag => {
    flag.addEventListener('click', () => {
        const lang = flag.getAttribute('data-lang');
        changeLanguage(lang);
    });
});

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');

        if (target === 'artworks') {
            if (window.innerWidth <= 768) {
                const parentLi = item.parentElement;
                parentLi.classList.toggle('active');
            }
        } else {
            const popup = document.getElementById(target);
            popup.style.display = 'flex';
            changeLanguage(currentLang);
        }
    });
});

document.querySelectorAll('.submenu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const category = item.getAttribute('data-category');
        filterArtworks(category);
        resetAutoScroll();

        if (window.innerWidth <= 768) {
            const parentLi = item.closest('.has-submenu');
            parentLi.classList.remove('active');
        }
    });
});

document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.popup').style.display = 'none';
        if (!isProfileVisible) {
            artistCard.classList.add('visible');
        }
        if (isAutoScrollPaused) {
            startAutoScroll();
            isAutoScrollPaused = false;
        }
    });
});

document.querySelectorAll('.popup').forEach(popup => {
    popup.addEventListener('click', (e) => {
        if (e.target.closest('.popup-content')) return;
        popup.style.display = 'none';
        if (!isProfileVisible) {
            artistCard.classList.add('visible');
        }
        if (isAutoScrollPaused) {
            startAutoScroll();
            isAutoScrollPaused = false;
        }
    });
});

artistCard.addEventListener('click', () => {
    goToSlide(0);
    filterArtworks('all');
    resetAutoScroll();
});

galleryWall.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && isProfileVisible) {
        if (e.target.closest('.artwork-image') || e.target.closest('.label')) return;
        goToSlide(0, true);
        resetAutoScroll();
    }
});

document.querySelector('.gallery-container').addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    const newSlide = currentSlide + delta;
    const visibleArtworks = Array.from(document.querySelectorAll('.artwork')).filter(artwork => artwork.style.display !== 'none');
    if (newSlide >= 0 && newSlide < visibleArtworks.length) {
        goToSlide(newSlide);
        resetAutoScroll();
    }
});

let touchStartX = 0;
document.querySelector('.gallery-container').addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.querySelector('.gallery-container').addEventListener('touchmove', (e) => {
    const touchMoveX = e.touches[0].clientX;
    const diff = touchStartX - touchMoveX;
    if (Math.abs(diff) > 30) {
        const delta = Math.sign(diff);
        const newSlide = currentSlide + delta;
        const visibleArtworks = Array.from(document.querySelectorAll('.artwork')).filter(artwork => artwork.style.display !== 'none');
        if (newSlide >= 0 && newSlide < visibleArtworks.length) {
            goToSlide(newSlide);
            touchStartX = touchMoveX;
            resetAutoScroll();
        }
    }
});

function setupArtworkEvents() {
    document.querySelectorAll('.artwork-image').forEach((image) => {
        image.setAttribute('draggable', 'false');
        image.setAttribute('onselectstart', 'return false');

        image.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        image.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        image.addEventListener('click', () => {
            const artworkId = image.getAttribute('data-artwork-id');
            const artwork = artworksData.find(a => a.id === artworkId);
            const artworkGalleryPopup = document.getElementById('artwork-gallery');
            const galleryImagesContainer = artworkGalleryPopup.querySelector('.artwork-gallery-images');
            const galleryHeader = artworkGalleryPopup.querySelector('.artwork-gallery-header');

            galleryHeader.querySelector('h2').textContent = artwork.title;
            const descriptionP = galleryHeader.querySelector('p');
            descriptionP.textContent = artwork[`description_${currentLang}`];
            descriptionP.setAttribute('data-lang-tr', artwork.description_tr);
            descriptionP.setAttribute('data-lang-en', artwork.description_en);

            galleryImagesContainer.innerHTML = '';

            const mainImage = document.createElement('img');
            mainImage.src = artwork.main_image;
            galleryImagesContainer.appendChild(mainImage);

            const detailImage1 = document.createElement('img');
            detailImage1.src = artwork.detail_image1;
            galleryImagesContainer.appendChild(detailImage1);

            const detailImage2 = document.createElement('img');
            detailImage2.src = artwork.detail_image2;
            galleryImagesContainer.appendChild(detailImage2);

            artworkGalleryPopup.style.display = 'flex';

            if (!isAutoScrollPaused) {
                clearInterval(autoScrollInterval);
                isAutoScrollPaused = true;
            }
        });
    });
}

document.addEventListener('keydown', (e) => {
    const artworkGalleryPopup = document.getElementById('artwork-gallery');
    const galleryImagesContainer = artworkGalleryPopup.querySelector('.artwork-gallery-images');

    if (artworkGalleryPopup.style.display === 'flex' && window.innerWidth > 768) {
        if (e.key === 'ArrowRight') {
            galleryImagesContainer.scrollLeft += 300;
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            galleryImagesContainer.scrollLeft -= 300;
            e.preventDefault();
        }
    } else {
        const visibleArtworks = Array.from(document.querySelectorAll('.artwork')).filter(artwork => artwork.style.display !== 'none');
        if (e.key === 'ArrowRight') {
            const newSlide = currentSlide + 1;
            if (newSlide < visibleArtworks.length) {
                goToSlide(newSlide);
                resetAutoScroll();
            }
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            const newSlide = currentSlide - 1;
            if (newSlide >= 0) {
                goToSlide(newSlide);
                resetAutoScroll();
            }
            e.preventDefault();
        }
    }
});

function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        const visibleArtworks = Array.from(document.querySelectorAll('.artwork')).filter(artwork => artwork.style.display !== 'none');
        let newSlide = currentSlide + autoScrollDirection;

        if (newSlide >= visibleArtworks.length) {
            autoScrollDirection = -1;
            newSlide = currentSlide - 1;
        } else if (newSlide < 0) {
            autoScrollDirection = 1;
            newSlide = currentSlide + 1;
        }

        goToSlide(newSlide);
    }, 3000);
}

function resetAutoScroll() {
    clearInterval(autoScrollInterval);
    if (!isAutoScrollPaused) {
        startAutoScroll();
    }
}

loadArtworks();
