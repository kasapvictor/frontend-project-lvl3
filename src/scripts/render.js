import isObject from 'lodash/isObject.js';
import templateFeed from './templates/feeds.js';
import templatePosts from './templates/posts.js';

const cls = {
  sent: {
    message: 'text-success',
    url: null,
  },
  success: {
    message: 'text-success',
    url: null,
  },
  error: {
    message: 'text-danger',
    url: 'is-invalid',
  },
};

const handleProcessState = (elements, status) => {
  const { submit } = elements;
  const { url: inputUrl } = elements.fields;
  
  switch (true) {
    case status === 'sending':
      submit.disabled = true;
      inputUrl.readOnly = true;
      break;
    
    case status === 'error' || status === 'sent':
      submit.disabled = false;
      inputUrl.readOnly = false;
      break;
    
    default:
      break;
  }
};

const renderPostToModal = (elements, watchedState, id) => {
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
  modalTitle.textContent = postTitle;

  modalBody.innerHTML = '';
  modalBody.textContent = postDescription;

  modalLink.href = postLink;
};

const renderFeeds = (state, elements, i18nInstance, toRerend) => {
  const { feeds } = state;
  const { isUpdate } = state.update;
  const { url } = elements.fields;
  const { feeds: feedsWrap, posts: postsWrap } = elements;

  if (!toRerend && !isUpdate) {
    feedsWrap.innerHTML = '';
    feedsWrap.insertAdjacentHTML('afterbegin', templateFeed(feeds, i18nInstance));
  }

  postsWrap.innerHTML = '';
  postsWrap.insertAdjacentHTML('afterbegin', templatePosts(state, i18nInstance));

  if (!isUpdate) {
    url.value = '';
    url.focus();
  }
};

const rendeStatus = (elements, value, type) => {
  const { message: messageEL } = elements;
  const { url: inputUrl } = elements.fields;
  const messageContent = isObject(value) ? value.url.message : value;
  const revertType = (type) => (type === 'error' ? 'sent' : 'error');
  
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

const typeStatus = (str) => str.includes('error') ? 'error' : 'success';

export default (watchedState, elements, i18nInstance) => (path, value) => {
  const state = watchedState;
  
  if (value === 'sent' || path === 'ui.viewedPostsIds') {
    const toRerend = path === 'ui.viewedPostsIds';
    renderFeeds(state, elements, i18nInstance, toRerend);
  }

  if (path === 'ui.modal.renderId' && value) {
    renderPostToModal(elements, state, value);
  }
  
  if (path === 'status.error' || path === 'status.success') {
    rendeStatus(elements, value, typeStatus(path));
  }
  
  if (path === 'form.status') {
    handleProcessState(elements, value)
  }
};
