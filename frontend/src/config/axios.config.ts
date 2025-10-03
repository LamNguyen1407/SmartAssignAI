import axios from "axios";


const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json'
    }
})


export default axiosClient;