document
    .getElementById("signupForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value;


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
                        "/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                username: username,

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
                    "Account created successfully!"
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to create account."
                );

            }

        }
    );