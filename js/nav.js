console.log('nav.js');

alert('nav.js');

$(window).load(() => 
{
    console.log("configuring nav");
    
    let menu_toggle = $('#banner').find('h2:contains("menu")');
    $(menu_toggle).addClass('menu-toggle');
    
    let nav_items = $(menu_toggle).find('ul');
    $(nav_items).addClass('nav-items');
    
    
    $('#menu-toggle').on('click', (e) =>
    {
      console.log("menu-toggle");
      toggleCSS('.nav-items', 'display', 'flex', 'none');
    });
    
    $('.nav-items a').on('click', (e) =>
    {
      if ($(window).width() <= 600)
      {
        toggleCSS('.nav-items', 'display', 'flex', 'none');
      }
    });
    
    function toggleCSS(element, attribute, state1, state2)
    {
      console.log(`element: ${element} attribute: ${attribute} state1: {state1} state2: ${state2}`);
      console.log($(element).css(attribute));
    
      $(element).css(attribute) == state1 ? $(element).css(attribute, state2) : $(element).css(attribute, state1);
      }
    
    $(window).resize(() => 
    {
      location = location; 
      console.log(`
        width: ${$(window).width()} display: ${$('.nav-items').css('display')}`
        )
      
    });
});