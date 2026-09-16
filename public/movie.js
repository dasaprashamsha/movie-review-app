const params =
    new URLSearchParams(
        window.location.search
    );


const movieId =
    params.get("id");


async function loadMovie() {

    try {

        const response =
            await fetch(
                `/movies/${movieId}`
            );


        const movie =
            await response.json();


        if (!response.ok) {

            document
                .getElementById("movieDetails")
                .innerHTML =
                "<h2>Movie not found</h2>";

            return;

        }


        document
            .getElementById("movieDetails")
            .innerHTML = `

                <div class="movie-detail">

                    <img
                        src="${movie.image}"
                        class="detail-image"
                        onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'"
                    >

                    <div>

                        <h1>
                            ${movie.title}
                        </h1>

                        <p>
                            <strong>
                                Release Year:
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

                        <h3>
                            Movie Review
                        </h3>

                        <p>
                            ${movie.review}
                        </p>

                        <button
                            onclick="bookmarkMovie()"
                        >
                            🔖 Add / Remove Bookmark
                        </button>

                    </div>

                </div>

            `;


        loadReviews();


    } catch (error) {

        console.error(error);

    }

}


async function bookmarkMovie() {

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
                "Added to bookmarks 🔖"
            );

        } else {

            alert(
                "Removed from bookmarks"
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update bookmark."
        );

    }

}


async function loadReviews() {

    try {

        const response =
            await fetch(
                `/movies/${movieId}/reviews`
            );


        const reviews =
            await response.json();


        const container =
            document.getElementById(
                "reviews"
            );


        container.innerHTML = "";


        if (reviews.length === 0) {

            container.innerHTML =
                "<p>No user reviews yet.</p>";

            return;

        }


        reviews.forEach(item => {

            const div =
                document.createElement("div");


            div.className =
                "review-card";


            div.innerHTML = `

                <h3>
                    ${item.username}
                </h3>

                <p>
                    ${"⭐".repeat(item.rating)}
                </p>

                <p>
                    ${item.review}
                </p>

            `;


            container.appendChild(div);

        });


    } catch (error) {

        console.error(error);

    }

}


document
    .getElementById("reviewForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const rating =
                document
                    .getElementById("rating")
                    .value;


            const review =
                document
                    .getElementById("review")
                    .value;


            try {

                const response =
                    await fetch(
                        `/movies/${movieId}/reviews`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                rating: rating,

                                review: review

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(data.error);

                    return;

                }


                alert(
                    "Review submitted successfully!"
                );


                document
                    .getElementById(
                        "reviewForm"
                    )
                    .reset();


                loadReviews();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to submit review."
                );

            }

        }
    );


loadMovie();