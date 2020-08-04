$(function(){
  //---------ページ再読み込みボタン
  $(".alert-reload").click(function(){
    location.reload();
  })

  //----------現在地取得処理
  //変数定義
  let global_position_value = {lat: "",lon: ""};//位置情報格納用
  let geo_available = false; //Geolocation APIに対応しているか
  let is_authorized = false; // getPosition内: 現在地の利用を許可されたか
  if (navigator.geolocation) {
    geo_available = true;
  }

  // 現在地を取得
  navigator.geolocation.getCurrentPosition(
    //取得成功時
    function(position){
      global_position_value['lat'] = position.coords.latitude;
      global_position_value['lon'] = position.coords.longitude;
      is_authorized = true;
      $('.form-latitude').val(global_position_value['lat']);
      $('.form-longitude').val(global_position_value['lon']);
    },
    // 取得失敗時
    function(error) {
      $(".main-alert").addClass('active');
      switch(error.code) {
        case 1: //PERMISSION_DENIED
        $(".alert-message").text("※位置情報サービスの利用が許可してください。");
        break;
        case 2: //POSITION_UNAVAILABLE
        $(".alert-message").text("※現在位置が取得できませんでした。");
        break;
        case 3: //TIMEOUT
        $(".alert-message").text("※タイムアウトになりました。");
        break;
        default:
        $(".alert-message").text("※エラー(エラーコード:"+error.code+")");
        break;
      }
    }
  );

  //----------フォームエラーチェック
  $('form').on('submit',function(){
    let error = $(this).find('span.error-info').length;
    if(error)
    {
      alert("入力エラーがあります");
      return false;
    }
  });

});
