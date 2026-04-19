import axiosClient from "@/config/axios.config";
import axios from "axios";

export const fetchCourses = async () => {
  return await axiosClient.get("/course").then((res) => res.data);
};

export const getCourseWithFiles = async () => {
  const res = await axiosClient.get('/course/getCourseWithFiles');
  return res.data;
}

export const uploadFile = async (data: { userID: any; courseId: any, file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('userID', data.userID);
  formData.append('courseId', data.courseId);
  const res = await axios.post('http://localhost:3001/chat/semantic-chunk', formData);
  return res.data
}

export const deleteFile = async (data: { id: string }) => {
  const res = await axiosClient.delete('/course/file', { params: { id: data.id } });
  return res.data;
}