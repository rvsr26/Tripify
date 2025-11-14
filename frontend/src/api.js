import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/_/backend/api')
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  login:       (email, password)       => api.post('/auth/login',    { email, password }).then(r => r.data),
  register:    (name, email, password) => api.post('/auth/register', { name, email, password }).then(r => r.data),
  googleLogin: (credential)            => api.post('/auth/google',   { credential }).then(res => res.data),
  me:          ()                      => api.get('/auth/me').then(r => r.data),
};

export const plannerService = {
  // New AI flow
  generateOptions:  (prompt)                            => api.post('/planner/options',        { prompt }).then(r => r.data),
  selectPlan:       (optionKey, optionData, parsedData, naturalPrompt) =>
                    api.post('/planner/select', { optionKey, optionData, parsedData, naturalPrompt }).then(r => r.data),
  chatWithTrip:     (id, message)                       => api.post(`/planner/${id}/chat`,     { message }).then(r => r.data),
  generatePacking:  (id)                                => api.post(`/planner/${id}/packing`).then(r => r.data),
  getSafetyInfo:    (id)                                => api.get(`/planner/${id}/safety`).then(r => r.data),
  addExpense:       (id, data)                          => api.post(`/planner/${id}/expenses`, data).then(r => r.data),
  getDestinationReviews: (id)                           => api.get(`/planner/${id}/reviews`).then(r => r.data),
  updateTrip:       (id, data)                          => api.patch(`/planner/${id}`,          data).then(r => r.data),
  
  // Collaborative features
  updateSettings:   (id, data)                          => api.patch(`/planner/${id}/settings`, data).then(r => r.data),
  joinByToken:      (token)                             => api.post(`/planner/join/${token}`).then(r => r.data),
  requestJoin:      (id, message)                       => api.post(`/planner/${id}/join-request`, { message }).then(r => r.data),
  handleJoinRequest:(id, userId, status)                => api.patch(`/planner/${id}/join-requests/${userId}`, { status }).then(r => r.data),
  removeMember:     (id, userId)                        => api.delete(`/planner/${id}/members/${userId}`).then(r => r.data),

  // CRUD
  planTrip:         (city, days, budget, interests)     => api.post('/planner',                 { city, days, budget, interests }).then(r => r.data),
  getMyTrips:       ()                                  => api.get('/planner').then(r => r.data),
  getTripById:      (id)                                => api.get(`/planner/${id}`).then(r => r.data),
  deleteTrip:       (id)                                => api.delete(`/planner/${id}`).then(r => r.data),
  backfillCoords:   ()                                  => api.post('/planner/backfill-coords').then(r => r.data),
};

export const tripPlanService = {
  getById: (id) => api.get(`/planner/${id}`).then(r => r.data),
  update:  (id, data) => api.patch(`/planner/${id}`, data).then(r => r.data),
};

export const friendsService = {
  sendRequest:      (username)    => api.post('/friends/request', { username }).then(r => r.data),
  getIncoming:      ()            => api.get('/friends/requests').then(r => r.data),
  getOutgoing:      ()            => api.get('/friends/requests/sent').then(r => r.data),
  getFriends:       ()            => api.get('/friends').then(r => r.data),
  getPendingCount:  ()            => api.get('/friends/count').then(r => r.data),
  acceptRequest:    (id)          => api.patch(`/friends/${id}/accept`).then(r => r.data),
  declineRequest:   (id)          => api.patch(`/friends/${id}/decline`).then(r => r.data),
  cancelRequest:    (id)          => api.delete(`/friends/${id}/cancel`).then(r => r.data),
  removeFriend:     (id)          => api.delete(`/friends/${id}`).then(r => r.data),
};

export const userService = {
  search:           (q)           => api.get('/users/search', { params: { q } }).then(r => r.data),
  getProfile:       (id)          => api.get(`/users/${id}`).then(r => r.data),
};

export const socialService = {
  getFeed:  (search = '', city = '') => api.get('/social/feed', { params: { search, city } }).then(r => r.data),
  likeTrip: (id)                     => api.post(`/social/${id}/like`).then(r => r.data),
};

export const reviewService = {
  getReviews: (placeId, dataId)           => api.get(`/reviews/${placeId}`, { params: { dataId } }).then(r => r.data),
  addReview:  (placeId, rating, review)   => api.post('/reviews', { placeId, rating, review }).then(r => r.data),
};

export const communityService = {
  create:     (data)               => api.post('/communities', data).then(r => r.data),
  list:       (search = '', category = '') => api.get('/communities', { params: { search, category } }).then(r => r.data),
  mine:       ()                   => api.get('/communities/mine').then(r => r.data),
  get:        (id)                 => api.get(`/communities/${id}`).then(r => r.data),
  join:       (id)                 => api.post(`/communities/${id}/join`).then(r => r.data),
  leave:      (id)                 => api.post(`/communities/${id}/leave`).then(r => r.data),
  delete:     (id)                 => api.delete(`/communities/${id}`).then(r => r.data),
  createPost: (id, content)        => api.post(`/communities/${id}/posts`, { content }).then(r => r.data),
  likePost:   (id, postId)         => api.post(`/communities/${id}/posts/${postId}/like`).then(r => r.data),
};

export const featuresService = {
  // Quiz
  submitQuiz:      (answers)                => api.post('/features/quiz', { answers }).then(r => r.data),
  // Stats
  getStats:        ()                       => api.get('/features/stats').then(r => r.data),
  // Expenses
  addExpense:      (id, data)               => api.post(`/features/trips/${id}/expenses`, data).then(r => r.data),
  getSettlements:  (id)                     => api.get(`/features/trips/${id}/settlements`).then(r => r.data),
  // Bucket List
  getBucketList:   ()                       => api.get('/features/bucket-list').then(r => r.data),
  addBucketItem:   (data)                   => api.post('/features/bucket-list', data).then(r => r.data),
  updateBucketItem:(itemId, data)           => api.patch(`/features/bucket-list/${itemId}`, data).then(r => r.data),
  removeBucketItem:(itemId)                 => api.delete(`/features/bucket-list/${itemId}`).then(r => r.data),
  // Stories
  createStory:     (data)                   => api.post('/features/stories', data).then(r => r.data),
  getStories:      ()                       => api.get('/features/stories').then(r => r.data),
  getStory:        (id)                     => api.get(`/features/stories/${id}`).then(r => r.data),
  likeStory:       (id)                     => api.post(`/features/stories/${id}/like`).then(r => r.data),
  generateCaptions:(data)                   => api.post('/features/stories/captions', data).then(r => r.data),
  // Journal
  getJournal:      (tripId)                 => api.get(`/features/journal/${tripId}`).then(r => r.data),
  addJournalEntry: (tripId, data)           => api.post(`/features/journal/${tripId}`, data).then(r => r.data),
  // Chatbot
  sendChatbotMsg:  (message, context)       => api.post('/features/chatbot', { message, context }).then(r => r.data),
  // Templates
  getTemplates:    (params)                 => api.get('/features/templates', { params }).then(r => r.data),
  publishTemplate: (id)                     => api.post(`/features/templates/${id}/publish`).then(r => r.data),
  cloneTemplate:   (id)                     => api.post(`/features/templates/${id}/clone`).then(r => r.data),
  // Matchmaker
  getMatches:      ()                       => api.get('/features/matchmaker').then(r => r.data),
  // Weather
  getWeather:      (city)                   => api.get('/features/weather', { params: { city } }).then(r => r.data),
  // Deals
  getDeals:        ()                       => api.get('/features/deals').then(r => r.data),
};

export const experienceService = {
  getExperiences: (city = '') => api.get('/experiences', { params: { city } }).then(r => r.data),
  createExperience: (data) => api.post('/experiences', data).then(r => r.data),
};

export const uploadService = {
  /**
   * Upload a File/Blob to Cloudinary via the Tripify backend.
   * @param {File} file  - A browser File object (from <input type="file">)
   * @param {Function} [onProgress] - (percent: number) => void
   * @returns {Promise<{ url: string, publicId: string, width: number, height: number, format: string }>}
   */
  uploadImage: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)); }
        : undefined,
    }).then(r => r.data);
  },
};

export default api;

