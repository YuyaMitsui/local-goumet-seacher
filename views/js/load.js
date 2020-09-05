//参考 https://recooord.org/loading-animation/
$(function(){
  let loader = $('.loader-wrap');
	$(window).on('load',function(){
    loader.fadeOut();
	});
  setTimeout(function(){
    loader.fadeOut();
  },300);
});
