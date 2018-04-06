import {atto} from './atto.js';
import configureNav from './nav.js';

var default_pageloads =
[
    {target: 'center.banner', source: 'markdown/banner.md', callback: configureNav},
    {target: 'left-sidebar', source: 'markdown/left-sidebar.md'},
];

var routes =
{
    resume: {path: "content/text", source: "ariel-balter-resume.md"},
    cv: {path: "content/text", source: "ariel-balter-cv.md"},
    samples: {path: "content/text", source: "work-samples.md"},
    bio: {path: "content/text", source: "bio.md"}
};

var initial_page = {target: 'center.main', source: 'markdown/ariel-balter-resume.md'}

let app = new atto(default_pageloads, initial_page);
