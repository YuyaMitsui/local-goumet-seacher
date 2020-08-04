//グローバル変数
let now_page = 1;
let hit_count = 0;
let pages_cnt = 0;
let params = {};
let keyid = '1dd05f7c051161320f1a936fd5e11ced';
const rest_url = "https://api.gnavi.co.jp/RestSearchAPI/v3/";
const review_url = "https://api.gnavi.co.jp/PhotoSearchAPI/v3/";
let restaurants_id= [];

//レストラン画像を口コミAPIにリクエスト、更新
const getImg = () =>{
  for(i = 0;i < restaurants_id.length;i++){
    imageUrl = $('.restaurant-thumb').eq(i).css('background-image');
    imageUrl = imageUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    if(imageUrl.match(/sample.png/)){
      let review_params = {
        keyid : keyid,
        shop_id : restaurants_id[i]
      };
      let review_img;
      $.getJSON( review_url, review_params, result => {
        //非同期処理のためiが正しく取得できないためidの称号でindexを取得
        idx = $.inArray(review_params.shop_id, restaurants_id);
        review_hit_count = result.response.total_hit_count;
        for(j = 0;j<review_hit_count;j++){
          if (result.response[j].photo.image_url.url_320 != "") {
            review_img = result.response[j].photo.image_url.url_320;
            break;
          }
        }
        if(review_img != ""){
          $('.restaurant-thumb').eq(idx).css('background-image','url('+review_img+')');
        }
      });
    }
  }
}

//ページネーション項目クリック時処理
const updatePage = (input_page,total_pages) =>{
  $('.page_num').remove();
  if(total_pages > 5){
    //最初から1番目or2番目
    if(input_page < 1 + 2){
      for(i = 1;i <= 5;i++){
        $('.pagectrl-nxt').before('<li class="page_num">'+i+'</li>');
      }
    }
    //最後から1番目or2番目
    else if(input_page > total_pages-2){
      for(i = total_pages - 4;i <= total_pages;i++){
        $('.pagectrl-nxt').before('<li class="page_num">'+i+'</li>');
      }
    }
    //選択したページに前後2ページ存在するなら
    else{
      for(i = input_page - 2;i <= input_page + 2;i++){
        $('.pagectrl-nxt').before('<li class="page_num">'+i+'</li>');
      }
    }
  }
  else{
    for(i = 1;i <= total_pages;i++){
      $('.pagectrl-nxt').before('<li class="page_num">'+i+'</li>');
    }
  }
  now_page = input_page;
  params["offset_page"] = now_page;
}

// 結果表示
const showResult = (result) =>{
  //---ヒット数表示
  $(".hit-cnt").html('<p class="hit-cnt">全'+hit_count+'件<span>(1～10件)</span></p>');

  //---総ページ数表示
  pages_cnt = Math.floor(hit_count / 10);
  if(hit_count % 10 != 0){pages_cnt++;}
  updatePage(now_page,pages_cnt);

  //---初期化
  restaurants_id = [];
  $('.restaurants-container .restaurant').remove();

  //---取得した要素を処理
  result.rest.map( item => {
    let imgs = [];
    restaurants_id.push(item.id);

    access = item.access.line + item.access.station + " ";
    if(item.access.station_exit != ""){access += item.access.station_exit;}
    if(item.access.walk != ""){access += "徒歩"+item.access.walk+"分";}
    if(item.image_url.shop_image1 != ""){imgs.push(item.image_url.shop_image1);}
    if(item.image_url.shop_image2 != ""){imgs.push(item.image_url.shop_image2);}
    //---レストランリスト表示用DOM生成
    let restaurant_DOM = "";
    restaurant_DOM = '<div class="restaurant"><a href="#" class="restaurant-link"></a>';
    restaurant_DOM += '<p class="restaurant-cat">'+item.category+'</p>';
    //サムネイル
    img_style = "";
    if(imgs.length > 0){
      img_style = 'style = \"background-image: url(\''+imgs[0]+'\')\"';
    }
    restaurant_DOM += '<div class="restaurant-thumb" '+img_style+'></div>';
    restaurant_DOM += '<div class="restaurant-inner-detail"><div class="restaurant-title"><h2>'+item.name+'</h2><p class="restaurant-pr"></p></div>';

    //営業時間
    if(item.opentime != ""){
      restaurant_DOM += '<div class="restaurant-opentime restaurant-info"><img src="img/clock.png" alt=""><p>'+item.opentime+'</p></div>';
    }
    //アクセス
    if(access != " " && access != ""){
      restaurant_DOM += '<div class="restaurant-access restaurant-info"><img src="img/train.png" alt=""><p>'+access+'</p></div>';
    }
    //住所
    if(item.address != ""){
      restaurant_DOM += '<div class="restaurant-address restaurant-info"><img src="img/map.png" alt=""><p>'+item.address+'</p></div>';
    }
    restaurant_DOM += '</div></div>';
    $('.restaurants-container').append(restaurant_DOM);
  });

  //サムネイルがないレストランは口コミから取得する
  getImg();
}

$(function(){
  //----------クエリパラメータを取得
  //クエリパラメータを辞書型に格納
  querys = location.search.slice(1).split("&");
  querys.forEach((element) => {
    let key = element.split("=")[0];
    let val = element.split("=")[1];
    params[key] = val;
  });
  params["offset_page"] = now_page;
  params["keyid"] = keyid;
  params["latitude"] = '35.658546';
  params["longitude"] = '139.700450';

  //----------取得したクエリの処理
  //freewordをUTF-8にデコード
  if(params.freeword != ''){
    params.freeword = decodeURI(params.freeword);
  }
  //必須項目(keyid,緯度,経度,検索範囲が取得できたか判定)
  let error = false;
  if(!params.keyid || !params.latitude || !params.longitude || !params.range){
    console.log("error");
    error = true;
  }
  //検索条件表示用
  range = ""; //デフォルト
  switch (params["range"]) {
    case '1':
      range = 300;
      break;
    case '2':
      range = 500;
      break;
    case '3':
      range = 1000;
      break;
    case '4':
      range = 2000;
      break;
    case '5':
      range = 3000;
      break;
    default:
  }

  //検索条件表示用DOM
  search_option = "<p class='pupup-query'><span> 現在地</span>[緯度:"+params.latitude+" 経度:"+params.longitude+"] <span> 検索半径</span> ["+range+"m]"+"<br><span> フリーワード </span>["+ decodeURIComponent(params.freeword)+"]<p>";
  $(search_option).insertBefore('.popup-button');

  //----------APIにリクエスト送信
  $.getJSON( rest_url, params, result => {
    hit_count = result.total_hit_count;
    showResult(result);
  });

  //ページネーション処理-選択ページに応じてリクエスト再送信
  $(document).on('click','.page_num',function(){
    input_page = $(this).text();
    input_page = parseInt(input_page);
    $('html, body').animate({scrollTop:0},100);

    updatePage(input_page,pages_cnt);
    $("#table tr:not(:first-child)").remove();
    $.getJSON( rest_url, params, result => {
      showResult(result);
    });
  });

  $(document).on('click','.pagectrl-pre',function(){
    input_page = now_page;
    if(input_page - 1 >= 1){
      input_page--;
    }
    $('html, body').animate({scrollTop:0},100);
    updatePage(input_page,pages_cnt);
    $("#table tr:not(:first-child)").remove();
    $.getJSON( rest_url, params, result => {
      showResult(result);
    });
  });

  $(document).on('click','.pagectrl-nxt',function(){
    input_page = now_page;
    if(input_page + 1 <= pages_cnt){
      input_page++;
    }
    $('html, body').animate({scrollTop:0},100);
    updatePage(input_page,pages_cnt);
    $("#table tr:not(:first-child)").remove();
    $.getJSON( rest_url, params, result => {
      showResult(result);
    });
  });

  //----------詳細ページへのリンク
  $(document).on("click",".restaurant",function(){
    idx = $('.restaurant').index(this);
    rest_id = restaurants_id[idx];
    console.log(rest_id);
    delete params['offset_page'];
    params_toDetail = $.param(params);
    window.location.href = "detail.html"+"?"+params_toDetail+'&shop_id='+rest_id;
  });

  //-----------カテゴリをフリーワードに入れて再検索
  $(document).on("click",".restaurant-cat",function(){
    delete params['offset_page'];
    params['freeword'] = $(this).text();
    params_addCategory = $.param(params);
    console.log(params);
    window.location.href = "result.html"+"?"+params_addCategory;
    return false;
  });
});
