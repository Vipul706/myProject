import { Schema } from "mongoose";

const experienceSchema = new Schema({
    name: { type: String, required: true },
    duration: { type: String, required: true },
    position: { type: String, required: true },
    pointers: [{ type: String }]
});

const educationSchema = new Schema({
    duration: { type: String, required: true },
    name: { type: String, required: true },
    program: { type: String, required: true },
    cgpa: { type: String, required: true }
});

const cvDataSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "UserVault",
        required: true
    },
    exp: [experienceSchema],
    skills: [{ type: String }],
    education: [educationSchema],
    languages: [{ type: String }]
}, {
    timestamps: true,
    collection: "DeepResume"
});


export const modelName = "DeepResume";
export const schema = cvDataSchema;
