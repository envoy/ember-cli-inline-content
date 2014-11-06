# ember-cli-inline-content

An ember-cli add-on to render inline scripts and styles directly into your index.html file.

## Install
```
npm install --save-dev ember-cli-inline-content
```
**Note:** *compatible with ember-cli >= v0.0.47 (introduced content-for addons)*

## Example

In your app's Brocfile.js, define a manifest of files you want to inline (name : filepath)

```js
var app = new EmberApp({
  inlineContent: {
    'google-analytics' : 'ext/google-analytics.js',
    'fast-style' : 'ext/red.css'
  }
});
```

In your index.html file, use the 'content-for' helper with a reference to the name in the manifest

```html
{{content-for 'fast-style'}}

<p>some other stuff</p>

{{content-for 'google-analytics'}}
```

During the build preocess, this will render the contents of those files directly inline with `<script>` or `<style>` tags, based on the filetype. In production, the contents of the inline blocks will be minified (will obey application's minifyJS & minifyCSS options in Brocfile).

The above example will output in index.html:
```html
<style>
  body { color: red; }
</style>

<p>some other stuff</p>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-XXXXXXXX-X', 'auto');
  ga('send', 'pageview');
</script>
```

## Advanced Examples

#### Adding attributes to the generated tags:

```js
var app = new EmberApp({
  inlineContent: {
    'olark' : { 
      file: 'ext/olark.js',
      attrs: { 'data-cfasync' : 'true' }
    }
  }
});
```

Will output:
```html
<script data-cfasync="true">
  ...ext/olark.js content here...
</script>
```

#### Enviroment specifc content:
In the Brocfile.js
```js
var app = new EmberApp({
  ...
});

if (app.env === 'production') {
  app.options.inlineContent = {
    'some-script' : 'ext/some-script.js'
  };
}
```

#### Rendering any kind of file:
You are not restricted to just js/css files.  It will inline the literal contents of any UTF-8 string file.

```js
var app = new EmberApp({
  inlineContent: {
    'facebook-html-block' : 'ext/facebook.html'
  }
});
```

#### Rendering a string of content instead of a file:

```js
var app = new EmberApp({
  inlineContent: {
    'env-heading' : { 
      content: '<h1>Environment: ' + process.env.EMBER_ENV + '</h1>'
    }
  }
});
```

## Why?
- You want some code to start executing before your whole app downloads
- You don't want that code to require a separate request
- `<script async>` is not widely supported, or incompatible with some 3rd party code
- Some 3rd party code recommends, or requires you to inline their code
- You need to place various inline content but want to keep your index.html clean
- You want minified inline content, but keep full source in separate files for dev and testing

