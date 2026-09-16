const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

const PORT = 3000;
const MONGO_URL = "mongodb://127.0.0.1:27017";
const DB_NAME = "movieDB";

const client = new MongoClient(MONGO_URL);

let db;
let moviesCollection;
let usersCollection;
let bookmarksCollection;
let reviewsCollection;

app.use(cors());

app.use(express.json());

app.use(
    session({
        secret: "movie-app-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});


/* =========================
   USER SIGN UP
========================= */

app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const existingUser = await usersCollection.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                error: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username: username,
            email: email.toLowerCase(),
            password: hashedPassword
        };

        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
            message: "Account created successfully",
            userId: result.insertedId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Signup failed"
        });
    }
});


/* =========================
   USER LOGIN
========================= */

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await usersCollection.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        req.session.userId = user._id.toString();

        req.session.username = user.username;

        res.json({
            message: "Login successful",
            username: user.username
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Login failed"
        });
    }
});


/* =========================
   LOGOUT
========================= */

app.post("/logout", (req, res) => {

    req.session.destroy();

    res.json({
        message: "Logged out successfully"
    });

});


/* =========================
   CURRENT USER
========================= */

app.get("/current-user", async (req, res) => {
    try {

        if (!req.session.userId) {
            return res.json({
                loggedIn: false
            });
        }

        const user = await usersCollection.findOne({
            _id: new ObjectId(req.session.userId)
        });

        if (!user) {
            return res.json({
                loggedIn: false
            });
        }

        res.json({
            loggedIn: true,
            username: user.username,
            email: user.email
        });

    } catch (error) {

        res.status(500).json({
            error: "Unable to get user"
        });

    }
});


/* =========================
   GET ALL MOVIES
========================= */

app.get("/movies", async (req, res) => {
    try {

        const movies = await moviesCollection
            .find()
            .sort({ title: 1 })
            .toArray();

        res.json(movies);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to load movies"
        });

    }
});


/* =========================
   SEARCH MOVIES
========================= */

app.get("/movies/search", async (req, res) => {
    try {

        const q = req.query.q || "";

        const movies = await moviesCollection
            .find({
                title: {
                    $regex: q,
                    $options: "i"
                }
            })
            .toArray();

        res.json(movies);

    } catch (error) {

        res.status(500).json({
            error: "Search failed"
        });

    }
});


/* =========================
   GET ONE MOVIE
========================= */

app.get("/movies/:id", async (req, res) => {
    try {

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid movie ID"
            });
        }

        const movie = await moviesCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!movie) {
            return res.status(404).json({
                error: "Movie not found"
            });
        }

        res.json(movie);

    } catch (error) {

        res.status(500).json({
            error: "Unable to load movie"
        });

    }
});


/* =========================
   ADMIN ADD MOVIE
========================= */

app.post("/movies", async (req, res) => {
    try {

        const {
            title,
            year,
            genre,
            image,
            rating,
            review
        } = req.body;

        if (!title || !year || !genre) {
            return res.status(400).json({
                error: "Title, year and genre are required"
            });
        }

        const movie = {

            title: title,

            year: Number(year),

            genre: genre,

            image: image || "",

            rating: Number(rating) || 0,

            review: review || ""

        };

        const result = await moviesCollection.insertOne(movie);

        res.status(201).json({

            message: "Movie added successfully",

            movie: {
                _id: result.insertedId,
                ...movie
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to add movie"
        });

    }
});


/* =========================
   ADMIN UPDATE MOVIE
========================= */

app.put("/movies/:id", async (req, res) => {
    try {

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid movie ID"
            });
        }

        const {
            title,
            year,
            genre,
            image,
            rating,
            review
        } = req.body;

        const updateData = {

            title: title,

            year: Number(year),

            genre: genre,

            image: image || "",

            rating: Number(rating) || 0,

            review: review || ""

        };

        const result = await moviesCollection.updateOne(

            {
                _id: new ObjectId(id)
            },

            {
                $set: updateData
            }

        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: "Movie not found"
            });
        }

        res.json({
            message: "Movie updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to update movie"
        });

    }
});


/* =========================
   ADMIN DELETE MOVIE
========================= */

app.delete("/movies/:id", async (req, res) => {
    try {

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid movie ID"
            });
        }

        const movieId = new ObjectId(id);

        const result = await moviesCollection.deleteOne({
            _id: movieId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "Movie not found"
            });
        }

        await bookmarksCollection.deleteMany({
            movieId: movieId
        });

        await reviewsCollection.deleteMany({
            movieId: movieId
        });

        res.json({
            message: "Movie deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to delete movie"
        });

    }
});


/* =========================
   ADD / REMOVE BOOKMARK
========================= */

app.put("/user/bookmarks/:movieId", async (req, res) => {
    try {

        if (!req.session.userId) {

            return res.status(401).json({
                error: "Please login first"
            });

        }

        const movieId = req.params.movieId;

        if (!ObjectId.isValid(movieId)) {

            return res.status(400).json({
                error: "Invalid movie ID"
            });

        }

        const userId = new ObjectId(
            req.session.userId
        );

        const movieObjectId = new ObjectId(
            movieId
        );

        const existingBookmark =
            await bookmarksCollection.findOne({

                userId: userId,

                movieId: movieObjectId

            });

        if (existingBookmark) {

            await bookmarksCollection.deleteOne({

                _id: existingBookmark._id

            });

            return res.json({

                bookmarked: false

            });

        }

        await bookmarksCollection.insertOne({

            userId: userId,

            movieId: movieObjectId,

            createdAt: new Date()

        });

        res.json({

            bookmarked: true

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Unable to update bookmark"

        });

    }
});


/* =========================
   GET USER BOOKMARKS
========================= */

app.get("/user/bookmarks", async (req, res) => {
    try {

        if (!req.session.userId) {

            return res.status(401).json({
                error: "Please login first"
            });

        }

        const userId = new ObjectId(
            req.session.userId
        );

        const bookmarks =
            await bookmarksCollection
                .find({
                    userId: userId
                })
                .toArray();

        const movieIds = bookmarks.map(
            item => item.movieId
        );

        const movies =
            await moviesCollection
                .find({
                    _id: {
                        $in: movieIds
                    }
                })
                .toArray();

        res.json(movies);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Unable to load bookmarks"

        });

    }
});


/* =========================
   ADD USER REVIEW
========================= */

app.post("/movies/:movieId/reviews", async (req, res) => {
    try {

        if (!req.session.userId) {

            return res.status(401).json({
                error: "Please login first"
            });

        }

        const movieId = req.params.movieId;

        if (!ObjectId.isValid(movieId)) {

            return res.status(400).json({
                error: "Invalid movie ID"
            });

        }

        const {
            rating,
            review
        } = req.body;

        if (!rating || !review) {

            return res.status(400).json({
                error: "Rating and review are required"
            });

        }

        const user =
            await usersCollection.findOne({

                _id: new ObjectId(
                    req.session.userId
                )

            });

        const newReview = {

            userId: new ObjectId(
                req.session.userId
            ),

            movieId: new ObjectId(movieId),

            username: user.username,

            rating: Number(rating),

            review: review,

            createdAt: new Date()

        };

        await reviewsCollection.insertOne(
            newReview
        );

        res.status(201).json({

            message: "Review added successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Unable to add review"

        });

    }
});


/* =========================
   GET USER REVIEWS
========================= */

app.get("/movies/:movieId/reviews", async (req, res) => {
    try {

        const movieId = req.params.movieId;

        if (!ObjectId.isValid(movieId)) {

            return res.status(400).json({
                error: "Invalid movie ID"
            });

        }

        const reviews =
            await reviewsCollection
                .find({
                    movieId: new ObjectId(movieId)
                })
                .sort({
                    createdAt: -1
                })
                .toArray();

        res.json(reviews);

    } catch (error) {

        res.status(500).json({

            error: "Unable to load reviews"

        });

    }
});


/* =========================
   START SERVER
========================= */

async function startServer() {

    try {

        await client.connect();

        db = client.db(DB_NAME);

        moviesCollection =
            db.collection("movies");

        usersCollection =
            db.collection("users");

        bookmarksCollection =
            db.collection("bookmarks");

        reviewsCollection =
            db.collection("reviews");

        console.log(
            "MongoDB connected successfully"
        );

        app.listen(PORT, () => {

            console.log(
                `Server running at http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error
        );

    }
}

startServer();