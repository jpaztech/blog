'use strict';
const url = require('url');
const fs = require('fs');
const path = require('path');
const uuidv5 = require('uuid/v5');


function githubDataHelper(config = {}, post = {}) {
    let blogUrl = config.url
    const issueUrl = new URL(url.resolve(config.github.url, 'issues/new'));
    if (config.root) {
        blogUrl = url.resolve(blogUrl, config.root);
    }
    const postUrl = url.resolve(blogUrl, post.path);
    const postId = uuidv5(postUrl, uuidv5.URL)
    const title = post.title;
    let sourceFileName;
    const postsDir = config.github.posts_dir;
    if (postsDir) {
        sourceFileName = path.join(postsDir, post.source.replace('_posts', ''));
    } else {
        const sourceDir = config.source_dir ? config.source_dir : 'source';
        sourceFileName = path.join(sourceDir, post.source);
    }
    //for windows
    sourceFileName = sourceFileName.replace(/\\/g,'/');
    const editRoot = url.resolve(config.github.url, 'edit/master/');
    const blobRoot = url.resolve(config.github.url, 'blob/master/');
    const editUrl = url.resolve(editRoot, sourceFileName);
    const sourceUrl = url.resolve(blobRoot, sourceFileName);
    const author = post.author;
    let template;
    try {
        template = fs.readFileSync('./github-issue-template.md', 'utf8');
    } catch (error) {
        console.error(error);
        console.error('');
        console.error('Use default template: ');
        template = `
---

#### Document Details

⚠ *Do not edit this section. 

* Article ID: {{ID}}
* 対象記事: [{{TITLE}}]({{PostURL}})
* Content Source: [{{SourceFileName}}]({{SourceURL}})
* Author: {{Author}}`;

        console.log(template);
    }
    let documentBody = template.replace(/\{\{TITLE\}\}/g, title)
        .replace(/\{\{ID\}\}/g, postId)
        .replace(/\{\{SourceFileName\}\}/g, sourceFileName)
        .replace(/\{\{SourceURL\}\}/g, sourceUrl)
        .replace(/\{\{PostURL\}\}/g, postUrl)
        .replace(/\{\{Author\}\}/g, author ? author : '')
        .replace('\r\n', '\n');

    issueUrl.searchParams.append('title', '');
    issueUrl.searchParams.append('body', documentBody);
    return {
        postId,
        issueUrl: issueUrl.href,
        sourceUrl: sourceUrl,
        editUrl: editUrl
    }
}

hexo.extend.helper.register('githubData', githubDataHelper);
