let editingMovieId = null;



/* =========================
   LOAD MOVIES
========================= */

async function loadMovies() {

    try {

        const response =
            await fetch("/movies");


        const movies =
            await response.json();


        displayMovies(movies);


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load movies."
        );

    }

}



/* =========================
   DISPLAY MOVIES
========================= */

function displayMovies(movies) {

    const container =
        document.getElementById(
            "movies"
        );


    container.innerHTML = "";


    if (movies.length === 0) {

        container.innerHTML =
            "<p>No movies found.</p>";

        return;

    }


    movies.forEach(movie => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "movie-card";


        card.innerHTML = `

            <img
                src="${movie.image}"
                class="movie-image"
                onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'"
            >


            <div class="movie-info">

                <h2>
                    ${movie.title}
                </h2>


                <p>
                    <strong>
                        Year:
                    </strong>

                    ${movie.year}
                </p>


                <p>
                    <strong>
                        Genre:
                    </strong>

                    ${movie.genre}
                </p>


                <p class="rating">
                    ⭐ ${movie.rating}/10
                </p>


                <p>
                    ${movie.review}
                </p>


                <div class="movie-buttons">

                    <button
                        onclick="editMovie('${movie._id}')"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        onclick="deleteMovie('${movie._id}')"
                    >
                        🗑 Delete
                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    });

}



/* =========================
   ADD / UPDATE MOVIE
========================= */

document
    .getElementById("movieForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const movie = {

                title:
                    document
                        .getElementById("title")
                        .value,


                year:
                    document
                        .getElementById("year")
                        .value,


                genre:
                    document
                        .getElementById("genre")
                        .value,


                image:
                    document
                        .getElementById("image")
                        .value,


                rating:
                    document
                        .getElementById("rating")
                        .value,


                review:
                    document
                        .getElementById("review")
                        .value

            };


            try {

                let response;


                if (editingMovieId) {

                    response =
                        await fetch(
                            `/movies/${editingMovieId}`,
                            {

                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(movie)

                            }
                        );

                } else {

                    response =
                        await fetch(
                            "/movies",
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(movie)

                            }
                        );

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(data.error);

                    return;

                }


                if (editingMovieId) {

                    alert(
                        "Movie updated successfully!"
                    );

                } else {

                    alert(
                        "Movie added successfully!"
                    );

                }


                cancelEdit();


                loadMovies();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to save movie."
                );

            }

        }
    );



/* =========================
   EDIT MOVIE
========================= */

async function editMovie(id) {

    try {

        const response =
            await fetch(
                `/movies/${id}`
            );


        const movie =
            await response.json();


        document
            .getElementById("title")
            .value =
            movie.title;


        document
            .getElementById("year")
            .value =
            movie.year;


        document
            .getElementById("genre")
            .value =
            movie.genre;


        document
            .getElementById("image")
            .value =
            movie.image;


        document
            .getElementById("rating")
            .value =
            movie.rating;


        document
            .getElementById("review")
            .value =
            movie.review;


        editingMovieId = id;


        document
            .getElementById("formTitle")
            .textContent =
            "✏️ Edit Movie";


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load movie."
        );

    }

}



/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

    editingMovieId = null;


    document
        .getElementById("movieForm")
        .reset();


    document
        .getElementById("formTitle")
        .textContent =
        "➕ Add Movie";

}



/* =========================
   DELETE MOVIE
========================= */

async function deleteMovie(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this movie?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `/movies/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.error);

            return;

        }


        alert(
            "Movie deleted successfully!"
        );


        loadMovies();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete movie."
        );

    }

}



/* =========================
   SEARCH MOVIES
========================= */

async function searchMovies() {

    const query =
        document
            .getElementById("search")
            .value
            .trim();


    if (!query) {

        loadMovies();

        return;

    }


    try {

        const response =
            await fetch(
                `/movies/search?q=${encodeURIComponent(query)}`
            );


        const movies =
            await response.json();


        displayMovies(movies);


    } catch (error) {

        console.error(error);

    }

}



window.onload =
    loadMovies;