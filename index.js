//モジュールを拡張機能として読み込む
const APIKEY = '5834f48b60fe0c1b17c346d0390a13e5' ;
const search_url = "https://api.gnavi.co.jp/RestSearchAPI/v3/";//レストラン検索API
const review_url = "https://api.gnavi.co.jp/PhotoSearchAPI/v3/";//応援口コミAPI
let http = require('http');
let https = require('https');
let fs = require('fs');
let ejs = require('ejs');
let hostname = '127.0.0.1';
let port = 3000;
let server = http.createServer();

//拡張子からcontent-typeの値を決める関数
function getType(_url) {
  let types = {
    ".ejs": "text/html",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".svg": "svg+xml"
  }
  for (let key in types) {
    if (_url.endsWith(key)) {
      return types[key];
    }
  }
  return "text/plain";
}

//----------ぐるなびAPIにリクエスト
function get_restdata(Search_req_url){
  return new Promise(function (resolve) {

    let api_response = {};
    api_response.rest = [];
    let restaurants_id = [];
    //---レストラン検索APIへリクエスト
    https.get(Search_req_url, function(apiRes) {
      let body_search = '';
      apiRes.on('data', function(chunk) {
        body_search += chunk;
      });
      apiRes.on('end', function() {
        let search_result = JSON.parse(body_search);
        //---検索結果(ヒット数・現在ページ)をオブジェクトに格納
        //ヒット数・ページ数
        api_response.total_hit_count = search_result.total_hit_count;
        let pages_cnt = Math.floor(search_result.total_hit_count / 10);
        if(search_result.total_hit_count % 10 != 0){pages_cnt++;}
        api_response.total_pages =  pages_cnt;

        //現在ページ
        api_response.page_offset = search_result.page_offset;

        //---取得したレストランごとの情報をオブジェクトに格納
        search_result.rest.map( item => {
          let imgs = [];
          let tmp_obj = {};
          restaurants_id.push(item.id);
          tmp_obj.name = item.name;
          tmp_obj.tel = item.tel;
          tmp_obj.url = item.url;
          tmp_obj.address = item.address;
          tmp_obj.opentime = item.opentime;
          tmp_obj.category = item.category;
          tmp_obj.pr = item.pr_short;
          //アクセス取得
          access = item.access.line + item.access.station + " ";
          if(item.access.station_exit != ""){access += item.access.station_exit;}
          if(item.access.walk != ""){access += "徒歩"+item.access.walk+"分";}
          tmp_obj.access = access;
          //画像取得
          if(item.image_url.shop_image1 != ""){imgs.push(item.image_url.shop_image1);}
          if(item.image_url.shop_image2 != ""){imgs.push(item.image_url.shop_image2);}
          tmp_obj.imgs = imgs;
          api_response.rest.push(tmp_obj);
        });
        //---各レストランについて画像を追加取得
        for(let i = 0;i < restaurants_id.length;i++){
          let review_params = {
            shop_id: restaurants_id[i],
            keyid: APIKEY
          };
          let params_toReview = Object.keys(review_params).map(function(key) {
            return key + '=' + review_params[key];
          }).join('&');
          Review_req_url = review_url+'?'+params_toReview;
          //応援口コミAPIへリクエスト
          let review_imgs = [];
          https.get(Review_req_url, function(apiRes) {
            let body_review = '';
            apiRes.on('data', function(chunk) {
              body_review += chunk;
            });
            apiRes.on('end', function() {
              review_imgs = [];
              let review_result = JSON.parse(body_review);
              if(!('gnavi' in review_result)){ //エラー判定
                let review_hit_count = review_result.response.total_hit_count;
                for(let j = 0;j < review_hit_count;j++){
                  if (review_result.response[j].photo.image_url.url_320 != "") {
                    api_response.rest[i].imgs.push(review_result.response[j].photo.image_url.url_320);
                  }
                }
                //終了条件(非同期なのでこれを行わないとループ途中で値を渡す)
                if(i == restaurants_id.length - 1){
                  resolve(api_response);
                }
              }
            })
          })
        }
      })
    })
  })
}

server.on('request', function(req, res) {
  console.log(req.method);
  url = req.url;
  let response = "";
  let html_requested = false;
  console.log(url);
  let data = '';

  if(req.method == "POST"){
    req.on('data', function(chunk){data += chunk;})
    .on('end', function() {
      console.log("posturl: "+url);
      //----------POSTメソッドで予想されるリクエスト
      switch (url) {
        case '/result':
        response = fs.readFileSync('./views/result.ejs', 'utf-8');
        break;
        case '/detail':
        response = fs.readFileSync('./views/detail.ejs', 'utf-8');
        break;
        default:
          res.writeHead(404);
          // res.end("指定されたページは見つかりません");
      }
      //----------POSTされたパラメータを一時的にオブジェクト型に
      let querys;
      let search_params = {};
      let Search_req_url = '';
      if(Object.keys(data).length){
        querys = data.split("&");
        querys.forEach((element) => {
          let key = element.split("=")[0];
          let val = element.split("=")[1];
          search_params[key] = val;
        });
        search_params["keyid"] = APIKEY;
        if(!search_params['offset_page']){search_params['offset_page'] = 1;}
        if(search_params.freeword != ''){
          search_params.freeword = decodeURI(search_params.freeword);
        }
        search_params["latitude"] = '35.658546';
        search_params["longitude"] = '139.700450';
        let params_toSearch = Object.keys(search_params).map(function(key) {
          return key + '=' + search_params[key];
        }).join('&');
        Search_req_url = search_url+'?'+params_toSearch;
      }

      let out = '';
      // let api_response = {};
      // api_response.rest = [];
      // let restaurants_id = [];
      //---レストラン検索APIへリクエスト
      // https.get(Search_req_url, function(apiRes) {
      //     let body_search = '';
      //     apiRes.on('data', function(chunk) {
      //       body_search += chunk;
      //     });
      //     apiRes.on('end', function() {
      //       let search_result = JSON.parse(body_search);
      //       //---検索結果(ヒット数・現在ページ)をオブジェクトに格納
      //       //ヒット数・ページ数
      //       api_response.total_hit_count = search_result.total_hit_count;
      //       let pages_cnt = Math.floor(search_result.total_hit_count / 10);
      //       if(search_result.total_hit_count % 10 != 0){pages_cnt++;}
      //       api_response.total_pages =  pages_cnt;
      //
      //       //現在ページ
      //       api_response.page_offset = search_result.page_offset;
      //
      //       //---取得したレストランごとの情報をオブジェクトに格納
      //       search_result.rest.map( item => {
      //         let imgs = [];
      //         let tmp_obj = {};
      //         restaurants_id.push(item.id);
      //         tmp_obj.name = item.name;
      //         tmp_obj.tel = item.tel;
      //         tmp_obj.url = item.url;
      //         tmp_obj.address = item.address;
      //         tmp_obj.opentime = item.opentime;
      //         tmp_obj.category = item.category;
      //         tmp_obj.pr = item.pr_short;
      //         //アクセス取得
      //         access = item.access.line + item.access.station + " ";
      //         if(item.access.station_exit != ""){access += item.access.station_exit;}
      //         if(item.access.walk != ""){access += "徒歩"+item.access.walk+"分";}
      //         tmp_obj.access = access;
      //         //画像取得
      //         if(item.image_url.shop_image1 != ""){imgs.push(item.image_url.shop_image1);}
      //         if(item.image_url.shop_image2 != ""){imgs.push(item.image_url.shop_image2);}
      //         tmp_obj.imgs = imgs;
      //         api_response.rest.push(tmp_obj);
      //       });
      //       //---各レストランについて画像を追加取得
      //       for(let i = 0;i < restaurants_id.length;i++){
      //         let review_params = {
      //           shop_id: restaurants_id[i],
      //           keyid: APIKEY
      //         };
      //         let params_toReview = Object.keys(review_params).map(function(key) {
      //           return key + '=' + review_params[key];
      //         }).join('&');
      //         Review_req_url = review_url+'?'+params_toReview;
      //         //応援口コミAPIへリクエスト
      //         let review_imgs = [];
      //         https.get(Review_req_url, function(apiRes) {
      //           let body_review = '';
      //           apiRes.on('data', function(chunk) {
      //             body_review += chunk;
      //           });
      //           apiRes.on('end', function() {
      //             review_imgs = [];
      //             let review_result = JSON.parse(body_review);
      //             if(!('gnavi' in review_result)){ //エラー判定
      //               let review_hit_count = review_result.response.total_hit_count;
      //               for(let j = 0;j < review_hit_count;j++){
      //                 if (review_result.response[j].photo.image_url.url_320 != "") {
      //                   api_response.rest[i].imgs.push(review_result.response[j].photo.image_url.url_320);
      //                 }
      //               }
      //               // console.log(review_imgs);
      //               // api_response.rest[i].imgs.push(review_imgs);
      //             }
      //             out = ejs.render(response, api_response);
      //             console.log(api_response.rest);
      //           });
      //         });
      //       }
      //     });
      //   });
      api_response = get_restdata(Search_req_url).then(
        function(data){
          console.log(data.rest);
          out = ejs.render(response, data);
          res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
          res.write(out);
          res.end();
        });
      // out = ejs.render(response, get_restdata(api_response));

        // let out = ejs.render(response, api_response);
        // res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        // res.write(out);
        // res.end();




      //----------出力
      // let out;
      // if(html_requested == true){
      //   out = ejs.render(response, params);
      //   res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
      // }
      // else {
      //   out = fs.readFileSync(response,'utf-8');
      //   res.writeHead(200, {'Content-Type': getType(response)+'; charset=UTF-8'});
      // }
      // res.write(out);
      // res.end();
    });
  }
  else if(req.method == "GET"){

    switch (url) {
      case '/index':
      case '/':
      html_requested = true;
      response = fs.readFileSync('./views/index.ejs', 'utf-8');
      break;
      case '/result':
      html_requested = true;
      response = fs.readFileSync('./views/result.ejs', 'utf-8');
      break;
      default:
      url = "./views" + url;
      response = url;
    }
    let out;
    if(html_requested == true){
      out = ejs.render(response, data);
      res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
    }
    else {
      out = fs.readFileSync(response,'utf-8');
      res.writeHead(200, {'Content-Type': getType(response)+'; charset=UTF-8'});
    }
    res.write(out);
    res.end();
  }
});

server.listen(port, hostname, function() {//サーバ起動時に呼ばれる
    console.log(`Server runnning at http://${hostname}:${port}/`);
});
