import { useState } from "react";
import * as projectApi from "../services/project.api";

export const useProject = () => {
    const [loading, setLoading] = useState(false);

    const createProject = async (name) => {
        setLoading(true);
        try {
            return await projectApi.createProject({ name });
        } finally {
            setLoading(false);
        }
    };

    const getAllProjects = async () => {
        setLoading(true);
        try {
            return await projectApi.getAllProjects();
        } finally {
            setLoading(false);
        }
    };

    const getProject = async (projectId) => {
        setLoading(true);
        try {
            return await projectApi.getProject(projectId);
        } finally {
            setLoading(false);
        }
    };

    const updateFileTree = async (projectId, fileTree) => {
        setLoading(true);
        try {
            return await projectApi.updateFileTree({ projectId, fileTree });
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (projectId, users) => {
        setLoading(true);
        try {
            return await projectApi.addUser({ projectId, users });
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createProject,
        getAllProjects,
        getProject,
        updateFileTree,
        addUser,
    };
};
