export { api as default, apiError } from './lib/apiClient'
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export default api;
