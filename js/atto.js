import {default_pageloads, initial_content, routes} from './script.js';
console.log(default_pageloads);

export let atto = function()
{
  
  bindEVents();
  doInitialLoad();
  
  function bindEvents()
  {
    // When initial page load is done
    // render the initial state
    $(document).ready(() =>
    {
      console.log("document ready");
      doInitialLoad();
    });
    
    $(window).on('hashchange', function()
    {
      console.log('hashchange');
      console.log(window.location.href);
      processRequest(window.location.href);
    });
    
  }
  
  function doInitialLoad(default_pageloads=[], routes={})
  {
    // Note: Because this is a RESTful application, the
    // initial request could have a query. Therefore, need
    // to handle both the case of query and no query.
    // If there is a query, just pass execution to processRequest.
    
    // A page is composed of default pieces such as the nav
    // and more dynamic pieces such as the main content.

    // First load the default pages
    console.log("processing default pages");
    for (let request of default_pageloads)
    {
      renderContent(request.source, request.target);
    }
    
    let url = window.location.href;
    console.log("current url: " + url);
    console.log("hash=" + window.location.hash);
    
    // If the hash is empty, then we just have root URL
    if (typeof window.location.hash == 'undefined' || window.location.hash == '')
    {
      console.log("no hash");
      renderContent(initial_content.source, initial_content.target);
    }
    // Otherwise, process the request
    else
    {
      let hash = window.location.hash;
      processRequest(hash);
    }
  }
  
  function processRequest(query)
  {
    console.log("processing request");
    
        
    // This is the regex to use if we want to use queries with "?"
    // rather than "#"
    //let request_list = http.match(/[\w\.\/\-:]+\?([\w=&]+)/)[1].split('&');
    //
    // Instead, we will just use the "#" to indicate the start of the query
    // This means we can easily access the query as the URL hash
    query = query(/^#/,'');
    
    let query_items = parseHttpRequest(query);
    console.log("query items");
    console.log(query_items);
    
    renderContent(query_items.source, query_items.target);
    
    // So, we are trying to be able to update the page without
    // completely reloading it. We could just allow the link to 
    // get processed in the normal way, but that would trigger a
    // page load.
    //
    // Instead, we bind an event to links that does two things:
    // 1. Calls a function that updates the content per the link
    // 2. Changes the URL to reflect the link as if it had been
    //    actually followed.
    // Becuase the app is RESTful, one can reproduce the same state
    // by making the HTTP request that appears in the URL.
    setLinkEvents();
  }
  
  function parseHttpRequest(http)
  {
    console.log("parsing http");
    console.log(http);
    
    // We now parse the query.
    // First separate the query into individual sub-queries by splitting
    // on "&"
    let request_list = query.split('&');
    console.log("request_list=" + JSON.stringify(request_list));
    
    // Then create a list of the sub-queries
    //
    // initialize an dummy object
    
    let request_object = {};
    // turn each request part into a request object with source and target
    request_list.forEach( (item, index) => 
    {
      console.log("index=" + index + " item=" + item);
      let parts = item.split('=');
      console.log("parts " + JSON.stringify(parts));
      
      // A string such as "a=b" splits to ['a','b'].
      // So the subquery looks like 
      // {split[0] : split[1]} equiv. {a : b}
      let source = parts[0];
      let target = parts[1];
      request_object[ source ] = target;
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
  
  function renderContent(source, target)
  {
      console.log("source=" + source + " target=" + target);
      $.get(source, function(data, status)
      {
          console.log(data);
          //var parsed = reader.parse(data);
          //var html = writer.render(parsed);
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
}






