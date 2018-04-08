class pageUpdate
{
    constructor(source, target, callback)
    {
        this.source = source;
        this.target = target;
        this.callback = callback;

        this.updatePage();

        this.markdown = null;
        this.html = null;
    }

    updatePage()
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
        console.log("source=" + this.source + " target=" + this.target);

        $.get(this.source, function(markdown, status)
        {
            console.log(markdown);

            // render the markdown to HTML
            let html = marked(markdown);
            console.log("printing html");
            console.log(html);

            // insert in to page
            this.insertHTML(html, this.target);

            // process callback
            if (typeof callback != 'undefined')
            {
                console.log("has callback");
                this.callback();
            }
            
            this.setLinkEvents();
        });
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
}