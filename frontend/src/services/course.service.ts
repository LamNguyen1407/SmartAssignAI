import axiosClient from "@/config/axios.config";

export const fetchCourses = async () => {
  return await axiosClient.get("/course").then((res) => res.data);
};
