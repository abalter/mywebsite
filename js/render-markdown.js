console.log("render-markdown.js");

var source_dir = "../markdown";

var files =
[
  {name: 'ariel-balter-resume', target: 'center'},
  {name: 'work-samples', target: 'center'}
];

var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

/*
for (let file of files)
{
  let name = file.name;
  let html = renderMarkdown(source_dir + "/" + name);
  placeMarkdown(result, file.target);
}
*/

function renderMarkdown(source, target, callback)
{
  console.log("source=" + source + " target=" + target);
  $.get(source, function(data, status)
  {
//     console.log(data);
    var parsed = reader.parse(data);
    var html = writer.render(parsed);
    console.log(html);
    placeMarkdown(html, target, callback);
  });
  

}

function placeMarkdown(html, target, callback)
{
  $("#" + target).html(html);  
  
  if (typeof callback != 'undefined')
  {
    console.log("setting callback to " + callback);
    callback.call();
  }
}

