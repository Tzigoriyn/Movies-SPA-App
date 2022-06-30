const apikey = "AIzaSyA15xolGAwKWGWXgJDy5HXuhMRLZEMZF10";
const dbUrl = "https://movies-cac69-default-rtdb.firebaseio.com/movies";

const resObj = async (url, method, body) => {
    let options = {
        method
    }

    if (body) {
        Object.assign(options, {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                body
            )
        })
    }

    let response = await fetch(`${url}`, options);
    return await response.json();
}

const authService = {
    async register(email, password, repeatPassword) {
        if (password !== repeatPassword) {

            return "Invalid password.";
        }

        const regUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apikey}`;
        const objectBody = {
            email,
            password
        }

        return await resObj(`${regUrl}`, "POST", objectBody);
    },

    async logon(email, password) {
        const regUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apikey}`;
        const objectBody = {
            email,
            password
        }

        return await resObj(`${regUrl}`, "POST", objectBody);
    },

    getAuthData() {
        try {
            let data = JSON.parse(localStorage.getItem("auth"));

            return {
                isAuthenticated: Boolean(data.idToken),
                email: data.email
            }
        } catch (error) {
            return {
                isAuthenticated: false,
                email: ""
            }
        }
    },

    logout() {
        localStorage.setItem("auth", "");
    }
};

const movieService = {
    async add(title, description, imageUrl) {
        if (title === "") {
            return "Please enter movie title";
        };
        if (description === "") {
            return "Please enter movie description";
        };
        if (!imageUrl.match(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
            return "Please enter movie correct imageUrl";
        };

        let { email } = authService.getAuthData();

        const objectBody = {
            creator: email,
            title,
            description,
            imageUrl
        }

        return await resObj(`${dbUrl}.json`, "POST", objectBody);
    },

    async getAll() {
        let res = await resObj(`${dbUrl}.json`, "GET");

        return res;
    },

    async getOne(id) {

        let res = await resObj(`${dbUrl}/${id}.json`, "GET");
        let user = authService.getAuthData().email;

        let userAlreadyLiked = Object.values(res.likes || {}).some(x => x.like === user);
        res.userAlreadyLiked = userAlreadyLiked;

        res.numberOfLikes = Object.keys(res.likes || {}).length;

        return res;
    },

    async deleteOne(id) {

        return await resObj(`${dbUrl}/${id}.json`, "DELETE");
    },

    async editOne(id, title, description, imageUrl) {
        const objectBody = {
            title,
            description,
            imageUrl
        }
        return await resObj(`${dbUrl}/${id}.json`, "PATCH", objectBody);
    },

    async likeOne(id, email) {
        const objectBody = {
            like: email
        }

        return await resObj(`${dbUrl}/${id}/likes.json`, "POST", objectBody);
    }
};

const notificationBuilder = {
    async seccessAction(templateData, message) {
        templateData.mesgeHappen = true;
        templateData.styleDisplay = "block";
        templateData.message = `${message}`;

        return templateData;
    },

    async errorAction(templateData, message, handlebarId) {
        templateData.errorHappen = true;
        templateData.styleDisplay = "block";
        templateData.message = `${message}`;

        errorBoxSubmit(containerBody, templateData, handlebarId);
        return templateData;
    },
}