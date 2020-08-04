//グローバル変数
let shop_id = "";
let keyid = '1dd05f7c051161320f1a936fd5e11ced';
let request_params_review = "";
let request_params_search = "";
let imgs = [];
let now_image = 0;
const rest_url = "https://api.gnavi.co.jp/RestSearchAPI/v3/";
const review_url = "https://api.gnavi.co.jp/PhotoSearchAPI/v3/";

//----------レストラン画像取得
const getImgs = (result,imgs) =>{
  let review_imgs = [];
  cnt = 0;//最大4つ取得
  imgs_length = imgs.length;
  review_imgs = [];
  review_hit_count = result.response.total_hit_count;
  for(i = 0;i<review_hit_count;i++){
    if (result.response[i].photo.image_url.url_320 != "") {
      review_imgs.push(result.response[i].photo.image_url.url_320);
      cnt++;
    }
    if(review_imgs.length + imgs_length >= 4) {
      break;
    }
  }
  imgs = $.merge(imgs,review_imgs);
}

//----------結果表示
const showResult = (result_search,result_review) =>{
  result_search.rest.map( item => {

    access = item.access.line + item.access.station + " ";
    if(item.access.station_exit != ""){access += item.access.station_exit;}
    if(item.access.walk != ""){access += "徒歩"+item.access.walk+"分";}

    //---詳細画面情報を差し替える
    //---タイトル・pr文・カテゴリ
    $('.detail-title h2').text(item.name);
    if(item.pr.pr_short != ""){$('.detail-title p').text(item.pr.pr_short);}
    if(item.category != ""){$(".detail-title").before('<p class="restaurant-cat">'+item.category+'</p>')}

    //画像取得
    if(result_review != ""){
      getImgs(result_review,imgs);
    }
    if(item.image_url.shop_image1 != ""){imgs.push(item.image_url.shop_image1);}
    if(item.image_url.shop_image2 != ""){imgs.push(item.image_url.shop_image2);}
    if(imgs.length > 0){
      $('.detail-main-img').css('background-image','url('+imgs[0]+')');
      for(i = 0;i < imgs.length;i++){
        $('.detai-img-sub-container').append('<div class="detail-sub-img" style = "background-image : url('+imgs[i]+');"></div>');
      }
    }

    $('.detail-name').text(item.name);
    if(item.opentime != ""){$('.detail-opentime').text(item.opentime);}
    else{$('.detail-opentime').text('情報なし');}
    if(item.tel != ""){$('.detail-tel').text(item.tel);}
    else{$('.detail-tel').text('情報なし');}
    if(access != ""){$('.detail-access').text(access);}
    else{$('.detail-access').text('情報なし');}
    if(item.url != ""){
      $('.detail-url a').text(item.url);
      $('.detail-url a').attr('href',item.url);
    }
    else{$('.detail-url').text('情報なし');}
    if(item.address != ""){
      $('.detail-address a').text(item.address);
      $('.detail-address a').attr('href','https://www.google.com/maps/search/?api=1&query='+item.address);
    }
    else{$('.detail-address').text('情報なし');}

  });
}

$(function(){
  //----------クエリパラメータを取得
  //クエリパラメータを辞書型に格納
  input_params = {}
  querys = location.search.slice(1).split("&");
  querys.forEach((element) => {
    let key = element.split("=")[0];
    let val = element.split("=")[1];
    if(key != "shop_id"){
      input_params[key] = val;
    }
    else{
      shop_id = val;
    }
  });

  //----------取得したクエリの処理
  input_params["keyid"] = keyid;

  //freewordをUTF-8にデコード
  if(input_params.freeword != ''){
    input_params.freeword = decodeURI(input_params.freeword);
  }
  console.log(input_params);

  //レストラン検索・口コミAPI リクエストパラメータ定義
  request_params_search = {};
  request_params_search["keyid"] = keyid;
  request_params_search["id"] = shop_id;
  request_params_review = {};
  request_params_review["keyid"] = keyid;
  request_params_review["shop_id"] = shop_id;

  //必須項目(keyid,緯度,経度,検索範囲が取得できたか判定)
  let error = false;
  if(!input_params.keyid || !input_params.latitude || !input_params.longitude || !input_params.range){
    console.log("error");
    error = true;
  }

  //検索条件表示
  range = ""; //デフォルト
  switch (input_params["range"]) {
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

  //----------検索条件表示用DOM
  search_option = "<p class='pupup-query'><span> 現在地</span>[緯度:"+input_params.latitude+" 経度:"+input_params.longitude+"] <span> 検索半径</span> ["+range+"m]"+"<br><span> フリーワード </span>["+ decodeURIComponent(input_params.freeword)+"]<p>";
  $(search_option).insertBefore('.popup-button');

  //----------画像表示用
  $(document).on('click','.detail-sub-img',function(){
    idx = $('.detail-sub-img').index(this);
    now_image = idx;
    console.log(idx);
    $('.detail-main-img').css('background-image','url('+imgs[now_image]+')');
  });

  //----------一覧に戻るボタン
  $(".detail-back-btn").click(function(){
    params_backtoList = $.param(input_params);
    window.location.href = "result.html"+"?"+params_backtoList;
  });

  //-----------カテゴリをフリーワードに入れて再検索
  $(document).on("click",".restaurant-cat",function(){
    delete input_params['offset_page'];
    input_params['freeword'] = $(this).text();
    params_addCategory = $.param(input_params);
    console.log(input_params);
    window.location.href = "result.html"+"?"+params_addCategory;
    return false;
  });

  //----------APIにリクエスト送信
  $.getJSON( rest_url, request_params_search, result__search => {
    $.getJSON( review_url, request_params_review, result_review => {
      showResult(result__search,result_review);
    }).fail(function(jqXHR){
      console.log("jqXHR: " + jqXHR.status);
      showResult(result__search,"");
    });;
  });

});
