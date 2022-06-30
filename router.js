const routers = {
    "home": "home-template",
    "login": "login-form-template",
    "register": "register-form-template",
    "add-movie": "add-movie-template",
    "details": "details-movie-template"
};

let templateData = authService.getAuthData();

let containerBody = document.getElementById("container");

const router = async (pageUrl) => {
    let [fullPath, queryString] = pageUrl.split("?");

    let [path, id, action] = fullPath.split("/");

    let templateId = routers[path];

    switch (path) {
        case "details":
            let movie = await movieService.getOne(id);
            
            if (templateData.mesgeHappen) {
                messageBoxSubmit(containerBody, templateData);

                return setTimeout(() => {
                    templateData = authService.getAuthData();
                    templateData.mesgeHappen = false;
                    navigate(`details/${id}`);
                }, 1000);
            }
            if (movie.error) {
                let message = data.error.message;

                handlebarId = "details-form-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate(`details/${id}`);
                }, 1000);
            }
            Object.assign(templateData, { id, movie });
            templateData.isCreator = templateData.email === templateData.movie.creator;

            if (action === "edit") {
                templateId = "edit-movie-template";
            }
            break;
        case "home":
            let searchText = queryString?.split("=")[1];
            templateData.movies = [];

            let movies = await movieService.getAll();

            if (templateData.mesgeHappen) {
                messageBoxSubmit(containerBody, templateData);

                return setTimeout(() => {
                    templateData = authService.getAuthData();
                    templateData.mesgeHappen = false;
                    navigate("home");
                }, 1000);
            }

            if (!movies.error) {
                Object.entries(movies)
                    .filter(([id, movie]) => !searchText || movie.title.toLowerCase().includes(searchText.toLowerCase()))
                    .map(([id, movie]) => {
                        templateData.movies.push({
                            id,
                            movie
                        });
                    });
            } else {
                let message = data.error.message;

                handlebarId = "home-template";
                notificationBuilder.errorAction(templateData, message, handlebarId);

                return setTimeout(() => {
                    navigate("home");
                }, 1000);
            }
            break;
        case "logout":
            authService.logout();

            let message = "Seccessful logout";

            await notificationBuilder.seccessAction(templateData, message);
            messageBoxSubmit(containerBody, templateData);

            return setTimeout(() => {
                templateData = authService.getAuthData();
                templateData.mesgeHappen = false;
                navigate("login");
            }, 1000);
        default:
            break;
    }

    loadNavigationTemplate(containerBody, templateData);
    loadBodyTemplate(containerBody, templateId, templateData);
};

const navigate = (path) => {
    history.pushState({}, "", "/" + path);

    router(path);
};

function loadNavigationTemplate(containerBody, templateData) {
    let navigationTemplate = Handlebars.compile(document.getElementById("navigation-template").innerHTML);

    containerBody.innerHTML = navigationTemplate(templateData);
};

function loadBodyTemplate(containerBody, templateId, templateData) {
    let template = Handlebars.compile(document.getElementById(templateId).innerHTML);

    containerBody.innerHTML += template(templateData);
};