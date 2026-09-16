async function loadBookmarks() {

    try {

        const response =
            await fetch(
                "/user/bookmarks"
            );


        const data =
            await response.json();


        if (!response.ok) {

            document
                .getElementById("bookmarks")
                .innerHTML =
                `<p>${data.error}</p>`;

            return;

        }


        const container =
            document.getElementById(
                "bookmarks"
            );


        container.innerHTML = "";


        if (data.length === 0) {

            container.innerHTML =
                "<p>You haven't bookmarked any movies yet.</p>";

            return;

        }


        data.forEach(movie => {

            const card =
                document.createElement("div");


            card.className =
                "movie-card";


            card.innerHTML = `

                <img
                    src="${movie.image}"
                    class="movie-image"
                >

                <div class="movie-info">

                    <h2>
                        ${movie.title}
                    </h2>

                    <p>
                        ${movie.year}
                    </p>

                    <p>
                        ${movie.genre}
                    </p>

                    <p class="rating">
                        ⭐ ${movie.rating}/10
                    </p>

                    <button
                        onclick="viewMovie('${movie._id}')"
                    >
                        View Movie
                    </button>

                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        document
            .getElementById("bookmarks")
            .innerHTML =
            "<p>Unable to load bookmarks.</p>";

    }

}


function viewMovie(id) {

    window.location.href =
        `movie.html?id=${id}`;

}


loadBookmarks();