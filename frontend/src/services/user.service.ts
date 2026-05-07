import axiosClient from "@/config/axios.config";

export const getAllUser = async () => {
  return await axiosClient.get("/user/allUser").then((res) => res.data);
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  username: string;
  phoneNumber?: string;
  role: string;
  gender: string;
  dateOfBirth?: Date;
}) => {
  return await axiosClient.post("/user", data).then((res) => res.data);
};

export const editUser = async (data: {
  id: string;
  name: string;
  email: string;
  password: string;
  username: string;
  phoneNumber?: string;
  role: string;
  gender: string;
  dateOfBirth?: Date;
}) => {
  return await axiosClient.patch("/user", data).then((res) => res.data);
};

export const deleteUser = async (data: { id: string }) => {
  return await axiosClient.delete("/user", { data }).then((res) => res.data);
}