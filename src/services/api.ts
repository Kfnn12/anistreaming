import axios from 'axios';

const BASE_API_URL = 'https://hello-lyart-gamma.vercel.app';

export const api = axios.create({
  baseURL: BASE_API_URL,
});

export const getHomeInfo = async () => {
  const res = await api.get('/api');
  return res.data;
};

export const searchAnime = async (keyword: string, page: number = 1) => {
  const res = await api.get(`/api/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  return res.data;
};

export const getAnimeInfo = async (id: string) => {
  const res = await api.get(`/api/info?id=${encodeURIComponent(id)}`);
  return res.data;
};

export const getEpisodes = async (id: string) => {
  const res = await api.get(`/api/episodes/${encodeURIComponent(id)}`);
  return res.data;
};

export const getStreamInfo = async (episodeId: string, server: string = 'hd-1', type: string = 'sub') => {
  const res = await api.get(`/api/stream?id=${encodeURIComponent(episodeId)}&server=${server}&type=${type}`);
  return res.data;
};

export const getTrending = async (page: number = 1) => {
  const res = await api.get(`/api/top-airing?page=${page}`);
  return res.data;
};

export const getRecentlyUpdated = async (page: number = 1) => {
  const res = await api.get(`/api/recently-updated?page=${page}`);
  return res.data;
};
