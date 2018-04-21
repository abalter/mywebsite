var debug_level = 3;

class Atto
{
    constructor(configs)
    {
        debug("Atto.constructor", 1);

        this.plugins = configs.plugins || [];
        this.routes = configs.routes || [];
        this.default_content = configs.default_content || [];
        this.initial_content = configs.initial_content || {};
        this.base_url = configs.base_url || '';

        //this.initializeApp();
    }

    initializeApp()
    {
        // Sets up
        debug("Atto.initializeApp", 1);
        debug(this.default_content, 2);

        let $self = this;

        // Set up page on load
        $(document).ready($self.initializePage());


        // Set event for handling "requests"
        // Capture hash changes and process new request
        $(window).on('hashchange', function()
        {
            debug('hashchange', 1);
            debug($self, 2);
            debug("href = " + window.location.href, 1);
            let url = new URL(window.location.href);
            debug(url, 2);
            debug(url.query_object, 2);
            $self.updatePage(url.query_object);
        });
    }

    initializePage()
    {
        debug("Atto.initializePage", 1);

        // Since this is a new request, place all of the default
        // content.
        debug("processing default content", 1);

        debug(this.default_content, 2);

        for (let query_obj of this.default_content)
        {
            this.updatePage(query_obj);
        }

        let url = new URL(window.location.href);
        debug(`window.location.href=${window.location.href}`,2);
        debug(`url=${url.url}`);
        debug(`url.query=${url.query}`,2);
        debug(`url.getQueryPart()=${url.getQueryPart()}`);
        // If no query string, then it is a fresh load, i.e. not a restful request
        // with a query. Insert initial content
        if (!url.has_query)
        {
            debug("no query", 2);
            this.updatePage(this.initial_content);
        }
        // Otherwise handle the query
        else
        {
            this.updatePage(url.query_object);
        }

        // run plugins
        for (let plugin of this.plugins)
        {

            debug(`setting up plugin ${plugin}`, 1);

            var css_filename = `plugins/${plugin}/${plugin}.css`;
            debug(`css_filename=${css_filename}`, 2);

            var js_filename = `plugins/${plugin}/${plugin}.js`;
            debug(`js_filename=${js_filename}`, 2);

            $.when(this.getPluginCSS(css_filename))
             .then(this.getPluginScript(js_filename));
        }

    }

    getPluginScript(js_filename)
    {
        debug("loading " + js_filename, 1);
        $.getScript(js_filename, (data, success) =>
        {
            debug(success, 2);
        });
    }

    getPluginCSS(css_filename)
    {
        $.get(css_filename,(data, status) =>
            {
                debug(data, 2);
                debug(status, 2);
                $("<link/>",
                {
                    rel: "stylesheet",
                    type: "text/css",
                    href: css_filename
                })
                .appendTo("head");
            });
    }

    updatePage(query_obj)
    {
        debug("updatePageContent", 1);

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

        debug(`query_obj=${query_obj}`);

        if (typeof this.routes != 'undefined' && query_obj.source in this.routes)
        {
            debug('routes', 2);
            let {source, target} = query_obj;
            debug(`source=${source} target=${target}`, 1);
            query_obj.source = this.routes[source].path + "/" + this.routes[source].source;
            debug(query_obj, 2);
        }

        if ('source' in query_obj && 'target' in query_obj)
        {
            let source = this.base_url + query_obj.source;
            let target = query_obj.target;
            debug(`source=${source} target=${target}`, 2);

            let $self = this;

            return $.get(source, function(markdown, status)
            {
                debug(markdown, 3);

                // render the markdown to HTML
                let html = marked(markdown);
                debug("printing html", 3);
                debug(html, 3);

                // insert in to page
                $self.insertHTML(html, target);

                // process callback
                if ('callback' in query_obj)
                {
                    debug("has callback", 1);
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
        let target_element = $('#' + target);
        debug(target_element, 3);
        target_element.html(html);
    }

    setLinkEvents()
    {
        // When new content is inserted into the page,
        // we need to attach an event to each link. The event
        // updates the hash with the link href, which is the
        // page update request. Updating the hash fires the
        // hashashchange event, which triggers updating the page.
        debug("setLinkEvents", 1);

        $('a').on('click', function(e)
        {
            let href = $(this).attr('href');
            debug(href, 2);

            // Want ability to allow specifying to open a link in a new tab.
            // Preceeding the link with "_" will add the `target="_lank"`
            // attribute. AFter that, the initial "_" is stripped from the url.
            // In the unlikely situation where you actually want a
            // link to start with "_", you just need to add two.
            var new_tab = false;
            if (href.match(/^_/))
            {
                new_tab = true;
                $(this).attr('target', "_blank");
                href = href.trimLeft('_');
            }

            // If the link's href is actually a query, then prevent default and
            // update the hash instead so the query will get processed.
            if (href.match(/^#/))
            {
                debug("setting click event", 2);
                e.preventDefault();
                debug(`link href=${href}`, 2);

                // Update the hash with new request
                window.location.hash = href;

                return;
            }

        });
    }
}

class URL
{
    constructor(url)
    {
        debug("URL.construtor", 1);

        this.url = url;
        this.valid = this.validate();
        this.query = this.getQueryPart();
        debug(`url.query=${this.query}`,2);
        debug(`url.getQueryPart()=${this.getQueryPart()}`);
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
        debug("URL.getQueryPart", 1);
        debug(this.url, 2);

        var query = window.location.hash.replace(/^#/, '');
        debug("query = " + query, 2);

        return query;
    }

    parseQuery()
    {
        debug("URL.parseQuery", 1);
        debug(`query=${this.query}`, 2);

        // We now parse the query.
        // First separate the query into individual sub-queries by splitting
        // on "&"
        let query_list = this.query.split('&');
        debug("query_list=" + JSON.stringify(query_list), 2);
        // Then create a list of the sub-queries
        //
        // initialize an dummy object
        // turn each request part into a request object with source and target

        this.query_object = {};
        query_list.forEach((item, index) =>
        {
            debug("index=" + index + " item=" + item, 2);
            let parts = item.split('=');
            debug("parts " + JSON.stringify(parts), 2);
            // A string such as "a=b" splits to ['a','b'].
            // So the subquery looks like
            // {split[0] : split[1]} equiv. {a : b}
            let key = parts[0];
            let value = parts[1];
            this.query_object[key] = value;
        });
        debug(this.query_object, 2);
        return this.query_object;
    }
}


function debug(message, level=1)
{
    if (level <= debug_level)
    {
        console.log(message);
    }
}

// export {Atto};
