import env from '../env';
import axios, { AxiosRequestConfig } from 'axios';

const config: AxiosRequestConfig = {
  baseURL: env.authServerUrl,
  auth: {
    username: env.authServerUser,
    password: env.authServerPassword,
  },
};

export default axios.create(config);
