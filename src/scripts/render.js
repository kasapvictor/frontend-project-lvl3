import isObject from 'lodash/isObject.js';
import templateFeed from './templates/feeds.js';
import templatePosts from './templates/posts.js';
import sanitize from './utils/sanitize.js';

const cls = {
  success: {
    message: 'text-success',
    url: null,
  },
  error: {
    message: 'text-danger',
    url: 'is-invalid',
  },
};

const renderPostToModal = (watchedState, elements, id) => {
  const state = watchedState;
  const { feeds } = state;
  const [feedId, postId] = id.split('-');
  const {
    title: postTitle,
    description: postDescription,
    link: postLink,
  } = feeds[feedId].posts[postId];
  const { title: modalTitle, body: modalBody, link: modalLink } = elements.modal;

  modalTitle.innerHTML = '';
  modalTitle.textContent = sanitize(postTitle);

  modalBody.innerHTML = '';
  modalBody.textContent = sanitize(postDescription);

  modalLink.href = postLink;
};

const renderFeeds = (state, elements, i18nInstance, toRerend) => {
  const { feeds } = state;
  const { isUpdate } = state.update;
  const { feeds: feedsWrap, posts: postsWrap } = elements;
  const { url } = elements.fields;

  if (!toRerend && !isUpdate) {
    feedsWrap.innerHTML = templateFeed(feeds, i18nInstance);
  }

  postsWrap.innerHTML = templatePosts(state, i18nInstance);

  url.value = '';
  url.focus();
};

const renderFeedback = (state, elements, i18nInstance, type) => {
  const value = state.status[`${type}`];
  const { message: messageEL } = elements;
  const { url: inputUrl } = elements.fields;
  const messageContent = isObject(value) ? value.url.message : i18nInstance.t(value);
  const revertType = (str) => (str === 'error' ? 'success' : 'error');

  messageEL.innerHTML = '';
  messageEL.textContent = messageContent;
  messageEL.classList.remove(cls[revertType(type)].message);
  messageEL.classList.add(cls[type].message);

  const urlClsToRemove = cls[revertType(type)].url;
  if (urlClsToRemove) {
    inputUrl.classList.remove(urlClsToRemove);
  }

  inputUrl.classList.add(cls[type].url);
};

const handleProcessState = (state, elements, i18nInstance, status) => {
  const { submit } = elements;
  const { url: inputUrl } = elements.fields;

  switch (true) {
    case status === 'sending':
      submit.disabled = true;
      inputUrl.readOnly = true;
      break;

    case status === 'error' || status === 'success':
      submit.disabled = false;
      inputUrl.readOnly = false;
      renderFeedback(state, elements, i18nInstance, status);
      break;

    default:
      break;
  }
};

export default (watchedState, elements, i18nInstance) => (path, value) => {
  const state = watchedState;

  if (path === 'ui.modal.renderId' && value) {
    renderPostToModal(state, elements, value);
  }

  if (value === 'success' || path === 'ui.viewedPostsIds') {
    const toRerend = path === 'ui.viewedPostsIds';
    renderFeeds(state, elements, i18nInstance, toRerend);
  }

  if (path === 'form.status') {
    handleProcessState(state, elements, i18nInstance, value);
  }
};
