var fs = require('fs');
var path = require('path');
var UglifyJS = require('uglify-js');
var CleanCSS = require('clean-css');

function InlineContentRenderer(project) {
  this.name = 'ember-cli-inline-content';
  this.project = project;
}

InlineContentRenderer.prototype.included = function(app) {
  this.options = app.options || {};
};

InlineContentRenderer.prototype.contentFor = function(type, config) {
  var inlineContent = this.options.inlineContent;
  var inlineContentForType = inlineContent && inlineContent[type];
  var contentOptions, filePath, content;

  if(inlineContentForType) {
    contentOptions = ('object' === typeof inlineContentForType) && inlineContentForType;

    if (contentOptions && contentOptions.enabled !== undefined && Boolean(contentOptions.enabled) === false) {
      return;
    }
    
    if (contentOptions && contentOptions.content) {
      content = contentOptions.content;
    } else {
      filePath = contentOptions && contentOptions.file || inlineContentForType;
      content = this.readFile(filePath);
    }

    if ('function' === typeof contentOptions.postProcess) {
      content = contentOptions.postProcess(content);
    }

    if (filePath) {
      switch (path.extname(filePath)) {
        case '.js':
          return this.renderScript(content, contentOptions);
        case '.css':
          return this.renderStyle(content, contentOptions);
      }
    }

    return content;
  }
};

InlineContentRenderer.prototype.readFile = function(filePath) {
  if (!filePath) {
    return console.log(this.name + ' error: file path not defined');
  }

  var fullPath = path.join(this.project.root, filePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch(e){
    return console.log(this.name + ' error: file not found: ' + fullPath);
  }
};

InlineContentRenderer.prototype.renderContentWithTag = function(content, tag, options) {
  var attrs = options && options.attrs;
  var openTag = '<' + tag;
  var closeTag = '</' + tag + '>';

  for (var attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      openTag += ' ' + attr + '="' + attrs[attr] + '"';
    }
  }
  openTag += '>';
  return [openTag, content, closeTag].join('\n');
};

InlineContentRenderer.prototype.renderScript = function(content, options) {
  if (this.options.minifyJS.enabled) {
    var uglifyOptions = { fromString: true };
    content = UglifyJS.minify(content, uglifyOptions).code;
  }
  return this.renderContentWithTag(content, 'script', options);
};

InlineContentRenderer.prototype.renderStyle = function(content, options) {
  if (this.options.minifyCSS.enabled) {
    content = new CleanCSS(this.options.minifyCSS.options).minify(content);
  }
  return this.renderContentWithTag(content, 'style', options);
};

module.exports = InlineContentRenderer;
