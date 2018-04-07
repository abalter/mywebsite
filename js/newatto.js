class Atto
{
    function constructor(default_content, initial_content, routes)
    {
        this.default_content = default_content;
        this.initial_content = initial_content;
        this.routes = routes;

        // set up page on load
        $(document).ready(initializePage);

        // Capture hash changes and process new request
        $(window).on('hashchange', function()
        {
          console.log('hashchange');
          console.log(window.location.href);
          UpdatePage(window.location.href);
        });
    }

    function initializePage()
    {
        console.log('document ready');

        // get the url but strip any trailing # in case of
        // trailing # but empty hash
        let url = new URS(window.location.href.replace(/#$/,''));
        console.log("current url: " + url);

        console.log("hash=" + window.location.hash);

        // If no query string, then it is a fresh load, i.e. not a restful request
        // with a query. Insert initial content
        if (typeof window.location.hash == 'undefined' || window.location.hash == '')
        {
            console.log("no hash");
            renderMarkdown(initial_page.source, initial_page.target);
        }
        // Otherwise handle the query
        else
        {
            processQuery(url);
        }

        // If it is a new request, place all of the default
        // content.
        console.log("processing default content");
        for (let request of default_content)
        {
            updatePage(request.source, request.target);
        }


    }

    function updatePage(source, target)
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
                console.log("has callback");
                callback();
            }

            // The default callback is to set events on
            // whatever links are in the new page
            // The link event does
            // 1) update the URL
            // 2) process the query
            // This mimics making an actual HTTP request
            this.setLinkEvents();
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
    }

    function setLinkEvents()
    {
        // When new content is inserted into the page,
        // we need to attach events to the links. The event
        // updates the hash with the link href, which is the
        // page update request. Updating the hash fires the
        // hashashchange event, which triggers updating the page.
        console.log("setLinkEvents");

        $('a').on('click', function(e)
        {
            console.log("setting click event");
            e.preventDefault();
            let href = $(this).attr('href');
            console.log(`link href=${href}`);

            // Update the hash with new request
            window.location.hash = href;
        });
    }
}

class URL
{
    constructor(url)
    {
        this.url = url;
        this.valid = this.validate();
        this.query = this.getQueryPart();
        if (this.query != "")
        {
            this.query_object = this.parseQuery();
            this.has_query = true;
        }
        else
        {
            this.query_object = {};
            this.has_query = false;
        }
    }

    validate()
    {
        return this.url.match(/(http[s]?:\/\/[\w\.\/\-_]+)[\?|#]?([\w,;&-\.=]+)?/).length > 1;
    }

    getQueryPart()
    {
        console.log("getQueryPart");
        console.log(this.url);
        // Returns the query part from a URL
        // This is the regex will work with a hash "#" or "?"
        // A URL such as http://www/arielbalter.com?target=111&source=seven
        // will result in the matches
        // ["http://www/arielbalter.com?target=111&source=seven", "http://www/arielbalter.com", "target=111&source=seven"]
        // So we only need the last element, number 2
        // Going to assume a valid URL
        let query_match = this.url.match(/([\w\.\/\-:]+)[\?|#]?([\w,&-\.=]+)?/);
        console.log(query_match);

        if (query_match.length > 2)
        {
            query = query_match[2];
        }
        else
        {
            query = "";
        }

        this.query = query;

        return query;
    }

    parseQuery()
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
        // turn each request part into a request object with source and target
        query_list.forEach((item, index) =>
        {
            console.log("index=" + index + " item=" + item);
            let parts = item.split('=');
            console.log("parts " + JSON.stringify(parts));
            // A string such as "a=b" splits to ['a','b'].
            // So the subquery looks like
            // {split[0] : split[1]} equiv. {a : b}
            let key = parts[0];
            let value = parts[1];
            this.query_object[key] = value;
        });
        console.log(this.query_object);
        return this.query_object;
    }
}