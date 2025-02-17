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
const path = require("path");
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

function checkUserPhotoAccess(user_id, photo) {
    return photo.access_list[0].includes("*") || photo.access_list.includes(user_id);
}


// Load the Mongoose schema for User, Photo, and SchemaInfo
const {Types} = require("mongoose");
const Activity = require("./schema/activity.js");
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
    return response.send("Simple web server of files from " + __dirname);
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
        return response.status(200).send(users);
    } catch (error) {
        return response.status(500).send({error: "An error occurred while fetching users."});
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
 * URL /commentsOfPhoto/:photo_id - Adds user comments for a photo and logs the activity.
 */
app.post("/commentsOfPhoto/:photo_id", isAuthenticated, async function (request, response) {
    const photo_id = request.params.photo_id;
    const comment = request.body.comment;
    const mentioned_users = request.body.mentioned_users;
    try {
        const transformedMentionedUsers = mentioned_users.map(user => ({
            id: new Types.ObjectId(user.id),
            display: user.display
        }));

        const newComment = {
            comment: comment,
            user_id: request.session.user._id,
            date_time: new Date(),
            mentioned_users: transformedMentionedUsers
        };

        const result = await Photo.findByIdAndUpdate(
            photo_id,
            {$push: {comments: newComment}},
            {new: true}
        );

        if (!result) {
            return response.status(404).json('Photo not found');
        }

        // Log the activity
        const activity = new Activity({
            user_id: request.session.user._id,
            activity_type: "comment-added",
            timestamp: new Date(),
            photo_id: photo_id,
            comment_id: result.comments[result.comments.length - 1]._id,
            comment_owner_id: result.comments[result.comments.length - 1].user_id
        });

        await activity.save();

        return response.status(200).json({
            message: 'Comment added successfully',
            comment: comment
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        return response.status(400).json('Something went wrong...');
    }
});

/**
 * URL /favouriteOfUser/:photo_id - Adds photo to users favourite list.
 */
app.post("/favouriteOfUser/:photo_id", isAuthenticated, async function (request, response) {
    const photo_id = request.params.photo_id;
    const user_id = request.session.user._id;

    try {
        const result = await User.findByIdAndUpdate(
            user_id,
            {$addToSet: {favourite_img_list: photo_id}},
            {new: true}
        );

        if (!result) {
            return response.status(404).json('User not found');
        }
        return response.status(200).json({message: 'Photo added successfully'});
    } catch (error) {
        console.error(error);
        return response.status(400).json('Something went wrong...');
    }
});


/**
 * URL /likePhoto/:photo_id - Adds photo to users like list. and increses the likes count
 */
app.post("/likePhoto/:photo_id", isAuthenticated, async function (request, response) {
    const photo_id = request.params.photo_id;
    const user_id = request.session.user._id;

    try {
        const result = await User.findByIdAndUpdate(
            user_id,
            {$addToSet: {liked_img_list: photo_id}},
            {new: true}
        );

        const result1 = await Photo.findByIdAndUpdate(
            photo_id,
            {$inc: {like_count: 1}},
            {new: true}
        );


        if (!result || !result1) {
            return response.status(404).json('User not found');
        }
        return response.status(200).json({message: 'Photo added successfully'});
    } catch (error) {
        console.error(error);
        return response.status(400).json('Something went wrong...');
    }
});


/**
 * URL /unlikePhoto/:photo_id - Adds photo to users like list. and increses the likes count
 */
app.post("/unlikePhoto/:photo_id", isAuthenticated, async function (request, response) {
    const photo_id = request.params.photo_id;
    const user_id = request.session.user._id;

    try {
        const result = await User.findByIdAndUpdate(
            user_id,
            {$pull: {liked_img_list: photo_id}},
            {new: true}
        );

        const result1 = await Photo.findByIdAndUpdate(
            photo_id,
            {$inc: {like_count: -1}},
            {new: true}
        );


        if (!result || !result1) {
            return response.status(404).json('User not found');
        }
        return response.status(200).json({message: 'Photo added successfully'});
    } catch (error) {
        console.error(error);
        return response.status(400).json('Something went wrong...');
    }
});


/**
 * URL /removeFavorite/:photo_id - Remove photo from users favourite list.
 */
app.post("/removeFavorite/:photo_id", isAuthenticated, async function (request, response) {
    const photo_id = request.params.photo_id;
    const user_id = request.session.user._id;

    try {
        const result = await User.findByIdAndUpdate(
            user_id,
            {$pull: {favourite_img_list: photo_id}},
            {new: true}
        );
        console.log(result);

        if (!result) {
            return response.status(404).json('User not found');
        }
        return response.status(200).json({message: 'Photo added successfully'});
    } catch (error) {
        console.error(error);
        return response.status(400).json('Something went wrong...');
    }
});


/**
 * URL /photos/new - Accepts an image file in the body. Adds photos and logs activity.
 */
app.post('/photos/new', isAuthenticated, async function (request, response) {
    processFormBody(request, response, async (err) => {
        if (err || !request.file) {
            console.error('File upload error:', err);
            return response.status(400).send('File upload failed');
        }
        const access_list = JSON.parse(request.body.access_list);

        // Validate file type and size
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(request.file.mimetype)) {
            return response.status(400).send('Invalid file type');
        }

        const timestamp = Date.now();
        const fileName = `U${timestamp}_${request.file.originalname}`;
        const filePath = './images/' + fileName;

        // Write the file to the "images" directory
        fs.writeFile(filePath, request.file.buffer, async (err1) => {
            if (err1) {
                console.error('Error saving file:', err1);
                return response.status(500).send('File save failed');
            }

            try {
                // Create the photo entry in the database
                const image = {
                    file_name: fileName,
                    user_id: request.session.user._id,
                    date_time: timestamp,
                    comments: [],
                    access_list: access_list,
                };

                const photo = await Photo.create(image);

                // Log the photo-upload activity
                const activity = new Activity({
                    user_id: request.session.user._id,
                    activity_type: "photo-upload",
                    timestamp: new Date(),
                    photo_id: photo._id,
                });

                await activity.save();

                return response.status(200).json({
                    message: 'File uploaded successfully',
                    fileName: fileName,
                });
            } catch (error1) {
                console.error('Error saving photo or logging activity:', error1);
                return response.status(400).json('Could not save image or log activity.');
            }
        });
        return response;
    });
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
                like_count: {$first: "$like_count"},
                comments: {$push: "$comments"},
                access_list: {$push: "$access_list"},
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
        let photos = await Photo.aggregate(aggregationFunction);
        photos = photos.filter((photo) => {
            return photo.access_list[0].includes("*") || photo.access_list[0].includes(request.session.user._id);
        });
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
        return response.status(200).send(photoCounts);
    } catch (error) {
        return response.status(500).send({error: "An error occurred while fetching photo count."});
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
        return response.status(200).send(commentCounts);
    } catch (error) {
        return response.status(500).send({error: "An error occurred while fetching comment count."});
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
                date_time: "$comments.date_time",
                access_list: "$access_list",
            }
        },
        {
            $sort: {_id: 1}
        }
    ];

    try {
        let commentsOfUser = await Photo.aggregate(aggregationFunction);
        if (!commentsOfUser) {
            console.log("Comments for user with _id: " + id + " not found.");
            return response.status(404).send("Comments not found");
        }

        // Filtering out photos where user dont have access to view it
        commentsOfUser = commentsOfUser.filter((photo) => checkUserPhotoAccess(request.session.user._id, photo));
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
        let photos = await Photo.find({}, {_id: 1, user_id: 1, access_list: 1}).sort({_id: 1});
        if (!photos) {
            console.log("photos not found.");
            return response.status(404).send("photos not found");
        }
        photos = photos.filter((photo) => checkUserPhotoAccess(request.session.user._id, photo));
        return response.status(200).send(photos);
    } catch (error) {
        console.log("Error in /photos/list:", error);
        return response.status(500).send({error: `An error occurred while fetching photos. Error: ${error.message}`});
    }
});

/**
 * URL /photos/list - Returns the Photos of given id.
 */
app.get("/photos/", isAuthenticated, async function (request, response) {
    try {
        const ids = request.query.ids;
        console.log(ids);
        const photos = await Photo.find({
            _id: {$in: ids}
        });
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
 * URL /admin/login - Returns user session by logging them in and logs login activity.
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
        try {
            const activity = new Activity({
                user_id: user._id,
                activity_type: "user-login",
                timestamp: new Date(),
            });

            await activity.save();
        } catch (error) {
            console.error('Error logging login activity:', error);
        }
        return await regenerateSession(request, response, user, next);
    } catch (error) {
        console.error('Error during login:', error);
        return response.status(500).send('Internal server error');
    }
});


/**
 * URL /admin/logout - Destroys user session, logs them out, and logs logout activity.
 */
app.post('/admin/logout', async function (request, response) {
    if (request.session.user) {
        const userId = request.session.user._id;
        // Destroy the session
        return request.session.destroy(async (err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return response.status(500).send("Failed to log out");
            }
            try {
                const activity = new Activity({
                    user_id: userId,
                    activity_type: "user-logout",
                    timestamp: new Date(),
                });
                await activity.save();
            } catch (error) {
                console.error("Error logging logout activity:", error);
            }
            return response.sendStatus(200);
        });
    } else {
        return response.status(400).send("No user is logged in");
    }
});


/**
 * URL /user - Registers the user, logs them in, and logs registration activity.
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

        try {
            const activity = new Activity({
                user_id: user._id,
                activity_type: "user-registered",
                timestamp: new Date(),
            });

            await activity.save();
        } catch (error) {
            console.error('Error logging registration activity:', error);
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

/**
 * URL: /latestPhotoOfUser/:id - Get the most recently uploaded photo for a specific user.
 */
app.get("/latestPhotoOfUser/:id", isAuthenticated, async (request, response) => {
    const id = request.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).send("Invalid or missing userId.");
    }

    try {
        const photosList
            = await Photo.find({user_id: id}, {_id: 1, file_name: 1, date_time: 1, user_id: 1, access_list: 1})
            .sort({_id: 1});

        if (!photosList || photosList.length === 0) {
            return response.status(404).send("No photos found for the specified user.");
        }

        const sortedPhotos = [...photosList].sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
        const recentPhoto = sortedPhotos[0];
        const photoIndex = photosList.findIndex(photo => photo._id.toString() === recentPhoto._id.toString());
        if (!checkUserPhotoAccess(request.session.user._id, recentPhoto)) {
            return response.send({
                _id: -1,
                user_id: -1,
            });
        }

        return response.send({
            _id: recentPhoto._id,
            user_id: recentPhoto.user_id,
            file_name: recentPhoto.file_name,
            date_time: recentPhoto.date_time,
            photo_index: photoIndex
        });
    } catch (err) {
        console.error("Error fetching most recent photo for user:", err);
        return response.status(500).send("An error occurred while fetching the recent photo.");
    }
});

/**
 * URL: /mostCommentedPhotoOfUser/:id - Get the photo with the most comments for a specific user.
 */
app.get("/mostCommentedPhotoOfUser/:id", isAuthenticated, async (request, response) => {
    const id = request.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).send("Invalid or missing userId.");
    }

    try {
        const photosList
            = await Photo.find({user_id: id})
            .sort({_id: 1});

        if (!photosList || photosList.length === 0) {
            return response.status(404).send("No photos found for the specified user.");
        }

        let mostCommentedPhoto = null;
        let maxComments = 0;
        let photoIndex = -1;

        photosList.forEach((photo, index) => {
            const commentCount = photo.comments ? photo.comments.length : 0;
            if (commentCount > maxComments) {
                mostCommentedPhoto = photo;
                maxComments = commentCount;
                photoIndex = index;
            }
        });

        if (!mostCommentedPhoto) {
            return response.status(404).send("No comments found on any photos for the specified user.");
        }

        if (!checkUserPhotoAccess(request.session.user._id, mostCommentedPhoto)) {
            return response.send({
                _id: -1,
                user_id: -1,
            });
        }

        return response.send({
            _id: mostCommentedPhoto._id,
            file_name: mostCommentedPhoto.file_name,
            comment_count: maxComments,
            user_id: mostCommentedPhoto.user_id,
            date_time: mostCommentedPhoto.date_time,
            photo_index: photoIndex
        });
    } catch (err) {
        console.error("Error fetching most commented photo for user:", err);
        return response.status(500).send("An error occurred while fetching the most commented photo.");
    }
});

/**
 * URL: /photosOfUser/:id - Delete selected photo of user.
 */
app.delete("/photosOfUser/:id", isAuthenticated, async (request, response) => {
    const {id} = request.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).send("Invalid or missing photo ID.");
    }

    try {
        // Find the photo to retrieve its file path
        const photo = await Photo.findById(id);
        if (!photo) {
            return response.status(404).send("Photo not found.");
        }

        // Delete the photo record from the database
        const result = await Photo.deleteOne({_id: id});
        if (result.deletedCount === 0) {
            return response.status(404).send("Photo not found in database.");
        }

        // Step 3: Remove associated activity entries
        const activityDeleteResult = await Activity.deleteMany({activity_type: "photo-upload", photo_id: id});
        console.log(`Deleted ${activityDeleteResult.deletedCount} activity records for photo ID: ${id}.`);

        // Step 4: Construct the file path and delete the file from the directory
        const filePath = path.join(__dirname, "images", photo.file_name);
        return fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
                return response.status(500).send("Photo record deleted, but file removal failed.");
            }

            return response.status(200).send("Photo, file, and related activities successfully deleted.");
        });
    } catch (err) {
        console.error("Error deleting photo:", err);
        return response.status(500).send("An error occurred while deleting the photo.");
    }
});

/**
 * URL: /commentOfUser/:id - Delete selected comment of user.
 */
app.delete("/commentOfUser/:id", isAuthenticated, async (request, response) => {
    const {id} = request.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).send("Invalid or missing comment ID.");
    }

    try {
        // Step 1: Find the photo containing the comment and remove the comment
        const photo = await Photo.findOneAndUpdate(
            {"comments._id": id},
            {$pull: {comments: {_id: id}}},
            {new: true}
        );

        if (!photo) {
            return response.status(404).send("Comment not found.");
        }

        // Step 2: Remove associated activity entries
        const activityDeleteResult = await Activity.deleteMany({
            activity_type: "comment-added",
            comment_id: id
        });

        console.log(`Deleted ${activityDeleteResult.deletedCount} activity records for comment ID: ${id}.`);

        return response.status(200).send("Comment deleted successfully.");
    } catch (err) {
        console.error("Error deleting comment:", err);
        return response.status(500).send("An error occurred while deleting the comment.");
    }
});

app.delete("/user/:id", isAuthenticated, async (request, response) => {
    const id = request.params.id;
    if (!Types.ObjectId.isValid(id)) {
        console.log(`Invalid UserId format: ${id}`);
        return response.status(400).send(`Invalid UserId: ${id}`);
    }

    const objectId = new Types.ObjectId(id);

    try {
        // Step 1: Find the user and check if they exist
        const user = await User.findById(objectId);
        if (!user) {
            console.log(`User with _id: ${id} not found.`);
            return response.status(404).send(`User with _id: ${id} not found.`);
        }

        // Step 2: Remove user's comments from photos
        const commentsDeleteResult = await Photo.updateMany(
            {"comments.user_id": objectId},
            {$pull: {comments: {user_id: objectId}}},
            {multi: true}
        );
        console.log(`Removed user comments from ${commentsDeleteResult.modifiedCount} photos.`);

        const mentionedUsersDeleteResult = await Photo.updateMany(
            {"comments.mentioned_users.id": objectId},
            {$pull: {comments: {"mentioned_users.id": objectId}}}
        );
        console.log(`Removed ${mentionedUsersDeleteResult.modifiedCount} comments mentioning the user.`);

        // Step 3: Find user's photos before deletion (needed for file deletion)
        const userPhotos = await Photo.find({user_id: objectId});

        // Step 4: Delete photos from database
        const photosDeleteResult = await Photo.deleteMany({user_id: objectId});
        console.log(`Deleted ${photosDeleteResult.deletedCount} photos of user with _id: ${id}.`);

        // Step 5: Delete the user from the database
        await User.findByIdAndDelete(objectId);
        console.log(`User with _id: ${id} deleted successfully.`);

        // Step 6: Delete physical files associated with the user's photos
        for (const photo of userPhotos) {
            const filePath = path.join(__dirname, "images", photo.file_name);
            try {
                fs.unlinkSync(filePath); // Delete the file synchronously
                console.log(`Deleted file: ${filePath}`);
            } catch (err) {
                console.error(`Failed to delete file: ${filePath}`, err);
                // Log the error but do not stop the process
            }
        }

        // Step 7: Remove activity entries for the user
        const activitiesDeleteResult = await Activity.deleteMany({user_id: objectId});
        console.log(`Deleted ${activitiesDeleteResult.deletedCount} activity records for user with _id: ${id}.`);

        return response.status(200).send("User account deleted successfully. You have been logged out.");
    } catch (error) {
        console.log("Error in DELETE /user/:id:", error);
        return response.status(500).send(`An error occurred while deleting the account. ${error.message}`);
    }
});

app.get("/photosWithMentions/:userId", isAuthenticated, async (request, response) => {
    const userId = request.params.userId;

    // Ensure that the userId is valid
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return response.status(400).send("Invalid or missing userId.");
    }

    try {
        // Step 1: Use aggregation to group photos by user_id and sort by photo_id
        const photosGrouped = await Photo.aggregate([
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
                        access_list: {$push: "$access_list"},
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
                                    mentioned_users: "$$comment.mentioned_users",
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
                },
                {
                    $group: {
                        _id: "$user_id",
                        photos: {
                            $push: {
                                _id: "$_id",
                                file_name: "$file_name",
                                comments: "$comments",
                                user_id: "$user_id",
                                date_time: "$date_time",
                                access_list: "$access_list",
                            }
                        }
                    }
                },
                {
                    $sort: {_id: 1}
                },
                {
                    $project: {
                        _id: 0,
                        user_id: "$_id",
                        photos: 1
                    }
                }
            ]
        );

        if (!photosGrouped || photosGrouped.length === 0) {
            return response.status(404).send("No photos found for the specified user.");
        }

        // Step 2: Filter photos for mentions of the specified user
        let mentions = [];

        photosGrouped.forEach(group => {
            group.photos.forEach((photo, index) => {
                // Check if the user is mentioned in the comments
                photo.comments.forEach(comment => {
                    const hasMention = comment.mentioned_users && comment.mentioned_users.some(user => user.id.toString() === userId);
                    if (hasMention) {
                        mentions.push({
                            photo_index: index,
                            file_name: photo.file_name,
                            user_id: photo.user_id,
                            comment: comment,
                            mentioned_user: userId,
                            date_time: photo.date_time,
                            access_list: photo.access_list,
                        });
                    }
                });
            });
        });

        // Filter out images where user does not have access to view
        mentions = mentions.filter((mention) => {
            return mention.access_list[0].includes("*") ||
                mention.access_list[0].includes(request.session.user._id);
        });

        return response.send({mentions});

    } catch (err) {
        console.error("Error fetching photos with mentions:", err);
        return response.status(500).send("An error occurred while fetching photos with mentions.");
    }
});

/**
 * URL: /activities - Retrieve the 5 most recent activities in reverse chronological order.
 */
app.get("/activities", isAuthenticated, async (request, response) => {
    try {
        // Fetch the 5 most recent activities, sorted by timestamp in descending order
        const activities = await Activity.find({})
            .sort({timestamp: -1})
            .limit(5)
            .exec();

        // Map activities to include specific details based on activity type
        const formattedActivities = await Promise.all(
            activities.map(async (activity) => {
                const baseActivity = {
                    _id: activity._id,
                    user_id: activity.user_id,
                    timestamp: activity.timestamp,
                    type: activity.activity_type,
                    photo_id: activity.photo_id,
                    comment_owner_id: activity.comment_owner_id,
                };

                // Fetch user details
                const user = await User.findById(new Types.ObjectId(activity.user_id));

                if (!user) {
                    console.warn(`User not found for user_id: ${activity.user_id}`);
                    return baseActivity;
                }

                // Fetch additional details based on activity type
                if (activity.activity_type === "photo-upload") {
                    const photo = await Photo.findById(new Types.ObjectId(activity.photo_id));
                    if (photo) {
                        baseActivity.file_name = photo.file_name;
                        baseActivity.first_name = user.first_name;
                        baseActivity.last_name = user.last_name;
                    }
                } else if (activity.activity_type === "comment-added") {
                    const photo = await Photo.findById(new Types.ObjectId(activity.photo_id));
                    if (photo) {
                        const comment = photo.comments.id(new Types.ObjectId(activity.comment_id));
                        if (comment) {
                            const commentOwner = await User.findById(new Types.ObjectId(photo.user_id));
                            baseActivity.file_name = photo.file_name;
                            baseActivity.first_name = user.first_name;
                            baseActivity.last_name = user.last_name;
                            baseActivity.comment = comment.comment;
                            baseActivity.photo_owner_first_name = commentOwner?.first_name || "Unknown";
                            baseActivity.photo_owner_last_name = commentOwner?.last_name || "Unknown";
                        }
                    }
                } else if (
                    activity.activity_type === "user-registered" ||
                    activity.activity_type === "user-login" ||
                    activity.activity_type === "user-logout"
                ) {
                    baseActivity.first_name = user.first_name;
                    baseActivity.last_name = user.last_name;
                }

                return baseActivity;
            })
        );

        return response.status(200).json(formattedActivities);
    } catch (err) {
        console.error("Error fetching activities:", err);
        return response.status(500).send("An error occurred while retrieving activities.");
    }
});


app.get("/activity/users", isAuthenticated, async (request, response) => {
    try {

        const users = await User.find({}, {first_name: 1, last_name: 1, _id: 1}).sort({_id: 1});


        // Fetch the most recent activity of the user, sorted by timestamp in descending order
        const activities = await Promise.all(
            users.map(async (user) => {
                const user_id = user._id;
                const latestActivity = await Activity.findOne({user_id: user_id})
                    .sort({timestamp: -1}) // Sort by timestamp in descending order
                    .limit(1); // Fetch only the latest entry
                if (latestActivity && latestActivity.activity_type === "photo-upload") {

                    const photo = await Photo.findById(new Types.ObjectId(latestActivity.photo_id));
                    if (!checkUserPhotoAccess(request.session.user._id, photo)) {
                        return null;
                    }
                    if (photo) {
                        const latestActivityObject = latestActivity.toObject();
                        latestActivityObject.file_name = photo.file_name;
                        return latestActivityObject;
                    }
                    console.log(photo);
                    console.log(latestActivity);
                }
                return latestActivity; // Return the result for Promise.all to collect
            })
        );

        const userActivities = {};
        activities.map(
            (activity) => {
                if (activity) {
                    userActivities[activity.user_id] = activity;
                }
                return activity;
            }
        );

        return response.status(200).json(userActivities);

    } catch (err) {
        console.error("Error fetching activities:", err);
        return response.status(500).send("An error occurred while retrieving activities.");
    }
});

