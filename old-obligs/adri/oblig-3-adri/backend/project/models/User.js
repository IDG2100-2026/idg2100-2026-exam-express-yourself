import mongoose from "mongoose";
//schema for a User document. we then create a model(class) from the schema.
//schema = blueprint, incoming data must resemble this blueprint.
//model = a class derived from the blueprint.

//The schema defines the shape of the document, all possible fields that can ever exist on it. Whether they're populated at creation time or later is a separate concern.
//we use "schema options" or "validators" om Mongoose. required, unique, default, enum etc are all built in words that mongoose looks for and reacts to.


//first we create a schema, this is how. the method below accepts an object, this object will be the blueprint of the document (a row in the db)
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 1,
        maxlength: 20,
        required: true,
        unique: true,
        immutable: true //username can not be updated
    },
    email: {
        type: String,
        lowercase: true, //Mongoose automatically converts the value to lowercase before saving to db, so same email can not register twice when typing them in different combinations with small and big letters
        required: true,
        unique: true,
        match: /.+@.+\..+/ //email format checl: something@something.something
    },
    password: {
        type: String,
        minlength: 4,
        required: true
    },
    dateOfBirth: {
        type: Date, //better than a fixed age property that needs yearly update to stay factual
        required: true
    },
    elo: {
        type: Number,
        default: 1000 //users do not set this themselves, thats why it defaults to 1000 to everyone
    },
    role: {
        type: String,
        enum: ["user", "admin"], //restricts role to only these values
        default: "user" //every registration defaults to user, an admin has to manually change a regular user to an admin
    },
    trophies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trophy"
        }
    ],
    banned: {
        type: Boolean,
        default: false //users are not banned by default
    },
    aboutMe: {
        type: String,
        default: "",
        maxlength: 200
    },
    appearance: {
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light"
        },
        boardColor: {
            type: String,
            default: "white"
        },
        sound: {
            type: Boolean,
            default: true
        },
        lobbyCount: {
            type: Number,
            default: 5
        }
    }
}, { timestamps: true }); //automatically adds date created and last updated fields to the document, can come in handy

//now whats left to do is to create a model(class) of the schema. The first argument is the name of the model, the second is the schema itself.
const User = mongoose.model("User", userSchema, "users");
//class name, reference to schema, name of collection

export default User;

//add MongoDB config file that handles the connection, then export and import to index.js