import {default_pageloads, initial_page, routes} from './script.js';
console.log(default_pageloads);

var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

$(document).ready(initializePage);

function initializePage()
{
  console.log('document ready');
  let url = window.location.href.replace(/#$/,'');
  console.log("current url: " + url);
  //processRequest(url);
  
  console.log("processing default pages");
  for (let request of default_pageloads)
  {
    renderMarkdown(request.source, request.target);
  }
  console.log("hash=" + window.location.hash);
  
  if (typeof window.location.hash == 'undefined' || window.location.hash == '')
  {
    console.log("no hash");
    renderMarkdown(initial_page.source, initial_page.target);
  }
  else
  {
    processRequest(url);
  }
}

$(window).on('hashchange', function()
{
  console.log('hashchange');
  console.log(window.location.href);
  processRequest(window.location.href);
});

function processRequest(location)
{
  console.log("rendering");
  let request_items = parseHttpRequest(location);
  console.log("request items");
  console.log(request_items);
  //text = JSON.stringify(request_items);
  //console.log("text: " + text);
  renderMarkdown(request_items.source, request_items.target);
  setLinkEvents();
}

function parseHttpRequest(http)
{
  console.log("parsing http");
  console.log(http);
  //let request_list = http.match(/[\w\.\/\-:]+\?([\w=&]+)/)[1].split('&');
  let request_list = window.location.hash.replace('#','').split('&');
  console.log("request_list=" + JSON.stringify(request_list));
  let request_object = {};
  // turn each request part into a request object with source and target
  request_list.forEach( (item, index) => {
    console.log("index=" + index + " item=" + item);
    let parts = item.split('=');
    console.log("parts " + JSON.stringify(parts));
    request_object[parts[0]] = parts[1];
  });

  console.log(request_object);
  return request_object;
}

function setLinkEvents()
{
  console.log("setLinkEvents");

  $('a').on('click', function(e)
  {
    let href = $(this).attr('href');
    if (href.search('#') != -1)
    {
        console.log("href=" + href);
        e.preventDefault();
        window.location.hash = href;
        processRequest(window.location.href);
        //window.history.pushState({}, href, href);
    }
  });
}

function renderMarkdown(source, target)
{
    console.log("source=" + source + " target=" + target);
    $.get(source, function(data, status)
    {
        console.log(data);
        var parsed = reader.parse(data);
        var html = writer.render(parsed);
        html = marked(data);
        console.log("printing html");
        console.log(html);
        placeMarkdown(html, target);
    });

}

function placeMarkdown(html, target)
{
  console.log("placeMarkdown");
  console.log("target=" + target);
  let target_parts = target.split('.');
  console.log("target parts: " + JSON.stringify(target_parts));
  console.log("first part: " + target_parts[0]);
  let target_element = $('#' + target_parts[0]);
  console.log("first element");
  console.log(target_element);
  
  if (target_parts.length > 1)    
  {
    console.log("more parts");
    for (let next_element of target_parts.slice(1,))
    {
      console.log("next_element: " + next_element);
      target_element = $(target_element).find('#' + next_element);
    }
  }
  
  console.log(target_element);
  
  target_element.html(html);
}




