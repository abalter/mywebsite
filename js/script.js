export var default_pageloads =
[
  {target: 'center.banner', source: 'markdown/banner.md'},
  {target: 'left-sidebar', source: 'markdown/left-sidebar.md'},
];

for (let page of default_pageloads)
{
  console.log(page);
}

export var routes = 
{
  resume: "markdown/ariel-balter-resume.md",
  cv: "markdown/ariel-balter-cv.md",
  samples: "markdown/work-samples.md"
};

export var initial_page = {target: 'center.main', source: 'markdown/ariel-balter-resume.md'}
