import { body, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const createProjectValidator = [
  body("name").isString().withMessage("Name is required"),
  validate,
];

export const addUserProjectValidator = [
  body("projectId")
    .isString()
    .withMessage("Project ID is required"),

  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of string")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be string"),

    validate
];

export const fileTreeValidator = [
  body("projectId")
    .isString()
    .withMessage("projectId must be a string")
    .notEmpty()
    .withMessage("projectId is required"),

  body("fileTree")
    .isObject()
    .withMessage("fileTree must be an object")
    .custom((val) => {
      // Reject null — isObject() passes for null in some versions
      if (val === null) throw new Error("fileTree cannot be null");
      // Reject empty object only at the route level — allow {} for new projects
      // (empty is valid — user deleted all files)
      return true;
    }),

  validate,
];
