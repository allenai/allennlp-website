# AllenNLP Website

The AllenNLP website is for the most part a static website. There is no CMS driving any of the content. However, the site is using html abstraction (in the form of includes) to make it easier to edit and maintain. Includes are not a feature of static html, so this abstraction is being handled via [Jekyll](https://jekyllrb.com/).

Since the AllenNLP website is hosted on GitHub Pages, Jekyll was the logical choice, as GitHub supports Jekyll out of the box. *More about [GitHub Pages and Jekyll](https://help.github.com/articles/about-github-pages-and-jekyll/)*

## Introdution to Jekyll

From the [Jekyll Homepage](https://jekyllrb.com/):

> Jekyll is a simple, blog-aware, static site generator. It takes a template directory containing raw text files in various formats, runs it through a converter (like Markdown) and our Liquid renderer, and spits out a complete, ready-to-publish static website suitable for serving with your favorite web server.

Since GitHub Pages has deep integration with Jekyll, they make it very easy to run Jekyll sites on their servers. You don't need to configure anything or monkey with build processes. GitHub does that all automatically. You simply push your files and GitHub does the rest.

Here's a [tutorial video](https://www.youtube.com/watch?v=iWowJBRMtpc) that outlines Jekyll basics and how the system works.

## Modifying the Website

In order to make changes to the website you need to checkout the [`master`](https://github.com/allenai/allennlp-website/tree/master) branch on the [`allennlp-website`](https://github.com/allenai/allennlp-website) repo. The process for making changes is:

1. Edit file(s) locally
2. [Test changes](#install-jekyll-locally) in browser at *localhost*
3. Commit changes and push to `master`
4. Test changes in browser at http://www.allennlp.org (usually takes at least 30s to update)

After you've commited your changes, push with the following command:

````shell
$ git push
````

### Anatomy of the AllenNLP Jekyll Site (simplified)

```
📂 _includes        // Where html includes go
📂 _site            // Generated files. Do not edit.
📂 assets
📂 css
📂 js
_config.yml         // Main config file for the Jekyll site.
.gitignore          // Ignores changes to generated _site folder
CNAME               // Points GitHub Pages to allennlp.org
Gemfile             // Configs Jekyll version
Gemfile.lock        // Dependencies
index.html
...more html files
```

### Install Jekyll Locally

Before pushing any changes to the website, you should test them locally in browser. In order to do that, you will need to install Jekyll on your machine.

The most important thing is making sure you have a supported version of Ruby installed.

- See [Requirements](https://jekyllrb.com/docs/installation/#requirements) on Jekyll's website.
- See [Dependency Versions](https://pages.github.com/versions/) on GitHub Pages.

As of 08/15/17 it requires Ruby version 2.4.1. Note that OS X Sierra (10.12) ships with Ruby version 2.0 by default, so you may need to update. See [Installing/Updating Ruby on OS X](https://www.ruby-lang.org/en/documentation/installation/#homebrew) on the Ruby Homepage.

Once you've verified you are up-to-date with Ruby then you can install Jekyll with a single command:

````shell
$ gem install jekyll bundler
````


### Running Jekyll Server

Navigate to the local directory where you've checked out the [`master`](https://github.com/allenai/allennlp-website/tree/master) branch and enter the command to run Jekyll.

````shell
$ cd allennlp-website
$ bundle exec jekyll serve
# => Now browse to http://localhost:4000
````

Now you should be able to see your edits reflected instantly.
