console.log('config.js');

import {Atto} from './js/atto.js';
import configureNav from './js/nav.js';

var base_url = "https://raw.githubusercontent.com/abalter/mywebsite/master/";

var default_content =
[
  {target: 'center.banner', source: base_url + 'markdown/banner.md', callback: configureNav},
  {target: 'left-sidebar', source: base_url + 'markdown/left-sidebar.md'},
];

console.log("default_content");
console.log(default_content);

var routes =
{
  resume: {path: "content/text", source: "ariel-balter-resume.md"},
  cv: {path: "content/text", source: "ariel-balter-cv.md"},
  samples: {path: "content/text", source: "work-samples.md"},
  bio: {path: "content/text", source: "bio.md"}
};

var initial_content = {target: 'center.main', source: base_url + 'markdown/ariel-balter-resume.md'};

var app = new Atto(default_content, initial_content, routes, base_url);
app.initializeApp();