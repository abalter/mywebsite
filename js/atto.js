class Atto
{
    constructor(default_content, initial_content, routes)
    {
        console.log("Atto.constructor");

        this.default_content = default_content;
        console.log(this.default_content);
        this.initial_content = initial_content;
        this.routes = routes;
        // this.initializeApp();
    }

    initializeApp()
    {
        // Sets up
        console.log("Atto.initializeApp");
        console.log(this.default_content);

        let $self = this;

        // set up page on load
        $(document).ready($self.initializePage());

        //this.initializePage();

        // Capture hash changes and process new request
        $(window).on('hashchange', function()
        {
          console.log('hashchange');
          console.log($self);
          console.log("href = " + window.location.href);
          let url = new URL(window.location.href);
          console.log(url);
          console.log(url.query_object);
          $self.updatePage(url.query_object);
        });
    }

    initializePage()
    {
        console.log("Atto.initializePage");
        this.insertHTML('a','b');

        // Since this is a new request, place all of the default
        // content.
        console.log("processing default content");

        console.log(this.default_content);

        for (let query_obj of this.default_content)
        {
            this.updatePage(query_obj);
        }
        console.log('document ready');

        let url = new URL(window.location.href);

        // If no query string, then it is a fresh load, i.e. not a restful request
        // with a query. Insert initial content
        if (!url.hasQuery)
        {
            console.log("no query");
            this.updatePage(this.initial_content);
        }
        // Otherwise handle the query
        else
        {
            console.log(`query = ${url.query}`);
            this.updatePage(url.query);
        }

    }

    updatePage(query_obj)
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
        console.log(query_obj);

        if ('source' in query_obj && 'target' in query_obj)
        {
            let source = query_obj.source;
            let target = query_obj.target;

            let $self = this;

            return $.get(source, function(markdown, status)
            {
                console.log(markdown);

                // render the markdown to HTML
                let html = marked(markdown);
                console.log("printing html");
                console.log(html);

                // insert in to page
                $self.insertHTML(html, target);

                // process callback
                if ('callback' in query_obj)
                {
                    console.log("has callback");
                    query_obj.callback();
                }

                // The default callback is to set events on
                // whatever links are in the new page
                // The link event does
                // 1) update the URL
                // 2) process the query
                // This mimics making an actual HTTP request
                $self.setLinkEvents();
            });
        }

    }

    insertHTML(html, target)
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

    setLinkEvents()
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
        console.log("URL.construtor");

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
        console.log("URL.getQueryPart");
        console.log(this.url);

        var query = window.location.hash.replace(/^#/, '');
        console.log("query = " + query);

        return query;
    }

    parseQuery()
    {
        console.log("URL.parseQuery");
        console.log(`query=${this.query}`);

        // We now parse the query.
        // First separate the query into individual sub-queries by splitting
        // on "&"
        let query_list = this.query.split('&');
        console.log("query_list=" + JSON.stringify(query_list));
        // Then create a list of the sub-queries
        //
        // initialize an dummy object
        // turn each request part into a request object with source and target

        this.query_object = {};
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
<<<<<<< HEAD
            this.query_object[key] = value;
=======
            request_object[key] = value;
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
>>>>>>> origin/oop
        });
        console.log(this.query_object);
        return this.query_object;
    }
}

export {Atto};
