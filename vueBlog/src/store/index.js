import { createStore } from 'vuex';
import firebase from 'firebase/app';
import 'firebase/auth';
import db from '../firebase/firebaseInit';

export default createStore({
  state: {
    blogPosts: [],
    postLoaded: null,
    editPost: null,
    user: null,
    profileEmail: null,
    profileFirstName: null,
    profileLastName: null,
    profileUsername: null,
    profileId: null,
    profileInitials: null,
    blogHTML: 'Write your blog title here...',
    blogTitle: '',
    blogPhotoName: '',
    blogPhotoFileURL: null,
    blogPhotoPreview: null,
  },
  getters: {
    blogPostsFeed(state) {
      return state.blogPosts.slice(0, 2);
    },
    blogPostsCards(state) {
      return state.blogPosts.slice(2, 6);
    },
  },
  mutations: {
    newBlogPost(state, payload) {
      state.blogHTML = payload;
    },
    updateBlogTitle(state, payload) {
      state.blogTitle = payload;
    },
    fileNameChange(state, payload) {
      state.blogPhotoName = payload; 
    },
    createFileURL(state, payload) {
      state.blogPhotoFileURL = payload;
    },
    openPhotoPreview(state) {
      state.blogPhotoPreview = !state.blogPhotoPreview;
    },
    toggleEditPost(state, payload) {
      state.editPost = payload;
      console.log(payload);
    },
    updateUser(state, payload) {
      state.user = payload;
    },
    setProfileInfo(state, firebaseRes) {
      state.profileId = firebaseRes.id;
      state.profileEmail = firebaseRes.data().email;
      state.profileFirstName = firebaseRes.data().firstName;
      state.profileLastName = firebaseRes.data().lastName;
      state.profileUsername = firebaseRes.data().username;
    },
    setProfileInitials(state) {
      state.profileInitials =
        state.profileFirstName.match(/(\b\S)?/g).join('') +
        state.profileLastName.match(/(\b\S)?/g).join('');

      console.log(
        state.profileFirstName.match(/(\b\S)?/g).join('') +
          state.profileLastName.match(/(\b\S)?/g).join('')
      );
    },
    changeFirstName(state, payload) {
      state.profileFirstName = payload;
    },
    changeLastName(state, payload) {
      state.profileLastName = payload;
    },
    changeUserName(state, payload) {
      state.profileUsername = payload;
    },
    filterBlogPost(state, payload) {
      state.blogPosts = state.blogPosts.filter(
        (post) => post.blogID !== payload
      );
    },
    setBlogState(state, payload) {
      state.blogTitle = payload.blogTitle;
      state.blogHTML = payload.blogHTML;
      state.blogPhotoFileURL = payload.blogCoverPhoto;
      state.blogPhotoName = payload.blogCoverPhotoName;
    },
  },
  actions: {
    async getCurrentUser({ commit }) {
      const dataBase = await db
        .collection('users')
        .doc(firebase.auth().currentUser.uid);
      const dbResults = await dataBase.get();
      commit('setProfileInfo', dbResults);
      commit('setProfileInitials');
      console.log(dbResults);
    },
    async updateUserSettings({ commit, state }) {
      const dataBase = await db.collection('users').doc(state.profileId);
      await dataBase.update({
        firstName: state.profileFirstName,
        lastName: state.profileLastName,
        username: state.profileUsername,
      });
      commit('setProfileInitials');
    },
    async getPost({ state }) {
      const dataBase = await db
        .collection('blogPosts')
        .orderBy('date', 'desc');
      const dbResults = await dataBase.get();
      dbResults.forEach((doc) => {
        if (!state.blogPosts.some((post) => post.blogID === doc.id)) {
          const data = {
            blogID: doc.data().blogID,
            blogHTML: doc.data().blogHTML,
            blogCoverPhoto: doc.data().blogCoverPhoto,
            blogTitle: doc.data().blogTitle,
            blogDate: doc.data().date,
            blogCoverPhotoName: doc.data().blogCoverPhotoName,
          };
          state.blogPosts.push(data);
        }
      });
      state.postLoaded = true;
      console.log(state.blogPosts);
    },
    async updatePost({ commit, dispatch }, payload) {
      commit('filterBlogPost', payload);
      await dispatch('getPost');
    },
    async deletePost({ commit }, payload) {
      const getPost = await db.collection('blogPosts').doc(payload);
      await getPost.delete();
      commit('filterBlogPost', payload);
    },
  },
});
