import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "d13xat1hwxt21t45.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "lru868rp8ryaeke3",
    password: "mf9p2q7r3opq7lwg",
    database: "vnujnm2vqpohwi0e",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//This function looks up a single quote by ID
async function getAuthorById(authorId) {
    const query = `
        SELECT authorId, firstName, lastName,
               DATE_FORMAT(dob, '%Y-%m-%d') AS dob,
               DATE_FORMAT(dod, '%Y-%m-%d') AS dod,
               gender, profession, country
        FROM authors
        WHERE authorId = ?
    `;
    const [rows] = await pool.query(query, [authorId]);
    return rows[0] || null;
}

// Look up one quote.
async function getQuoteById(quoteId) {
    const [rows] = await pool.query(
        'SELECT * FROM quotes WHERE quoteId = ?',
        [quoteId]
    );
    return rows[0] || null;
}

//List of authors
app.get('/authors', async (req, res) => {

    let authorsQuery = `SELECT * FROM authors`;
    const [rows] = await pool.query(authorsQuery);

    res.render('authors.ejs', { authors: rows });

});

//renders the edit author form
app.get('/editAuthor', async (req, res) => {
    const authorId = req.query.authorId;
    const authorObject = await getAuthorById(authorId);

    if (authorObject == null) {
        return res.redirect('/authors');
    }

    res.render('editAuthor.ejs', {
        formObject: authorObject,
        formErrors: {}
    });
});

//updates the author's information
app.post('/updateAuthor', async (req, res) => {
    const formObject = {
        authorId: req.body.authorId,
        firstName: (req.body.firstName || '').trim(),
        lastName: (req.body.lastName || '').trim(),
        dob: req.body.dob || '',
        dod: req.body.dod || '',
        gender: req.body.gender || '',
        profession: req.body.profession || '',
        country: req.body.country || ''
    };

    const formErrors = {};

    if (formObject.firstName === '') {
        formErrors.firstName = 'First name cannot be empty.';
    }

    if (formObject.lastName === '') {
        formErrors.lastName = 'Last name cannot be empty.';
    }

    if (formObject.dod && !formObject.dob) {
        formErrors.dod =
            'Enter a birth date before entering a death date.';
    } else if (
        formObject.dob &&
        formObject.dod &&
        formObject.dod <= formObject.dob
    ) {
        formErrors.dod = 'Death date must be after birth date.';
    }

    if (Object.keys(formErrors).length > 0) {
        return res.status(400).render('editAuthor.ejs', {
            formObject,
            formErrors
        });
    }

    const updateQuery = `
        UPDATE authors
        SET firstName = ?,
            lastName = ?,
            dob = ?,
            dod = ?,
            gender = ?,
            profession = ?,
            country = ?
        WHERE authorId = ?
    `;

    const params = [
        formObject.firstName,
        formObject.lastName,
        formObject.dob || null,
        formObject.dod || null,
        formObject.gender,
        formObject.profession,
        formObject.country,
        formObject.authorId
    ];

    await pool.query(updateQuery, params);

    res.redirect('/authors');
});

//This function gets all the data we need for dropdown lists
async function getQuoteFormData() {
    const [authors] = await pool.query(`
        SELECT authorId, firstName, lastName
        FROM authors
        ORDER BY firstName, lastName
    `);

    const [categories] = await pool.query(`
        SELECT DISTINCT category
        FROM quotes
        WHERE category IS NOT NULL
          AND TRIM(category) <> ''
        ORDER BY category
    `);

    return { authors, categories };
}

// renders an empty new quote form
app.get('/newQuote', async (req, res) => {
    const formData = await getQuoteFormData();

    res.render('newQuote.ejs', {
        formData,
        formObject: {
            quote: '',
            authorId: '',
            category: '',
            likes: '0'
        },
        formErrors: {}
    });
});

// submits the users input to be entered into the db
app.post('/insertQuote', async (req, res) => {
    const formData = await getQuoteFormData();

    const formObject = {
        quote: (req.body.quote || '').trim(),
        authorId: req.body.authorId || '',
        category: req.body.category || '',
        likes: (req.body.likes || '').trim()
    };

    const formErrors = {};
    const likes = Number(formObject.likes);

    if (formObject.quote === '') {
        formErrors.quote = 'Quote cannot be empty.';
    } else if (formObject.quote.length > 200) {
        formErrors.quote = 'Quote cannot exceed 200 characters.';
    }

    if (
        formObject.likes === '' ||
        !Number.isInteger(likes) ||
        likes < 0 ||
        likes > 2147483647
    ) {
        formErrors.likes =
            'Likes must be a whole number from 0 to 2,147,483,647.';
    }

    const validAuthor = formData.authors.some(
        author => String(author.authorId) === formObject.authorId
    );

    if (!validAuthor) {
        formErrors.authorId = 'Select an author from the list.';
    }

    const validCategory = formData.categories.some(
        item => item.category === formObject.category
    );

    if (!validCategory) {
        formErrors.category = 'Select a category from the list.';
    }

    if (Object.keys(formErrors).length > 0) {
        return res.status(400).render('newQuote.ejs', {
            formData,
            formObject,
            formErrors
        });
    }

    const insertQuery = `
        INSERT INTO quotes (quote, authorId, category, likes)
        VALUES (?, ?, ?, ?)
    `;

    await pool.query(insertQuery, [
        formObject.quote,
        formObject.authorId,
        formObject.category,
        likes
    ]);

    res.redirect('/quoteList');
});

// renders the edit quote form
app.get('/editQuote', async (req, res) => {
    const quoteObject = await getQuoteById(req.query.quoteId);

    if (quoteObject == null) {
        return res.redirect('/quoteList');
    }

    const formData = await getQuoteFormData();

    res.render('editQuote.ejs', {
        formData,
        formObject: {
            ...quoteObject,
            likes: quoteObject.likes ?? 0
        },
        formErrors: {}
    });
});


app.get('/quoteList', async (req, res) => {
    let quotesQuery = `SELECT * FROM quotes`;
    const [rows] = await pool.query(quotesQuery);

    res.render('quoteList.ejs', { quotes: rows });

});


app.post('/updateQuote', async (req, res) => {
    const quoteObject = await getQuoteById(req.body.quoteId);

    if (quoteObject == null) {
        return res.redirect('/quoteList');
    }

    const formData = await getQuoteFormData();

    const formObject = {
        quoteId: req.body.quoteId,
        quote: (req.body.quote || '').trim(),
        authorId: req.body.authorId || '',
        category: req.body.category || '',
        likes: (req.body.likes || '').trim()
    };

    const formErrors = {};
    const likes = Number(formObject.likes);

    if (formObject.quote === '') {
        formErrors.quote = 'Quote cannot be empty.';
    } else if (formObject.quote.length > 200) {
        formErrors.quote = 'Quote cannot exceed 200 characters.';
    }

    if (
        formObject.likes === '' ||
        !Number.isInteger(likes) ||
        likes < 0 ||
        likes > 2147483647
    ) {
        formErrors.likes =
            'Likes must be a whole number from 0 to 2,147,483,647.';
    }

    const validAuthor = formData.authors.some(
        author => String(author.authorId) === formObject.authorId
    );

    if (!validAuthor) {
        formErrors.authorId = 'Select an author from the list.';
    }

    const validCategory = formData.categories.some(
        item => item.category === formObject.category
    );

    if (!validCategory) {
        formErrors.category = 'Select a category from the list.';
    }

    if (Object.keys(formErrors).length > 0) {
        return res.status(400).render('editQuote.ejs', {
            formData,
            formObject,
            formErrors
        });
    }

    const updateQuery = `
        UPDATE quotes
        SET quote = ?,
            authorId = ?,
            category = ?,
            likes = ?
        WHERE quoteId = ?
    `;

    await pool.query(updateQuery, [
        formObject.quote,
        formObject.authorId,
        formObject.category,
        likes,
        formObject.quoteId
    ]);

    res.redirect('/quoteList');
});

app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

// Display an empty author form.
app.get('/newAuthor', (req, res) => {
    res.render('editAuthor.ejs', {
        formObject: {
            authorId: '',
            firstName: '',
            lastName: '',
            dob: '',
            dod: '',
            gender: '',
            profession: '',
            country: ''
        },
        formErrors: {}
    });
});

// Validate and save a new author.
app.post('/insertAuthor', async (req, res) => {
    const formObject = {
        authorId: '',
        firstName: (req.body.firstName || '').trim(),
        lastName: (req.body.lastName || '').trim(),
        dob: req.body.dob || '',
        dod: req.body.dod || '',
        gender: req.body.gender || '',
        profession: req.body.profession || '',
        country: req.body.country || ''
    };

    const formErrors = {};

    if (formObject.firstName === '') {
        formErrors.firstName = 'First name cannot be empty.';
    }

    if (formObject.lastName === '') {
        formErrors.lastName = 'Last name cannot be empty.';
    }

    if (formObject.dod && !formObject.dob) {
        formErrors.dod =
            'Enter a birth date before entering a death date.';
    } else if (
        formObject.dob &&
        formObject.dod &&
        formObject.dod <= formObject.dob
    ) {
        formErrors.dod = 'Death date must be after birth date.';
    }

    if (Object.keys(formErrors).length > 0) {
        return res.status(400).render('editAuthor.ejs', {
            formObject,
            formErrors
        });
    }

    const insertQuery = `
        INSERT INTO authors
            (firstName, lastName, dob, dod, gender, profession, country)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        formObject.firstName,
        formObject.lastName,
        formObject.dob || null,
        formObject.dod || null,
        formObject.gender,
        formObject.profession,
        formObject.country
    ];

    await pool.query(insertQuery, params);

    res.redirect('/authors');
});

app.listen(3000, () => {
    console.log("Express server running")
})