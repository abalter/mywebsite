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
        }
        else
        {
            this.query_object = {};
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