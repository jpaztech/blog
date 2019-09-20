# hexo-helper-github-issues

```sh
npm i -S jpazureid/hexo-helper-github-issues
```

## Usage

1. create `github.issue-template.md` in hexo project root.
2. add github project url to `_config.yml`

```yaml
github:
  url: https://github.com/jpazureid/blog/
```

## Parameters

```js
{
    postId: 'uuidv5 of post.href',
    sourceUrl: 'link to source file in github project',
    issueUrl: 'link to new issue',
}

var github = githubData(config, post);

console.log(github.postId)
//b8187f87-437b-565e-bf39-41e9e177f692

console.log(github.sourcecUrl)
//https://jpazureid.github.io/blog/articles/azure-active-directory/qanda-conditional-access/

console.log(github.issueUrl)
//https://github.com/jpazureid/blog/issues/new?title=&body=%0A%0D%0A---%0D%0A%0D%0A%23%23%23%23+Document+Details%0D%0A%0D%0A%E2%9A%A0+*Do+not+edit+this+section.+It+is+required+for+docs.microsoft.com+%E2%9E%9F+GitHub+issue+linking.*%0D%0A%0D%0A*+ID%3A+b8187f87-437b-565e-bf39-41e9e177f692%0D%0A*+%E5%AF%BE%E8%B1%A1%E8%A8%98%E4%BA%8B%3A+%5BAzure+AD+%E3%81%AE%E6%9D%A1%E4%BB%B6%E4%BB%98%E3%81%8D%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B+Q%26A%5D%28https%3A%2F%2Fjpazureid.github.io%2Fblog%2Farticles%2Fazure-active-directory%2Fqanda-conditional-access%2F%29%0D%0A*+Content+Source%3A+%5Barticles%2Fazure-active-directory%2Fqanda-conditional-access.md%5D%28articles%2Fazure-active-directory%2Fqanda-conditional-access.md%29%0D%0A*+Author%3A+
```
