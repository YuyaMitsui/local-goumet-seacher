$(function(){
  let imgs = [];
  if($('.detail-sub-img').length){//存在するなら
    for(let i=0;i<$('.detail-sub-img').length;i++){
      image_url = $('.detail-sub-img').eq(i).css('background-image');
      imgs.push(image_url);
    }
    $('.detail-main-img').css('background-image',imgs[0]);
  }
  else {
    $('.detail-main-img').css('background-image','url(img/sample.png)');
  }
  //----------画像表示用
  $(document).on('click','.detail-sub-img',function(){
    let idx = $('.detail-sub-img').index(this);
    $('.detail-main-img').css('background-image',imgs[idx]);
  });

  //----------一覧に戻るボタン
  $(".detail-back-btn").click(function(){
    $('.form-toResult').submit();
  });

  //-----------カテゴリをフリーワードに入れて再検索
  $(document).on("click",".restaurant-cat",function(){
    $('.form-offset_page').val(1);
    $('.form-input-freeword').val($(this).text());
    $('.form-toResult').submit();
    $('.form-input-freeword').val("");
    return false;
  });

});
