//import {default_pageloads, initial_content, routes} from './script.js';
//console.log(default_pageloads);
export let atto = function(default_pageloads, initial_content, routes)
{
    default_pageloads = default_pageloads;
    initial_content = initial_content;
    routes = routes;
    // Basic workflow
    // Included in bindEvents is the event that
    // occurs when the hash is changed. That is the
    // main loop. Hash changed --> render content -->
    // user clicks link --> hash changed ...
    //
    // Changing this. It is really unnecessary for the
    // hash change to trigger a page update. The click
    // event can do two things: 1) update the URL and
    // 2) update the page.
    //
    // Workflow: link --> update URL and update page --> link --> ...
    //
    // A completely new request would trigger document.ready
    // and get handled with that event.
    // Bind events
    setPageLoadEvent();
    setLinkEvents();
    //this.setHashChangeEvent();
    function setPageLoadEvent()
    {
        console.log("setPageLoadEvent");

        // When initial page load is done
        // render the initial state
        $(document).ready(() =>
        {
            console.log("document ready");
            // get the URL
            let url = window.location.href;
            console.log("current url: " + url);
            if (!isValidURL(url))
            {
                console.log("need to make 404 of some kind");
            }
            doInitialLoad();
            // get query
            // if query, process
            // else default content
        });
    }

    function setHashChangeEvent()
    {
        $(window).on('hashchange', function()
        {
            console.log('hashchange');
            console.log(window.location.href);
            ProcessQeury(window.location.href);
        });
    }

    function doInitialLoad()
    {
        console.log("doInitialLoad");

        // This is what happens when the page is accessed by
        // a fresh request that fires document.ready.
        //
        // All other page updates will be handled by a link
        // click event.
        //
        // Because this is a RESTful application, the
        // initial request could have a query. Therefore, need
        // to handle both the case of query and no query.
        // If no query, update page with default content.
        // If there is a query, pass the url to processQuery.
        // A page is composed of default pieces such as the nav
        // and more dynamic pieces such as the main content.
        // First load the default pages
        console.log("processing default pages");
        for (let page_data of default_pageloads)
        {
            console.log("updating page");
            console.log(page_data);
            updatePageContent(page_data.source, page_data.target, page_data.callback);
        }

        // get the URL
        let url = window.location.href;
        console.log("current url: " + url);
        if (!isValidURL(url))
        {
            console.log("need to make 404 of some kind");
        }
        // extract the query part of the URL
        let query = getQueryFromURL(url);
        // let query = window.location.hash;
        console.log("query=" + query);
        // If there is a query, process it. That is, gather the
        // information and update the page.
        if (query)
        {
            ProcessQuery(query);
        }
        // If the query is empty, then we just have root URL
        // So we just render the default initial content
        else
        {
            console.log("no query"); // use default initial content
            updatePageContent(initial_content.source, initial_content.target, initial_content.callback);
        }
    }

    function processQuery(query, callback)
    {
        console.log("processQuery");

        console.log("processing query " + query);
        console.log(`query: ${query}`)
        let query_items = parseQuery(query);
        console.log("query items");
        console.log(query_items);
        updatePageContent(query_items.source, query_items.target, callback);
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
        //setLinkEvents();
    }

    function updatePageContent(source, target, callback)
    {
        console.log("updatePageContent");

        // This updates a single target (accessed by id) on the
        // page with the content from the file pointed to by
        // the source path.
        //
        // If routing is implemented, then this can be a name
        // resolved by the router into a path.
        // Because the page data comes form an ajax request, post
        // processing must be handled in the callback.
        // ajax down the markdown file, render to html,
        // place in page
        console.log("source=" + source + " target=" + target);

        $.get(source, function(markdown, status)
        {
            // alert("got markdown");
            // alert("(inside)");
            // alert(callback);
            // alert("callback good: " + (typeof callback != 'undefined'));

            console.log(markdown);

            // render the markdown to HTML
            let html = marked(markdown);
            console.log("printing html");
            console.log(html);

            // insert in to page
            insertHTML(html, target);

            // process callback
            if (typeof callback != 'undefined')
            {
                //alert(callback);
                console.log("has callback");
                console.log(callback);
                callback();
            }
        });
    }

    function insertHTML(html, target)
    {
        console.log("insertHTML");
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
            for (let next_element of target_parts.slice(1, ))
            {
                console.log("next_element: " + next_element);
                target_element = $(target_element).find('#' + next_element);
            }
        }
        console.log(target_element);
        target_element.html(html);
        setLinkEvents();
    }

    function getQueryFromURL(url)
    {
        console.log("getQueryFromURL");
        console.log(url);
        // Returns the query part from a URL
        // This is the regex to use if we want to use queries with "?"
        // rather than "#".
        //let query = http.match(/[\w\.\/\-:]+\?([\w=&]+)/)[1];
        //
        // Instead, we will just use the "#" to indicate the start of the query
        // This means we can easily access the query as the URL hash
        //let hash = window.location.hash;
        let query_match = url.match(/([\w\.\/\-:]+)\??([\w,&-\.=]+)?/);
        console.log(query_match);
        // let query = window.location.hash
        // Three cases:
        // 1. the url is not really a url --> q is undefined ==> q[2] is undefined
        // 2. the url does not have anything after it --> q[2] is undefined (q[1] is url)
        // 3. the url has something like "?..." after it
        // No guarantee that it is a query. Will need to check that later
        // query = the query string part  or false
        // last little detail -- remove the '?' from the query
        let query = exists(query_match[2]) && query_match[2].replace(/^\?/, '');

        return query;
    }

    function parseQuery(query)
    {
        console.log("parseQuery");
        console.log(`query=${query}`);

        // We now parse the query.
        // First separate the query into individual sub-queries by splitting
        // on "&"
        let query_list = query.split('&');
        console.log("query_list=" + JSON.stringify(query_list));
        // Then create a list of the sub-queries
        //
        // initialize an dummy object
        let request_object = {};
        // turn each request part into a request object with source and target
        query_list.forEach((item, index) =>
        {
            console.log("index=" + index + " item=" + item);
            let parts = item.split('=');
            console.log("parts " + JSON.stringify(parts));
            // A string such as "a=b" splits to ['a','b'].
            // So the subquery looks like
            // {split[0] : split[1]} equiv. {a : b}
            let source = parts[0];
            let target = parts[1];
            request_object[source] = target;
        });
        console.log(request_object);
        return request_object;
    }

    function setLinkEvents()
    {
        console.log("setLinkEvents");

        $('a').on('click', function(e)
        {
            console.log("setting click event");
            e.preventDefault();
            let href = $(this).attr('href');
            console.log(`link href=${href}`);
            if (href.search(/\?/) != -1)
            {
                console.log("href=" + href);
                e.preventDefault();
                //window.location.hash = href;
                //window.history.pushState({}, href, href);
                window.location.replace(href);
                ProcessQuery(window.location.href);
            }
        });
    }

    function isValidURL(url)
    {
        console.log(`should check if ${url} is a vlid url`);
    }

    function exists(x)
    {
        return (x != '') && (!x) && (typeof x != 'undefined') && (x != null) && (x == 'undefined');
    }
}