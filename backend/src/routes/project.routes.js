import { Router } from "express";
import { body } from "express-validator";
import * as authMiddleWare from "../middleware/auth.middleware.js";
import * as projectController from "../controllers/project.controller.js";
import * as projectValidators from "../validators/project.validator.js";

const router = Router();

router.post(
  "/create",
  authMiddleWare.authUser,
  projectValidators.createProjectValidator,
  projectController.createProject,
);

router.get("/all", authMiddleWare.authUser, projectController.getAllProject);

router.put(
  "/add-user",
  authMiddleWare.authUser,
  projectValidators.addUserProjectValidator,
  projectController.addUserProject,
);

router.get(
  "/get-project/:projectId",
  authMiddleWare.authUser,
  projectController.getProjectById,
);

router.put(
  "/update-file-tree",
  authMiddleWare.authUser,
  projectValidators.fileTreeValidator,
  projectController.updateFileTree,
);

export default router;
