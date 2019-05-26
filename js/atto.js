var debug_level = 2;

class Atto
{
    constructor(configs)
    {
        debug("Atto.constructor", 1);

        this.plugins = configs.plugins || [];
        this.routes = configs.routes || [];
        this.default_content = configs.default_content || [];
        this.initial_content = configs.initial_content || {};
        this.home_url = window.location.origin + window.location.pathname;
        this.base_url = configs.base_url || this.home_url;
        // this.home_url = configs.home_url || window.location.origin;
    }

    initializeApp()
    {
        // Sets up
        debug("Atto.initializeApp", 1);
        debug(this.default_content, 2);

        let $self = this;

        // Set up page on load
        this.initializePage();

        // $.ready(this.setLinkEvents());

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
            debug("default query obj: " + JSON.stringify(query_obj), 2);
            this.updatePage(query_obj);
        }

        let url = new URL(window.location.href, this.routes);
        debug(`window.location.href=${window.location.href}`,2);
        debug(`url=${url.url}`);
        debug(`url.query=${url.query}`);
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
            debug("has query", 2);
            this.updatePage(url.query_object);
        }

    }

    updatePage(query_obj)
    {
        debug("updatePageContent", 1);

        // This updates a single target (accessed by id) on thed
        // page with the content from the file pointed to by
        // the source path.
        //
        // If routing is implemented, then this can be a name
        // resolved by the router into a path.
        // Because the page data comes form an ajax request, post
        // processing must be handled in the callback.
        // ajax down the markdown file, render to html,
        // place in page

        let {source, target} = query_obj;
        debug(`source=${source} target=${target}`, 1);

        if (typeof this.routes != 'undefined' && query_obj.source in this.routes)
        {
            debug('has route', 2);
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

            // $.get("content/attoweb-basics.md", (markdown, success) => console.log(markdown));

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
                    debug("has callback " + query_obj.callback, 1);
                    $.getScript(query_obj.callback);
                }

                // The default callback is to set events on
                // whatever links are in the new page
                // The link event does
                // 1) update the URL
                // 2) process the query
                // This mimics making an actual HTTP request
                $self.setLinkEvents(target);
            });
        }

    }

    insertHTML(html, target)
    {
        let target_element = $('#' + target);
        debug(target_element, 3);
        target_element.html(html);
    }

    setLinkEvents(target)
    {
        // Only set events on new links inserted into target
        // 1. Push History State
        // 2. Handle "Query"

        debug("setLinkEvents for " + target, 1);
        var $self = this;

        $('#' + target + ' a').on('click', function(e)
        {
            // Check the href. If it is empty then it's not a link
            // we need to worry about.
            let href = $(this).attr('href');
            debug("link href=" + href, 1);
            if (href == "" || href == null || typeof href == undefined)
            {
                debug("not a link", 1)
                return;
            }

            if (href == "#")
            {
                window.location = $self.home_url;
            }

            // Check if the href is a hash. If so, it is for an
            // in-page section
            var is_hash = /^#/.test(href);
            debug("is hash = " + is_hash, 2);

            // Check if the href starts with a usual web url.
            // If so, it is an external link and should follow usual propagation
            // If not, it is local to the website.
            var local = href.match(/https?:\/\/[a-zA-Z0-9_\-\.\/]+/) ? false : true;
            debug("local = " + local, 2);

            // ------------------------------------------
            // Want ability to allow specifying to open a link in a new tab.
            // Preceeding the link with "_" will add the `target="_lank"`
            // attribute. AFter that, the initial "_" is stripped from the url.
            // In the unlikely situation where you actually want a
            // link to start with "_", you just need to add two.
            //
            // This only works for external links.
            // TODO: make also possible for internal links.
            var new_tab = false;
            if (href.match(/^_/))
            {
                new_tab = true;
                $(this).attr('target', "_blank");
                href = href.trimLeft('_');
                $(this).attr('href', href);
            }
            // ----------------------------------------

            if (local)
            {
                debug("local link", 1);

                // Stop link default action
                e.preventDefault();

                // "Manufacture" a full url so the machinery in the
                // URL class can be used. First strip any trailing
                // slash from home_url. Maybe do this at top?
                // TODO: this should not be necessary
                var full_url = $self.home_url.replace(/\/$/, '') + href;
                debug("full url = " + full_url, 2);

                // Instantiate a URL object and extract the query
                var url = new URL(full_url);
                var query = url.query;
                var query_obj = url.query_object;
                debug("query_obj = " + JSON.stringify(query_obj), 2);

                // This is only to handle the single case of an empty
                // link address in the markdown to point to home_url.
                // Seems like it should happen more organically.
                if (query == "")
                {
                    debug("empty address -- going home", 2);
                    window.location.assign($self.home_url);
                    this.initializePage();
                }
                else
                {
                    debug("Updating page with query obj " + JSON.stringify(query_obj), 2);
                    $self.updatePage(query_obj);
                    debug("pushing history state " + full_url);
                    history.pushState(null, null, full_url);
                }

            }

        });
    }
}

class URL
{
    constructor(url, routes)
    {
        debug("URL.construtor", 1);

        this.url = url
        this.routes = routes || [];
        // this.valid = this.validate();
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
        debug(`this.url ${this.url}`, 2);

        var query_match = this.url.match(/\?+(.*)/);
        debug(query_match, 1);
        var query = (query_match && query_match.length) > 1 ? query_match[1] : "";
        
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
        
        if (query_list.length == 1)
        {
            let route = query_list[0];
            let route_data = this.routes[route];
            let query_object = 
            {
                source: route_data['path'] + '/' + route_data['source'],
                target: route_data['target']
            }
            this.query_object = query_object;
        }
        else
        {
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
        }
        
        
        debug('returining ' + JSON.stringify(this.query_object), 2);
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

//# sourceURL=atto.js