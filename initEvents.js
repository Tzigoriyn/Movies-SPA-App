function addEventListeners() {
    let notificationTemplate = Handlebars.compile(document.getElementById("notification-template").innerHTML);
    Handlebars.registerPartial("notification-template", notificationTemplate);

    let errorTemplate = Handlebars.compile(document.getElementById("error-template").innerHTML);
    Handlebars.registerPartial("error-template", errorTemplate);

    let movieCardTemplate = Handlebars.compile(document.getElementById("movie-card-template").innerHTML);
    Handlebars.registerPartial("movie-card-template", movieCardTemplate);

    navigate(location.pathname == "/" ? "home" : location.pathname.slice(1));
};

window.addEventListener("popstate", e => {
    e.preventDefault();

    let path = location.pathname.slice(1);

    router(path);
});

function navigateHndler(e) {
    e.preventDefault();

    if (e.target.nodeName !== "A") {
        return;
    }
    let url = new URL(e.target.href);

    navigate(url.pathname.slice(1));
};

function onLoginSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms["login-form"]);

    let email = formData.get("email");
    let password = formData.get("password");

    authService.logon(email, password)
        .then(data => {
            if (data.error) {
                let message = data.error.message;

                handlebarId = "login-form-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("login");
                }, 1000);
            }
            localStorage.setItem("auth", JSON.stringify(data));
            let message = "Login successful.";
            notificationBuilder.seccessAction(templateData, message);
            return navigate("home");
        });
};

function onRegisterSubmit(e) {
    e.preventDefault();

    let regFormData = new FormData(document.forms["register-form"]);

    let email = regFormData.get("email");
    let password = regFormData.get("password");
    let repeatPassword = regFormData.get("repeatPassword");

    authService.register(email, password, repeatPassword)
        .then(data => {
            if (data.error) {
                let message = data.error.message;

                handlebarId = "register-form-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("register");
                }, 1000);
            } else if (data === "Invalid password.") {
                let message = "Invalid password.";

                handlebarId = "register-form-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("register");
                }, 1000);
            };
            localStorage.setItem("auth", JSON.stringify(data));
            let message = "Successful registration!";
            notificationBuilder.seccessAction(templateData, message);

            navigate("home");
        });
};

function onAddMovieSubmit(e) {
    e.preventDefault();

    let formAddMovieData = new FormData(document.forms["create-movie"]);

    let title = formAddMovieData.get("title");
    let description = formAddMovieData.get("description");
    let imageUrl = formAddMovieData.get("imageUrl");

    movieService.add(title, description, imageUrl)
        .then(data => {
            if (typeof data === "string") {
                let message = data;

                handlebarId = "add-movie-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("add-movie");
                }, 1000);
            } else if (data.error) {
                let message = data.error.message;

                handlebarId = "add-movie-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("add-movie");
                }, 1000);
            }
            let message = "Created successfully!";
            notificationBuilder.seccessAction(templateData, message);
            navigate("home");
        });
};

function onMoviesDetailsSubmit(e) {
    e.preventDefault();

    let id = e.target.id;
    movieService.getOne(id)
        .then(data => {
            if (data.error) {
                let message = data.error.message;

                handlebarId = "register-form-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("details/${id}");
                }, 1000);
            }
            navigate(`details/${id}`);
        });
};

function deleteMovie(e, id) {
    e.preventDefault();

    movieService.deleteOne(id)
        .then(res => {
            if (data.error) {
                let message = data.error.message;

                handlebarId = "details-movie-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("home");
                }, 1000);
            }
            let message = "Deleted successfully";
            notificationBuilder.seccessAction(templateData, message);
            navigate("home");
        });
};

function onEditMovieSubmit(e, id) {
    e.preventDefault();

    let formEditMovieData = new FormData(document.forms["edit-movie-form"]);

    let title = formEditMovieData.get("title");
    let description = formEditMovieData.get("description");
    let imageUrl = formEditMovieData.get("imageUrl");

    movieService.editOne(id, title, description, imageUrl)
        .then(data => {
            if (data.error) {
                let message = data.error.message;

                handlebarId = "details-movie-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate(`details/${id}`);
                }, 1000);
            }
            let message = "Eddited successfully";
            notificationBuilder.seccessAction(templateData, message);
            navigate(`details/${id}`);
        });
};

function addLike(e, idMovie) {
    e.preventDefault();

    let { email } = authService.getAuthData()

    movieService.likeOne(idMovie, email)
        .then(data => {
            let message = "Liked successfully";
            notificationBuilder.seccessAction(templateData, message);
            router(`details/${idMovie}`)
        })
};

function onMovieSearchSubmit(e) {
    e.preventDefault();

    let formSearchMov = new FormData(document.forms["search-form"]);

    let text = formSearchMov.get("search-text");

    navigate(`home?search=${text}`)
};

function createErrorObject () {

}

function messageBoxSubmit(containerBody, templateData) {
    loadNavigationTemplate(containerBody, templateData);

    templateData.mesgeHappen = false;
    return;
};

function errorBoxSubmit(containerBody, templateData, handlebarId) {
    loadNavigationTemplate(containerBody, templateData);
    loadBodyTemplate(containerBody, handlebarId, templateData)


    templateData.errorHappen = false;
    return;
};

addEventListeners();