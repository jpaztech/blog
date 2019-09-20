'use strict';

const pagination = require('hexo-pagination');
const generateRootTagMap = require('./helper').generateRootTagMap;
const defaultOption = require('./helper').defaultOption;

module.exports = function(locals) {
  const config = this.config;
  const perPage = config.tag_generator.per_page;
  const tags = locals.tags;
  let rootTagOption = Object.assign({}, defaultOption);
  if (config.root_tag_generator && config.root_tag_generator.root_tag_names) {
    rootTagOption = Object.assign(rootTagOption, config.root_tag_generator);
  }
  const rootTagNames = rootTagOption.root_tag_names;
  const subTagLimit = rootTagOption.sub_tag_limit;
  const postsMap = generateRootTagMap(tags, rootTagNames, subTagLimit);
  let posts = [];
  postsMap.forEach((childTagPosts, rootTag) => {
    childTagPosts.forEach((childPosts, childTag) => {
      const path = `tags/${rootTag.slug}/${childTag.slug}/`;
      const data = pagination(path, childPosts, {
        perPage: perPage,
        layout: ['tag', 'archive', 'index'],
        format: '/%d/',
        data: {
          tag: `${rootTag.name}+${childTag.name}`
        }
      });
      posts = posts.concat(data);
    });
  });
  return posts;
};
