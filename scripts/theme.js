var darkMode = localStorage.getItem('darkMode');
var body = $('body');
var darkModeClass = 'dark-mode';
if (darkMode == 'true') {
    body.addClass(darkModeClass);
}

$(function(){
    $('.dark-mode-button').click(function(event){
        body.toggleClass(darkModeClass);
        localStorage.setItem('darkMode', body.hasClass(darkModeClass));
    })
})