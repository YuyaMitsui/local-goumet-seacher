$(function(){
  //----------ページネーションの実装(隠しフォームでpost)
  let pages_cnt = parseInt($('.pagecnt').text());
  $(document).on('click','.page_num a',function(){
    //ページナンバー取得
    input_page = $(this).text();
    input_page = parseInt(input_page);
    $('.form-offset_page').val(input_page);
    $('.form-toResult').submit();
    return false;
  });
  //前ページへ
  $(document).on('click','.pagectrl-pre a',function(){
    //.form-offset_pageの初期値はpost受信時のoffset_page
    input_page = $('.form-offset_page').val();
    if(input_page - 1 >= 1){
      input_page--;
    }
    $('.form-offset_page').val(input_page);
    $('.form-toResult').submit();
    return false;
  });
  //先ページへ
  $(document).on('click','.pagectrl-nxt a',function(){
    input_page = $('.form-offset_page').val();
    if(input_page + 1 <= pages_cnt){
      input_page++;
    }
    $('.form-offset_page').val(input_page);
    $('.form-toResult').submit();
    return false;
  });

  //----------詳細ページへのリンク
  $(document).on("click",".restaurant-detail-link",function(){
    let rest_id = $(this).siblings('.shop_id_hidden').text();
    $('.form_shop_id').val(rest_id);
    $('.form-toDetail').submit();
    return false;
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
