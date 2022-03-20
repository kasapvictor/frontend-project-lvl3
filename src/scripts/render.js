import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import templateFeed from './templateFeed';
import templatePosts from './templatePosts';

const cls = {
	sent: {
		message: 'text-success',
		url: null,
	},
	error: {
		message: 'text-danger',
		url: 'is-invalid',
	},
};

const statusType = (type) => (type === 'error' ? 'sent' : 'error');

const handleProcessState = (elements, status) => {
	const {submit, form} = elements;
	const {url: inputUrl} = form;
	
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

const renderFeeds = (feeds, elements, i18nInstance) => {
	const {feeds: feedsWrap, posts: postsWrap} = elements;
 
	feedsWrap.innerHTML = '';
	feedsWrap.insertAdjacentHTML('afterbegin', templateFeed(feeds, i18nInstance));
	
	postsWrap.innerHTML = '';
	postsWrap.insertAdjacentHTML('afterbegin', templatePosts(feeds, i18nInstance));
	// postsWrap.insertAdjacentElement('afterbegin', templatePosts(feeds, i18nInstance));
};

const rendeStatus = (elements, status, info) => {
	if (!status || !info) return;
	
	const {message: messageEL} = elements;
	const {url: inputUrl} = elements.fields;
	const messageContent = isObject(info) ? info.url.message : info;
	
	messageEL.innerHTML = '';
	messageEL.textContent = messageContent;
	messageEL.classList.remove(cls[statusType(status)].message);
	messageEL.classList.add(cls[status].message);
	
	const urlClsToRemove = cls[statusType(status)].url;
	const urlClsToAdd = cls[status].url;
	if (urlClsToRemove) {
		inputUrl.classList.remove(urlClsToRemove);
	}
	inputUrl.classList.add(cls[status].url);
};

export default (state, elements, i18nInstance) => (path, value, prevValue) => {
	const {status, info} = state.form.process;
	if ((path === 'form.process.status' || path === 'form.process.info') && status !== 'sending') {
		rendeStatus(elements, status, info);
	}
	
	if (value === 'error' || value === 'sending') {
		handleProcessState(elements, value);
	}
	
	if (value === 'sent') {
		renderFeeds(state.feeds, elements, i18nInstance);
		handleProcessState(elements, value);
	}
};
