import axiosInstance from "../config/axios";

export async function createProject({ name }) {
    const { data } = await axiosInstance.post("/projects/create", { name });
    return data;
}

export async function getAllProjects() {
    const { data } = await axiosInstance.get("/projects/all");
    return data;
}

export async function getProject(projectId) {
    const { data } = await axiosInstance.get(`/projects/get-project/${projectId}`);
    return data;
}

export async function updateFileTree({ projectId, fileTree }) {
    const { data } = await axiosInstance.put("/projects/update-file-tree", {
        projectId,
        fileTree,
    });
    return data;
}

export async function addUser({ projectId, users }) {
    const { data } = await axiosInstance.put("/projects/add-user", {
        projectId,
        users,
    });
    return data;
}
