renderMarkdown('markdown/left-sidebar.md', 'left-sidebar', setNavList);
renderMarkdown('markdown/ariel-balter-resume.md', 'main');

let sidebar_links =
{
    resume: 'markdown/ariel-balter-resume.md',
    cv: 'markdown/ariel-balter-cv.md',
    work_samples: 'markdown/work-samples.md'
}

$('#left li a').on('click', function()
{
  let source = $(this).attr("href");
});

function setNavList()
{

  console.log($('#left-sidebar').html());
  let left_sidebar_list = $('#left-sidebar ul li a')

  console.log(left_sidebar_list);
  console.log(left_sidebar_list.length);

  $(left_sidebar_list).each(function(index, item){console.log(index);});

  $(left_sidebar_list).each((index, item) =>
  {
    console.log("in each");
    console.log(index);
    console.log(item);
    $(item).on('click', function(e)
    {
      e.preventDefault();
      //stopPropagation();
      let href = $(this).attr('href');
      //alert(href);
      console.log("href=" + href);
      renderMarkdown("markdown/" + href, 'main');
    });
  });
}

