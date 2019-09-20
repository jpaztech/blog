/* global hexo */
'use strict';

hexo.config.root_tag_generator = Object.assign({
  per_page: hexo.config.per_page == null ? 10 : hexo.config.per_page
}, hexo.config.root_tag_generator);

hexo.extend.generator.register('root_tag', require('./lib/generator'));
hexo.extend.helper.register('list_tag_tree', require('./lib/helper').listRootTagHelper);
