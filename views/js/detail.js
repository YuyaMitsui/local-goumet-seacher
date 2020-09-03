$(function(){
  let is_mobile = false;
  let imgidx = 0;

  if (window.matchMedia('(max-width: 1024px)').matches) {
    //スマホの時のDOM入れ替え
    is_mobile = true;
    $('.detail-title').before($('.detail-img-container'));
  }

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
    imgs.push("url(img/sample.png)");
  }

  //----------画像表示用
  $(document).on('click','.detail-sub-img',function(){
    let idx = $('.detail-sub-img').index(this);
    $('.detail-main-img').css('background-image',imgs[idx]);
    imgidx = idx;
  });
  //スマホ用
  $(document).on('click','.nextimg',function(){
    let imglen = imgs.length;
    if(imglen > 0){
      imgidx = (imgidx + 1) % imglen;
      $('.detail-main-img').css('background-image',imgs[imgidx]);
    }
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
