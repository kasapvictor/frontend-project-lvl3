import isEmpty from 'lodash/isEmpty';
import uniqWith from 'lodash/uniqWith';
import validate from './validate';
import parse from './parse';
import api from './api';

const toFillingStateFeeds = (watchState, newFeed) => {
  const state = watchState;
  const feeds = [...state.feeds];
  
  // console.log('feeds', feeds);
  // console.log('newFeed', newFeed)
  //
  // let merged = uniqWith([...feeds, newFeed], (pre, cur) => {
  //   if (pre.title === cur.title) {
  //     cur.description = pre.description;
  //     cur.posts = pre.posts;
  //     return true;
  //   }
  //   return false;
  // });
  //
  // console.log('merged --->', merged);

  const newFeeds = feeds.reduce((prev, curr) => {
    if (curr.title === newFeed.title) {
      const { description, posts } = newFeed;
      return [...prev, { title: curr.title, description, posts }];
    }

    return [...prev, curr, newFeed];
  }, []);

  state.feeds = newFeeds;
};

export default (e, form, elements, watchedState, i18nInstance) => {
  e.preventDefault();

  const state = watchedState;
  const formData = new FormData(form);

  // FILL FIELDS VALUES OF STATE
  Object.entries(elements.fields).forEach(([name, element]) => {
    state.form.fields[name] = formData.get(name).trim();
  });

  // ERRORS
  const errors = validate(state.form.fields, state.urls, i18nInstance);
  errors
    .then((data) => {
      state.form.process.info = data;
      state.form.valid = isEmpty(data);
    })
    .then(() => {
      if (!state.form.valid) {
        state.form.process.status = 'error';
      }

      // AXIOS GET DATA OF LINK
      if (state.form.valid) {
        const { url } = state.form.fields;

        api(url)
          .then((response) => {
            state.form.process.status = 'sending';
            return response.data;
          })
          .then((content) => {
            const rssContent = parse(content);

            if (!rssContent) {
              state.form.process.info = i18nInstance.t('errors.rss');
              state.form.process.status = 'error';
            }

            if (rssContent) {
              toFillingStateFeeds(state, rssContent);
              console.log('STATE', state.feeds);
              state.urls = [...state.urls, url];
              state.form.process.status = 'sent';
              state.form.process.info = i18nInstance.t('network.success.rss');
            }
          })
          .catch((err) => {
            if (err.request) {
              state.form.process.info = i18nInstance.t('network.error.request');
            } else {
              state.form.process.info = i18nInstance.t('network.error.default');
            }
            state.form.process.status = 'error';
            throw err;
          });
      }
    });

  console.log(state);
};
