async function loadMovies() {

    try {

        const response =
            await fetch("/movies");

        const movies =
            await response.json();

        displayMovies(movies);

    } catch (error) {

        console.error(error);

        document.getElementById("movies").innerHTML =
            "<p>Unable to load movies.</p>";

    }
}


function displayMovies(movies) {

    const container =
        document.getElementById("movies");

    container.innerHTML = "";


    if (movies.length === 0) {

        container.innerHTML =
            "<p>No movies found.</p>";

        return;

    }


    movies.forEach(movie => {

        const card =
            document.createElement("div");

        card.className =
            "movie-card";


        card.innerHTML = `

            <img
                src="${movie.image}"
                alt="${movie.title}"
                class="movie-image"
                onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'"
            >

            <div class="movie-info">

                <h2>
                    ${movie.title}
                </h2>

                <p>
                    <strong>Year:</strong>
                    ${movie.year}
                </p>

                <p>
                    <strong>Genre:</strong>
                    ${movie.genre}
                </p>

                <p class="rating">
                    ⭐ ${movie.rating}/10
                </p>

                <p>
                    ${movie.review}
                </p>

                <button
                    onclick="viewMovie('${movie._id}')"
                >
                    View Details
                </button>

                <button
                    onclick="bookmarkMovie('${movie._id}')"
                >
                    🔖 Bookmark
                </button>

            </div>
        `;


        container.appendChild(card);

    });
}


function viewMovie(id) {

    window.location.href =
        `movie.html?id=${id}`;

}


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


async function bookmarkMovie(movieId) {

    try {

        const response =
            await fetch(
                `/user/bookmarks/${movieId}`,
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.error);

            return;

        }


        if (data.bookmarked) {

            alert(
                "Movie added to bookmarks 🔖"
            );

        } else {

            alert(
                "Movie removed from bookmarks"
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update bookmark."
        );

    }

}


async function logout() {

    try {

        await fetch(
            "/logout",
            {
                method: "POST"
            }
        );

        window.location.href =
            "index.html";

    } catch (error) {

        console.error(error);

    }

}


async function loadCurrentUser() {

    try {

        const response =
            await fetch(
                "/current-user"
            );

        const data =
            await response.json();


        const display =
            document.getElementById(
                "usernameDisplay"
            );


        if (data.loggedIn) {

            display.textContent =
                `Hello, ${data.username} 👋`;

        }

    } catch (error) {

        console.error(error);

    }

}


window.onload = function () {

    loadMovies();

    loadCurrentUser();

};