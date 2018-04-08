console.log('config.js');

import {Atto} from './js/atto.js';

var plugins =
[
    'nav',
    'blog'
];

var default_content =
[
  {target: 'center.banner', source: 'content/banner.md'},
  {target: 'left-sidebar', source: 'content/left-sidebar.md'},
  {target: 'footer', source: 'footer'}
];

console.log("default_content");
console.log(default_content);


var routes =
{
  footer: {path: "content", source: "footer"},
};

var initial_content = {target: 'center.main', source: 'content/main-page.md'};

var app = new Atto(default_content, initial_content, routes);

app.initializeApp();