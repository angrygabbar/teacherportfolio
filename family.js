document.addEventListener('DOMContentLoaded', () => {

    // --- Supabase Configuration ---
    const SUPABASE_URL = 'https://oatmudklrjiaujuxoyvj.supabase.co'; // Your Supabase Project URL
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdG11ZGtscmppYXVqdXhveXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzQ2OTUsImV4cCI6MjA2OTgxMDY5NX0.U2C9lPzV9qrE3wgFmmtvGELcDwlB3rX79O_wZzlVG7k'; // Your Supabase anon public key

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    function showPage(pageId) {
        const targetPageId = pageId || 'home';
        pages.forEach(page => {
            page.classList.toggle('active', page.id === targetPageId);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('href').substring(1);
            showPage(pageId);
            window.location.hash = pageId;
            if (mobileMenu.classList.contains('block')) {
                mobileMenu.classList.remove('block');
                mobileMenu.classList.add('hidden');
            }
        });
    });

    mobileMenuButton.addEventListener('click', () => {
         mobileMenu.classList.toggle('hidden');
         mobileMenu.classList.toggle('block');
    });

    // --- Star Rating Logic ---
    const starRatingContainer = document.getElementById('star-rating');
    const stars = starRatingContainer.querySelectorAll('.star');
    const ratingValueInput = document.getElementById('rating-value');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            ratingValueInput.value = value;
            updateStarsUI(value);
        });
    });

    function updateStarsUI(selectedValue) {
         stars.forEach(star => {
            star.classList.toggle('selected', star.getAttribute('data-value') <= selectedValue);
        });
    }

    // --- Review Handling using Supabase ---
    const reviewForm = document.getElementById('review-form');
    const reviewsContainer = document.getElementById('reviews-container');
    const formMessage = document.getElementById('form-message');

    /**
     * Renders a single review and adds it to the DOM.
     * @param {object} review - The review object to render.
     * @param {boolean} prepend - If true, adds the review to the top of the list.
     */
    function renderReview(review, prepend = false) {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'bg-white p-6 rounded-lg shadow-md';

        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<span class="text-xl ${i <= review.rating ? 'text-amber-500' : 'text-gray-300'}">&#9733;</span>`;
        }

        reviewElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div>
                    <p class="font-bold text-lg text-gray-800">${review.name}</p>
                    <p class="text-sm text-gray-500">${review.relation}</p>
                </div>
                <div class="flex">${starsHTML}</div>
            </div>
            <p class="text-gray-700 leading-relaxed">"${review.review_text}"</p>
        `;
        
        if (prepend) {
            reviewsContainer.prepend(reviewElement);
        } else {
            reviewsContainer.appendChild(reviewElement);
        }
    }

    /**
     * Fetches all reviews from Supabase and displays them.
     */
    async function loadReviews() {
        // Fetch reviews without ordering on the server to prevent errors.
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*');

        reviewsContainer.innerHTML = ''; // Clear container before loading
        if (error) {
            console.error('Error loading reviews:', error);
            reviewsContainer.innerHTML = '<p class="text-center text-red-500">Could not load reviews. Please check the browser console for details.</p>';
            return;
        }

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p id="no-reviews-placeholder" class="text-center text-gray-500">Be the first to leave a review!</p>';
        } else {
            // Sort the reviews by date in the browser (newest first).
            reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            reviews.forEach(review => renderReview(review, false));
        }
    }

    /**
     * Handles the submission of the review form.
     */
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rating = parseInt(ratingValueInput.value, 10);
        if (rating === 0) {
            formMessage.textContent = 'Please select a star rating.';
            formMessage.className = 'mt-4 text-center text-red-500';
            return;
        }

        const newReview = {
            name: document.getElementById('reviewer-name').value,
            relation: document.getElementById('reviewer-relation').value,
            rating: rating,
            review_text: document.getElementById('review-text').value,
        };

        const { data, error } = await supabase
            .from('reviews')
            .insert([newReview])
            .select();

        if (error) {
            console.error('Error submitting review:', error);
            formMessage.textContent = 'Could not submit review. Please try again.';
            formMessage.className = 'mt-4 text-center text-red-500';
            return;
        }

        // Correctly update the UI
        if (data && data.length > 0) {
            // Remove the "Be the first..." placeholder if it exists.
            const placeholder = document.getElementById('no-reviews-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            // Add the new review to the top of the list.
            renderReview(data[0], true);
        }

        // Reset form and provide feedback
        reviewForm.reset();
        updateStarsUI(0);
        formMessage.textContent = 'Thank you for your review!';
        formMessage.className = 'mt-4 text-center text-green-500';
        setTimeout(() => formMessage.textContent = '', 3000);
    });

    // --- Initial Page Load ---
    const initialPage = window.location.hash ? window.location.hash.substring(1) : 'home';
    showPage(initialPage);
    loadReviews(); // Load reviews when the page is ready
});
