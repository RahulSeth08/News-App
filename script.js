const API_KEY = "366d2d9629e6418ab4f676bd931ff8bb";

// Get today's date in 'YYYY-MM-DD' format
function getCurrentDate(daysAgo = 0) {
    const today = new Date();
    today.setDate(today.getDate() - daysAgo); // Go back by a few days if necessary
    return today.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
}

// Base URL for API
let url = `https://newsapi.org/v2/everything?q=tesla&from=${getCurrentDate(7)}&sortBy=publishedAt&apiKey=${API_KEY}`; // Use articles from the past 7 days

window.addEventListener("load", () => {
    fetchNewsData();
});

async function fetchNewsData(query = null) {
    fetchMainHeadline(query);
    fetchRecommendedNews(query);
}

async function fetchMainHeadline(query = null) {
    const mainHeadlineContainer = document.getElementById("main-headline");
    const mainContentContainer = document.getElementById("main-content");
    const mainImageContainer = document.getElementById("main-image");
    const mainSourceContainer = document.getElementById("main-source");

    try {
        let apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
        if (query) {
            apiUrl += `&q=${query}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            console.error("No main article found.");
            return;
        }

        const mainArticle = data.articles[0]; // Use the first article
        const dateString = mainArticle.publishedAt;
        const dateObject = new Date(dateString);
        const currentTime = new Date();

        const formattedDate = timeDifference(currentTime, dateObject);

        mainHeadlineContainer.innerText = mainArticle.title;
        mainContentContainer.innerText = mainArticle.description;
        mainImageContainer.src = mainArticle.urlToImage;
        mainSourceContainer.innerText = `${mainArticle.source.name} - ${formattedDate}`;
    } catch (error) {
        console.error("Error fetching main headline article:", error);
    }
}

async function fetchRecommendedNews(query = null) {
    const cardsContainer = document.getElementById("cards-container");

    try {
        let apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
        if (query) {
            apiUrl += `&q=${query}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.articles) {
            const newsCardTemplate = document.getElementById("template-news-card");

            cardsContainer.innerHTML = "";

            data.articles.slice(1).forEach((article) => {
                if (!article.urlToImage) return;
                const cardClone = newsCardTemplate.content.cloneNode(true);
                fillDataInCard(cardClone, article);
                cardsContainer.appendChild(cardClone);
            });
        }
    } catch (error) {
        console.error("Error fetching recommended news articles:", error);
    }
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;

    const publishedAt = new Date(article.publishedAt);
    const currentTime = new Date();
    const formattedDate = timeDifference(currentTime, publishedAt);

    newsSource.innerHTML = `${article.source.name} • ${formattedDate}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function onNavItemClick(id) {
    fetchNewsData(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

function timeDifference(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) return Math.round(elapsed / 1000) + ' seconds ago';
    else if (elapsed < msPerHour) return Math.round(elapsed / msPerMinute) + ' minutes ago';
    else if (elapsed < msPerDay) return Math.round(elapsed / msPerHour) + ' hours ago';
    else if (elapsed < msPerMonth) return Math.round(elapsed / msPerDay) + ' days ago';
    else if (elapsed < msPerYear) return Math.round(elapsed / msPerMonth) + ' months ago';
    else return Math.round(elapsed / msPerYear) + ' years ago';
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNewsData(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});
