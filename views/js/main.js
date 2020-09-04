$(function(){
  let loc_comfirm = true; //位置情報取得時の確認(初回クリックのみ表示)用変数

  $(".get-location").click(function(){

    if(loc_comfirm == true){
      alert('周辺飲食店を検索するために位置情報を利用します。');
      loc_comfirm = false;
    }

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
        // 渋谷駅周辺の座標(デバッグ用)
        // global_position_value['lat'] = 35.658654;
        // global_position_value['lon'] = 139.700412;
        is_authorized = true;
        $('.form-latitude').val(global_position_value['lat']);
        $('.form-longitude').val(global_position_value['lon']);
      },
      // 取得失敗時
      function(error) {
        $(".main-alert").addClass('active');
        alert('エラー: お使いのブラウザ設定でこのサイトの位置情報の使用を許可してください。');
        switch(error.code) {
          case 1: //PERMISSION_DENIED
          $(".alert-message").text("※位置情報サービスの利用を許可してください。");
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
  });

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
