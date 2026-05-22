import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    fileTree: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

projectSchema.index({ name: 1, owner: 1 }, { unique: true });

const Project = mongoose.model("project", projectSchema);

export default Project;
