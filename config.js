console.log('config.js');

var base_url = "https://raw.githubusercontent.com/abalter/mywebsite/master/";
//base_url = "";

var default_content =
[
  {target: 'center.banner', source: 'content/banner.md'},
  {target: 'left-sidebar', source: 'content/left-sidebar.md'},
  {target: 'banner', source: 'content/banner.md'},
  {target: 'nav', source: 'content/nav.md', callback: 'plugins/responsive-nav/responsive-nav.js'}
];

// var plugins = ['responsive-nav'];

console.log("default_content");
console.log(default_content);
 
var routes =
{
  resume: {path: "content", source: "ariel-balter-resume.md", target:"main", callback: 'plugins/align-dates/align-dates.js'},
  cv: {path: "content", source: "ariel-balter-cv.md", target:"main"},
  samples: {path: "content", source: "work-samples.md", target:"main"},
  bio: {path: "content", source: "bio.md", target:"main"}
};

var initial_content = {target: 'main', source: 'content/ariel-balter-resume.md', callback: 'plugins/align-dates/align-dates.js'};


var configs =
{
    plugins: ['align-dates'],
    default_content: default_content,
    initial_content: initial_content,
    base_url: base_url,
    routes: routes
};

var debug_level = 3;
$.getScript('js/atto.js', () =>
{
    var app = new Atto(configs);
    app.initializeApp();
});



