import { createApp } from 'vue';
import App from './App.vue';
import { createRouter } from './router';
import { createStore } from './store';
import Vue2Editor from 'vue2-editor';
import firebase from 'firebase/app';
import 'firebase/auth';

const app = createApp(App);
const router = createRouter();
const store = createStore();

app.use(Vue2Editor);
app.use(router);
app.use(store);

let mounted = false;

firebase.auth().onAuthStateChanged(() => {
  if (!mounted) {
    app.mount('#app');
    mounted = true;
  }
});
