//----------スクロール処理

header_offset = $('header').height();
$(window).on('scroll', function() {
  $('.popup-fix').toggleClass('fixed', $(this).scrollTop() > header_offset);
  $('main').toggleClass('fixed', $(this).scrollTop() > header_offset);
  $('.backTop').toggleClass('active', $(this).scrollTop() > $(this).height()/5);
});
$('.backTop').click(function(){
  $('html, body').animate({scrollTop:0},300);
})
