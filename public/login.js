document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value;


            const password =
                document
                    .getElementById("password")
                    .value;


            try {

                const response =
                    await fetch(
                        "/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                password: password

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
                    `Welcome ${data.username}!`
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to login."
                );

            }

        }
    );