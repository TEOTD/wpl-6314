/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
app.use(express.json());


const multer = require("multer");
const fs = require("fs");
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

app.use(express.json());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    },
    store: new MongoStore({mongoUrl: 'mongodb://127.0.0.1/project7'})
}));

function isAuthenticated(request, response, next) {
    if (request.session.user) next();
    else response.status(401).send('Unauthorized');
}

// Load the Mongoose schema for User, Photo, and SchemaInfo
const {Types} = require("mongoose");
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const {makePasswordEntry, doesPasswordMatch} = require("./password");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project7", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
    response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", isAuthenticated, async function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params
    // objects.
    console.log("/test called with param1 = ", request.params.p1);

    const param = request.params.p1 || "info";

    if (param === "info") {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will
        // match it.
        try {

            const info = await SchemaInfo.find({});
            if (info.length === 0) {
                // No SchemaInfo found - return 500 error
                return response.status(500).send("Missing SchemaInfo");
            }
            console.log("SchemaInfo", info[0]);
            return response.json(info[0]); // Use `json()` to send JSON responses
        } catch (err) {
            // Handle any errors that occurred during the query
            console.error("Error in /test/info:", err);
            return response.status(500).json(err); // Send the error as JSON
        }

    } else if (param === "counts") {
        // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.


        const collections = [
            {name: "user", collection: User},
            {name: "photo", collection: Photo},
            {name: "schemaInfo", collection: SchemaInfo},
        ];

        try {
            await Promise.all(
                collections.map(async (col) => {
                    col.count = await col.collection.countDocuments({});
                    return col;
                })
            );

            const obj = {};
            for (let i = 0; i < collections.length; i++) {
                obj[collections[i].name] = collections[i].count;
            }
            return response.end(JSON.stringify(obj));
        } catch (err) {
            return response.status(500).send(JSON.stringify(err));
        }
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400)
        // status.
        return response.status(400).send("Bad param " + param);
    }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", isAuthenticated, async function (request, response) {
    try {
        const users = await User.find({}, {first_name: 1, last_name: 1, _id: 1}).sort({_id: 1});
        response.status(200).send(users);
    } catch (error) {
        response.status(500).send({error: "An error occurred while fetching users."});
    }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", isAuthenticated, async function (request, response) {
    const id = request.params.id;
    if (!Types.ObjectId.isValid(id)) {
        console.log(`Invalid UserId format: ${id}`);
        return response.status(400).send(`Invalid UserId: ${id}`);
    }
    const objectId = new Types.ObjectId(id);
    try {
        const user = await User.findById(objectId, {__v: 0, login_name: 0, password_digest: 0, salt: 0});
        if (!user) {
            console.log(`User with _id: ${id} not found.`);
            return response.status(404).send(`User with _id: ${id} not found.`);
        }
        return response.status(200).send(user);
    } catch (error) {
        console.log("Error in /user/:id:", error);
        return response.status(500).send({error: `An error occurred while fetching user with _id: ${id}. ${error.message}`});
    }
});

/**
 * URL /commentsOfPhoto/:photo_id - Adds user comments for a photo.
 */
app.post("/commentsOfPhoto/:photo_id", isAuthenticated, async function (request, response) {
    const photo_id = request.params.photo_id;
    const comment = request.body.comment;
    try {
        const newComment = {
            comment: comment,
            user_id: request.session.user._id,
            date_time: new Date(),
        };
        const result = await Photo.findByIdAndUpdate(
            photo_id,
            {$push: {comments: newComment}},
            {new: true}
        );

        if (!result) {
            return response.status(404).json('Photo not found');
        }
        return response.status(200).json({message: 'Comment added successfully', comment: comment});
    } catch (error) {
        console.error(error);
        return response.status(400).json('Something went wrong...');
    }
});


/**
 * URL /photos/new - Accepts an image file in the body. Adds photos.
 */
app.post('/photos/new', isAuthenticated, async function (request, response) {
    processFormBody(request, response, (err) => {
        if (err || !request.file) {
            console.error('File upload error:', err);
            return response.status(400).send('File upload failed');
        }

        // Validate file type and size
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(request.file.mimetype)) {
            return response.status(400).send('Invalid file type');
        }

        const timestamp = Date.now();
        const fileName = `U${timestamp}_${request.file.originalname}`;
        const filePath = './images/' + fileName;

        // Write the file to the "images" directory
        fs.writeFile(filePath, request.file.buffer, (err1) => {
            if (err1) {
                console.error('Error saving file:', err1);
                return response.status(500).send('File save failed');
            }

            try {
                const image = {
                    file_name: fileName,
                    user_id: request.session.user._id,
                    date_time: timestamp,
                    comments: [],
                };
                Photo.create(image);
                return response.status(200).json({message: 'File uploaded successfully', fileName});
            } catch (error1) {
                return response.status(400).json('Could not save image to the table.');
            }
        });
        return response;
    });
});


/**
 * URL /commentsOfPhoto/:photo_id - Accepts a comment in the body and adds it to the database.
 */
app.post("/commentsOfPhoto/:photo_id", isAuthenticated, async function (request, response) {
    const photo_id = request.params.photo_id;
    const comment = request.body.comment;
    try {
        const newComment = {
            comment: comment,
            user_id: request.session.user._id,
            date_time: new Date(),
        };
        const result = await Photo.findByIdAndUpdate(
            photo_id,
            {$push: {comments: newComment}},
            {new: true}  // Return the updated document
        );

        if (!result) {
            return response.status(404).json('Photo not found');
        }
        return response.status(200).json({message: 'Comment added successfully', comment: comment});
    } catch (error) {
        console.error(error);
        return response.status(400).json('Something went wrong...');
    }
});


/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", isAuthenticated, async function (request, response) {
    const id = request.params.id;

    if (!Types.ObjectId.isValid(id)) {
        console.log(`Invalid ID format: ${id}`);
        return response.status(400).send(`Invalid ID format: ${id}`);
    }

    const objectId = new Types.ObjectId(id);
    const aggregationFunction = [
        {
            $match: {user_id: objectId}
        },
        {
            $unwind: {
                path: "$comments",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "comments.user_id",
                foreignField: "_id",
                as: "user_info"
            }
        },
        {
            $unwind: {
                path: "$user_info",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                "comments.user": {
                    $cond: {
                        if: {$ne: [{$type: "$user_info"}, "missing"]},
                        then: {
                            _id: "$user_info._id",
                            first_name: "$user_info.first_name",
                            last_name: "$user_info.last_name"
                        },
                        else: "$$REMOVE"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                file_name: {$first: "$file_name"},
                date_time: {$first: "$date_time"},
                user_id: {$first: "$user_id"},
                comments: {$push: "$comments"},
            }
        },
        {
            $addFields: {
                comments: {
                    $map: {
                        input: "$comments",
                        as: "comment",
                        in: {
                            _id: "$$comment._id",
                            date_time: "$$comment.date_time",
                            user: "$$comment.user",
                            comment: "$$comment.comment",
                            photo_id: "$$comment.photo_id",
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                comments: {
                    $filter: {
                        input: "$comments",
                        as: "comment",
                        cond: {$ne: ["$$comment", {}]}
                    }
                }
            }
        },
        {
            $sort: {_id: 1}
        }
    ];

    try {
        const photos = await Photo.aggregate(aggregationFunction);
        if (!photos) {
            console.log("Photos for user with _id: " + id + " not found.");
            return response.status(404).send("Photos not found");
        }
        return response.status(200).send(photos);
    } catch (error) {
        console.log("Error in /photosOfUser/:id:", error);
        return response.status(500).send({error: `An error occurred while fetching photos for user with _id: ${id}. Error: ${error.message}`});
    }
});

const server = app.listen(3000, function () {
    const port = server.address().port;
    console.log(
        "Listening at http://localhost:" +
        port +
        " exporting the directory " +
        __dirname
    );
});

/**
 * URL /photos/count - Returns the Photo counts for User.
 */
app.get("/photos/count", isAuthenticated, async function (request, response) {
    const aggregationFunction = [
        {
            $group: {
                _id: "$user_id",
                photo_count: {$sum: 1}
            }
        },
        {
            $project: {
                user_id: "$_id",
                photo_count: 1,
                _id: 0
            }
        },
        {
            $sort: {_id: 1}
        }
    ];
    try {
        const photoCounts = await Photo.aggregate(aggregationFunction);
        response.status(200).send(photoCounts);
    } catch (error) {
        response.status(500).send({error: "An error occurred while fetching photo count."});
    }
});

/**
 * URL /comments/count - Returns the Comment counts for User.
 */
app.get("/comments/count", isAuthenticated, async function (request, response) {
    const aggregationFunction = [
        {
            $unwind: {
                path: "$comments",
            }
        },
        {
            $group: {
                _id: "$comments.user_id",
                comment_count: {$sum: 1}
            }
        },
        {
            $project: {
                user_id: "$_id",
                comment_count: 1,
                _id: 0
            }
        },
        {
            $sort: {_id: 1}
        }
    ];
    try {
        const commentCounts = await Photo.aggregate(aggregationFunction);
        response.status(200).send(commentCounts);
    } catch (error) {
        response.status(500).send({error: "An error occurred while fetching comment count."});
    }
});

/**
 * URL /commentsOfUser/:id - Returns the Comment of each User (id).
 */
app.get("/commentsOfUser/:id", isAuthenticated, async function (request, response) {
    const id = request.params.id;

    if (!Types.ObjectId.isValid(id)) {
        console.log(`Invalid ID format: ${id}`);
        return response.status(400).send(`Invalid ID format: ${id}`);
    }

    const objectId = new Types.ObjectId(id);
    const aggregationFunction = [
        {
            $unwind: "$comments"
        },
        {
            $match: {"comments.user_id": objectId}
        },
        {
            $project: {
                _id: "$comments._id",
                photo_id: "$_id",
                photo_user_id: "$user_id",
                file_name: "$file_name",
                comment: "$comments.comment",
                date_time: "$comments.date_time"
            }
        },
        {
            $sort: {_id: 1}
        }
    ];

    try {
        const commentsOfUser = await Photo.aggregate(aggregationFunction);
        if (!commentsOfUser) {
            console.log("Comments for user with _id: " + id + " not found.");
            return response.status(404).send("Comments not found");
        }
        return response.status(200).send(commentsOfUser);
    } catch (error) {
        console.log("Error in /commentsOfUser/:id:", error);
        return response.status(500).send({error: `An error occurred while fetching comments for user with _id: ${id}. Error: ${error.message}`});
    }
});

/**
 * URL /photos/list - Returns the Photos of all Users.
 */
app.get("/photos/list", isAuthenticated, async function (request, response) {
    try {
        const photos = await Photo.find({}, {_id: 1, user_id: 1}).sort({_id: 1});
        if (!photos) {
            console.log("photos not found.");
            return response.status(404).send("photos not found");
        }
        return response.status(200).send(photos);
    } catch (error) {
        console.log("Error in /photos/list:", error);
        return response.status(500).send({error: `An error occurred while fetching photos. Error: ${error.message}`});
    }
});

//Function creates and regenerates user session
async function regenerateSession(request, response, user, next) {
    return request.session.regenerate(function (error) {
        if (error) {
            return next(error);
        }
        request.session.user = {_id: user._id, first_name: user.first_name, login_name: user.login_name};
        return request.session.save(function (err) {
            if (err) {
                return next(err);
            }
            return response.status(200).json({_id: user._id, first_name: user.first_name, login_name: user.login_name});
        });
    });
}

/**
 * URL /admin/login - Returns user session by logging them in.
 */
app.post('/admin/login', async function (request, response, next) {
    const {login_name, password} = request.body;
    try {
        const user = await User.findOne(
            {login_name: login_name},
            {password_digest: 1, salt: 1, first_name: 1, _id: 1}
        );

        if (!user || !doesPasswordMatch(user.password_digest, user.salt, password)) {
            return response.status(400).send('Invalid login_name or password');
        }
        return await regenerateSession(request, response, user, next);
    } catch (error) {
        return response.status(500).send('Internal server error');
    }
});

/**
 * URL /admin/logout - Destroys user session and logs them out.
 */
app.post('/admin/logout', async function (request, response) {
    if (request.session.user) {
        return request.session.destroy(() => response.sendStatus(200));
    } else {
        return response.status(400).send('No user is logged in');
    }
});

/**
 * URL /user - Registers the user and logs them in.
 */
app.post('/user', async function (request, response, next) {
    try {
        const passwordEntry = makePasswordEntry(request.body.password);

        const user = await User.create({
            login_name: request.body.login_name,
            password_digest: passwordEntry.hash,
            salt: passwordEntry.salt,
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            location: request.body.location,
            description: request.body.description,
            occupation: request.body.occupation,
        });

        if (!user) {
            return response.status(400).send('Failed to create user');
        }

        return await regenerateSession(request, response, user, next);
    } catch (error) {
        if (error.message.includes('duplicate key error')) {
            return response.status(400).send('login_name already exists');
        }
        return response.status(500).send('Internal server error');
    }
});

/**
 * URL /admin/check-session - Checks for the user session.
 */
app.get('/admin/check-session', async function (request, response) {
    if (request.session && request.session.user) {
        return response.sendStatus(200);
    } else {
        return response.sendStatus(401);
    }
});

