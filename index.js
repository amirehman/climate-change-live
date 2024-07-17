const PORT = process.env.PORT || 8000;
const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

const newspapers = [
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: "https://www.theguardian.com"
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.com/search?q=climate',
        base: "https://www.bbc.com"
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change/',
        base: "https://www.telegraph.co.uk"
    }
];

const articles = [];

const fetchArticles = (address, base, newspaperName) => {
    return axios.get(address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const fetchedArticles = [];
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text();
                const url = $(this).attr('href');
                fetchedArticles.push({
                    title,
                    url: base + url,
                    newspaper: newspaperName
                });
            });
            return fetchedArticles;
        });
};

const initializeArticles = () => {
    newspapers.forEach(newspaper => {
        fetchArticles(newspaper.address, newspaper.base, newspaper.name)
            .then(fetchedArticles => {
                articles.push(...fetchedArticles);
            });
    });
};

app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});

app.get('/news', (req, res) => {
    res.json(articles);
});

app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId;
    const newspaper = newspapers.find(newspaper => newspaper.name === newspaperId);
    if (newspaper) {
        fetchArticles(newspaper.address, newspaper.base, newspaper.name)
            .then(specificArticles => {
                res.json(specificArticles);
            });
    } else {
        res.status(404).send('Newspaper not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    initializeArticles();
});