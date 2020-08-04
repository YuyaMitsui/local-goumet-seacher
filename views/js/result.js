$(function(){
  //----------ページネーションの実装(隠しフォームでpost)
  let pages_cnt = parseInt($('.pagecnt').text());
  $(document).on('click','.page_num',function(){
    //ページナンバー取得
    input_page = $(this).text();
    input_page = parseInt(input_page);
    $('.form-offset_page').val(input_page);
    $('.form-toResult').submit();

  });
  //前ページへ
  $(document).on('click','.pagectrl-pre',function(){
    //.form-offset_pageの初期値はpost受信時のoffset_page
    input_page = $('.form-offset_page').val();
    if(input_page - 1 >= 1){
      input_page--;
    }
    $('.form-offset_page').val(input_page);
    $('.form-toResult').submit();
  });
  //先ページへ
  $(document).on('click','.pagectrl-nxt',function(){
    input_page = $('.form-offset_page').val();
    if(input_page + 1 <= pages_cnt){
      input_page++;
    }
    $('.form-offset_page').val(input_page);
    $('.form-toResult').submit();
  });

  //----------詳細ページへのリンク
  $(document).on("click",".restaurant",function(){
    let rest_id = $(this).children('.shop_id_hidden').text();

    $('.form_shop_id').val(rest_id);

    $('.form-toDetail').submit();
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
