'use strict';

const defaultOption = {
  'root_tag_names': [],
  'sub_tag_limit': 100,
  'sub_tag_sort': 'name'
};

const generateRootTagMap = (tags, tagNames, subTagLimit) => {
  const rootTagNames = tagNames === 'all' ? tags.map((v) => v.name) : tagNames;
  const isRootTag = function(tagName) {
    return rootTagNames.indexOf(tagName) >= 0;
  };
  const containTagNameInPost = (post, tagName) => {
    if (!post || !post.tags || !post.tags.length) return false;
    // schema object is not iterable?
    return post.tags.filter(tag => tag.name === tagName).length > 0;
  };

  return tags.filter((tag) => {
    if (!tag.length) return false;
    return isRootTag(tag.name);
  }).reduce((map, rootTag) => {
    let childTagNames = rootTag.posts.reduce(
      (tags, post, index) => {
        // all tags not rootTag
        post.tags.filter(t => t.name !== rootTag.name)
          .forEach(childTag => {
            tags.add(childTag.name);
          });
        return tags;
      },
      new Set()
    );
    childTagNames = Array.from(childTagNames.values()).sort().slice(0, subTagLimit);
    const childTags = childTagNames.map((tagName) => {
      let tag = tags.filter(tag => {
        return tag.name === tagName;
      });
      return tag.data[0];
    });
    const childPosts = new Map();
    for (const childTag of childTags) {
      const posts = childTag.posts.filter(
        (childPost) => containTagNameInPost(childPost, rootTag.name)
      );
      childPosts.set(childTag, posts);
    }
    return map.set(rootTag, childPosts);
  }, new Map());
};

function listRootTagHelper(options) {
  let tags = this.site.tags;

  if (!tags || !tags.length) return '';
  options = options || {};

  const style = options.hasOwnProperty('style') ? options.style : 'list';
  const showCount = true; // options.hasOwnProperty('show_count') ? options.show_count : true;
  const className = options.class || 'tag';
  const transform = options.transform;
  const suffix = options.suffix || '';
  const separator = options.hasOwnProperty('separator') ? options.separator : ', ';
  let result = '';
  const self = this;
  const rootTagOption = options.hasOwnProperty('root_tag_generator') ? Object.assign(defaultOption, options.root_tag_generator) : defaultOption;
  const tagNames = rootTagOption.root_tag_names;
  const subTagLimit = rootTagOption.sub_tag_limit;
  // rootTags
  const treeTags = generateRootTagMap(tags, tagNames, subTagLimit);
  // eslint-disable-next-line node/no-unsupported-features
  let rootTags = [...treeTags.keys()];
  // Ignore tags with zero posts
  tags = rootTags.filter(tag => tag.length);

  if (style === 'list') {
    result += `<ul class="${className}-list">`;

    tags.forEach(tag => {
      result += `<li class="${className}-list-item">`;

      result += `<a class="${className}-list-link" href="${self.url_for(tag.path)}${suffix}">`;
      result += transform ? transform(tag.name) : tag.name;
      result += '</a>';

      if (showCount) {
        result += `<span class="${className}-list-count">${tag.length}</span>`;
      }
      result += '<ul>';
      const childTagMap = treeTags.get(tag);
      let index = 0;
      childTagMap.forEach((childPosts, childTag) => {
        if (subTagLimit && index > subTagLimit) return;
        result += `<li class="${className}-list-item ${className}-list-item-child-tag">`;
        result += `<a class="${className}-list-link ${className}-list-link-child" href="${self.url_for(tag.path + '/' + childTag.slug)}${suffix}">`;
        result += transform ? transform(childTag.name) : childTag.name;
        result += '</a>';
        if (showCount) {
          result += `<span class="${className}-list-count">${childPosts.length}</span>`;
        }
        result += '</li>';
        index++;
      });

      result += '</ul>';
      result += '</li>';
    });

    result += '</ul>';
  } else {
    tags.forEach((tag, i) => {
      if (i) result += separator;

      result += `<a class="${className}-link" href="${self.url_for(tag.path)}${suffix}">`;
      result += transform ? transform(tag.name) : tag.name;

      if (showCount) {
        result += `<span class="${className}-count">${tag.length}</span>`;
      }

      result += '</a>';
    });
  }

  return result;
}


exports.generateRootTagMap = generateRootTagMap;
exports.listRootTagHelper = listRootTagHelper;
exports.defaultOption = defaultOption;
