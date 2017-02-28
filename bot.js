/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 Botkit Basic Template for Heroku

 Author: okajax (https://github.com/okajax)

 Edited by: YutaGoto

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//=========================================================
// Botの準備
//=========================================================

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

//=========================================================
// 基本的な受け答え
//=========================================================

// 以下がBotkitの基本形です。
// controller.hears()で、マッチした単語に応じて処理を実行します。

// 第一引数 ['ほげ','ふが'] の部分には、マッチさせたい単語を入れます。正規表現も使えます。
// 第二引数 'direct_message,direct_mention' の部分には、反応するパターンを入れます。

//  [反応パターン一覧]
//    direct_message: ダイレクトメッセージに反応します
//    direct_mention: 先頭に@付きで発言されたメッセージに反応します
//    mention: @付きで言及されたメッセージに反応します
//    ambient: どんなメッセージタイプにも反応します

controller.hears(['お知らせ'], 'direct_message,direct_mention,mention', function (bot, message) {

    // bot.reply()で、botに発言をさせます。
    var notifyTalk = [
        '`nomu ○○` とつぶやくと、ファイナルファンタジー風に翻訳してくれます。',
        '`:excite: ○○` とつぶやくと、excite再翻訳してくれます。',
        '`:translate: ○○` とつぶやくと、excite翻訳してくれます。'
    ];
    var joinNotifyTalk = notifyTalk.join("\n");
    bot.reply(message, joinNotifyTalk);

});

controller.hears(['機能一覧'], 'direct_message,direct_mention,mention', function (bot, message) {

    var functionTalk = [
        '`こんにちは`, `おはよう` にはいくつかのパターンの反応をします。',
        '`じゃんけん` と呼びかけると、じゃんけんをすることができます。',
        '`詳しい天気` と呼びかけると、今の詳しい天気予報をお知らせします。',
        '`天気` と呼びかけると、18時以前は今日の・18時以降は明日の天気予報をお知らせします。',
        '`なす` とつぶやくと、なすの反応が来ます。',
        '`iPhone10` とつぶやくと、iPhone10っぽい反応をします。',
        '`おみくじ` と呼びかけると、その日のおみくじできます。',
        '`旅行先` と呼びかけると、おすすめの旅行先を教えてくれます。',
        '`○○って呼んで` と呼びかけると、○○にある文字列であなたの名前を忘れるまで覚えます。',
        '`○○でお店を検索` と呼びかけると、○○のキーワードでホットペッパーグルメの検索をします。○○は半角スペースでAnd検索できます。',
        '`○○でニュース検索` と呼びかけると、ニコニコニュース検索します。○○は半角スペースでAnd検索できます。',
        '`○○でニコニコ検索` と呼びかけると、ニコニコ動画検索します。○○は半角スペースでAnd検索できます。',
        '`○○って何` と呼びかけると、○○についてwikipedia検索します。',
        '`nomu ○○` とつぶやくと、ファイナルファンタジー風に翻訳してくれます。',
        '`:excite: ○○` とつぶやくと、excite再翻訳してくれます。',
        '`:translate: ○○` とつぶやくと、excite翻訳してくれます。'
    ];
    var joinFunctionTalk = functionTalk.join("\n");
    bot.reply(message, joinFunctionTalk);

});

controller.hears(['nomu (.*)'], 'direct_message,ambient', function (bot, message) {
    var matches = message.text.match(/nomu ?(.*)/i);
    var words = matches[1];
    var client = require('cheerio-httpcli');

    client.setBrowser('chrome');
    client.fetch('http://racing-lagoon.info/nomu/translate.php').then(function (result) {
        var form = result.$('form[name=form]');

        form.field({
            before: words,
            level: 4,
            options: 'nochk'
        });

        form.find('input[type=submit]').click(function (err, $, res, body) {
            var m = $('textarea[name=after1]').val();
            bot.reply(message, m);
        });
    })
});

controller.hears([':excite: (.*)'], 'direct_message,ambient', function (bot, message) {
    var matches = message.text.match(/:excite: ?(.*)/i);
    var words = matches[1];
    var client = require('cheerio-httpcli');

    client.fetch('http://www.excite.co.jp/world/').then(function (result) {
        return result.$('#formTrans').submit({
            auto_detect: 'on',
            before: words,
            reverse_option: true
        });
    })
    .then(function (result) {
        bot.reply(message, result.$('#reverse').val());
    });
});

controller.hears([':translate: (.*)'], 'direct_message,ambient', function (bot, message) {
    var matches = message.text.match(/:translate: ?(.*)/i);
    var words = matches[1];
    var client = require('cheerio-httpcli');

    client.fetch('http://www.excite.co.jp/world/').then(function (result) {
        return result.$('#formTrans').submit({
            auto_detect: 'on',
            before: words
        });
    })
    .then(function (result) {
        bot.reply(message, result.$('#after').val());
    });
});


//=========================================================
// 名前を覚える(データを保存する)
//=========================================================

// Botが、シャットダウン/再起動するまでの間、データを保持する事ができます。

// 保存、取得、削除、すべて削除 の4つの操作ができます。

//  [例]
//    controller.storage.users.save({id: message.user, foo:'bar'}, function(err) { ... });
//    controller.storage.users.get(id, function(err, user_data) {...});
//    controller.storage.users.delete(id, function(err) {...});
//    controller.storage.users.all(function(err, all_user_data) {...});


// Botkitは、「ユーザー」「チャンネル」「チーム」ごとにデータを保持できます。
// それぞれ、下記のように呼び出せます。

//  [例]
//    controller.storage.users.***
//    controller.storage.channels.***
//    controller.storage.teams.***

controller.hears(['お御籤', '御御籤', 'お神籤', '御神籤', 'おみくじ'], 'direct_message,direct_mention,mention', function (bot, message) {

    var omikujiArray = ['吉' ,'小吉' ,'大吉' ,'中吉' ,'半吉' ,'末小吉' ,'末吉' ,'凶' ,'半凶' ,'小凶' ,'末凶' ,'大凶', '古', ':oguri:', 'キチ', '区', '(๑•̀ㅂ•́)و✧'];
    var omikujiResult = omikujiArray[Math.floor(Math.random() * omikujiArray.length)];

    bot.reply(message, '*' + omikujiResult + '*');
});

controller.hears(['こんにちは'], 'direct_message,direct_mention,mention', function (bot, message) {

    // bot.reply()で、botに発言をさせます。
    var helloTalk = [
        'こんにちは！私は *Botkit製のBot* です！',
        'こんにちは！調子はいかがですか？',
        'こんにちは！ :oguri: ',
        'こんにちは！ `○○って呼んで`って話しかけると、名前を忘れるまで覚えますよ!',
        'こんにちは！こんにちは！こんにちは！こんにちは！こんにちは！',
    ];
    var selectHelloTalk = helloTalk[Math.floor(Math.random() * helloTalk.length)];
    bot.reply(message, selectHelloTalk);

});

controller.hears(['おはよう'], 'direct_message,direct_mention,mention', function (bot, message) {

    var today = new Date().toLocaleDateString();
    var morningTalk = [
        'おはようございます！今日は' + today + 'です。',
        'おはようございます！今日も一日頑張るぞい！',
        'おはようございます！今日も張り切ってまいりましょう！',
        'おはようございます！ご機嫌いかがですか？',
        'おはようございます！朝ごはんは食べましたか？'
    ];
    var selectMorningTalk = morningTalk[Math.floor(Math.random() * morningTalk.length)];
    bot.reply(message, selectMorningTalk);

});

controller.hears(['くわしい天気', '詳しい天気'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.reply(message, "詳しい天気情報を取得しています...");
    bot.startConversation(message, function (err, convo) {
        var http = require('http');
        http.get("http://weather.livedoor.com/forecast/webservice/json/v1?city=130010", function (result) {
            var body = '';
            result.setEncoding('utf8');
            result.on('data', function(data) {
                body += data;
            });
            result.on('end', function(data) {
                var v = JSON.parse(body);
                var description = v.description;
                convo.say(description);
                convo.next();
            });
        });
    });
});

controller.hears(['天気', 'てんき'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.reply(message, "天気情報を取得しています...");
    bot.startConversation(message, function (err, convo) {
        var http = require('http');
        http.get("http://weather.livedoor.com/forecast/webservice/json/v1?city=130010", function (result) {
            var time = new Date();
            var dateCond = time.getHours() < 18 ? "今日" : "明日";
            var body = '';
            result.setEncoding('utf8');
            result.on('data', function(data) {
                body += data;
            });
            result.on('end', function(data) {
                var v = JSON.parse(body);
                var weather = v.forecasts[0];
                if (time.getHours() < 18) {
                    var weather = v.forecasts[0];
                } else {
                    var weather = v.forecasts[1];
                }
                try {
                    convo.say(weather.dateLabel + "の" + v.title + "は" + weather.telop + "です。最高気温は" + weather.temperature.max.celsius + "度です！");
                    convo.next();
                } catch (e) {
                    convo.say("エラーだよ！");
                    convo.next();
                }
            });
        });
    });
});

controller.hears(['旅行先'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {
    function getCity(prefecture) {
        var http = require('http');
        var urlCity = "http://geoapi.heartrails.com/api/json?method=getCities&prefecture="
        var encodePrefecture = encodeURI(prefecture)
        http.get(urlCity + encodePrefecture, function (res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(data) {
                body += data;
            });
            res.on('end', function(data) {
                var c = JSON.parse(body);
                cities = c.response.location;
                city = cities[Math.floor(Math.random() * cities.length)];
                bot.reply(message, '*' + prefecture + city.city + '* に行ってみましょう！:airplane_departure:');
            });
        });
    }

    function getPrefecture() {
        var http = require('http');
        var urlPrefecture = "http://geoapi.heartrails.com/api/json?method=getPrefectures";
        http.get(urlPrefecture, function (res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(data) {
                body += data;
            });
            res.on('end', function(data) {
                var p = JSON.parse(body);
                prefectures = p.response.prefecture;
                pref = prefectures[Math.floor(Math.random() * prefectures.length)];
                getCity(pref)
            });
        });
    }

    getPrefecture();
});

controller.hears(['(.+)って何'], 'direct_message,direct_mention,mention', function (bot, message) {
    var thing = message.match[1];
    var encodeThing = encodeURI(thing);
    bot.reply(message, thing + "を調べています...");
    bot.startConversation(message, function (err, convo) {
        var http = require('http');
        http.get("http://wikipedia.simpleapi.net/api?output=json&keyword=" + encodeThing, function (result) {
            var body = '';
            result.setEncoding('utf8');
            result.on('data', function(data) {
                body += data;
            });
            result.on('end', function(data) {
                var v = JSON.parse(body);
                if (v === null) {
                    convo.say(thing + 'が見つかりませんでした。');
                    convo.next();
                } else {
                    convo.say(v[0].body);
                    convo.next();
                }
            });
        });
    });
});

controller.hears(['(.+)でニュース検索'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {
    var thing = message.match[1];
    var encodeThing = encodeURI(thing);
    bot.reply(message, thing + "のニュースを探しています...");
    bot.startConversation(message, function (err, convo) {
        var http = require('http');
        var url = "http://api.search.nicovideo.jp/api/v2/news/contents/search?targets=title,tags&fields=contentId,title,startTime&_context=rejobot&_limit=10&_sort=startTime&q=" + encodeThing;
        http.get(url, function (result) {
            var body = '';
            result.setEncoding('utf8');
            result.on('data', function(data) {
                body += data;
            });
            result.on('end', function(data) {
                var m = JSON.parse(body);
                var nicoArray = [];
                var datas = m.data;
                if (datas) {
                    if (datas.length > 0) {
                        datas.forEach(function(val) {
                            nicoArray.push(val.title + " : http://nico.ms/" + val.contentId + " 公開日: " + new Date(val.startTime).toLocaleString());
                        });
                        convo.say(nicoArray.join('\n'));
                        convo.next();
                    } else {
                        convo.say('みつかりませんでした。');
                        convo.next();
                    }
                } else {
                    convo.say(m.meta.errorMessage);
                    convo.next();
                }
            });
        });
    });
});

controller.hears(['(.+)でニコニコ検索'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {
    var thing = message.match[1];
    var encodeThing = encodeURI(thing);
    bot.reply(message, thing + "のニコニコ動画を探しています...");
    bot.startConversation(message, function (err, convo) {
        var http = require('http');
        var url = "http://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search?targets=title,tags&fields=contentId,title,viewCounter&_context=slackbot&_limit=10&_sort=-viewCounter&q=" + encodeThing;
        http.get(url, function (result) {
            var body = '';
            result.setEncoding('utf8');
            result.on('data', function(data) {
                body += data;
            });
            result.on('end', function(data) {
                var m = JSON.parse(body);
                var nicoArray = [];
                var datas = m.data;
                if (datas) {
                    if (datas.length > 0) {
                        datas.forEach(function(val) {
                            nicoArray.push(val.title + " : http://nico.ms/" + val.contentId + " 再生数: " + val.viewCounter);
                        });
                        convo.say(nicoArray.join('\n'));
                        convo.next();
                    } else {
                        convo.say('みつかりませんでした。');
                        convo.next();
                    }
                } else {
                    convo.say(m.meta.errorMessage);
                    convo.next();
                }
            });
        });
    });
});

controller.hears(['(.+)でお店を検索'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {
    var http = require('http');
    var thing = message.match[1];
    var encodeWord = encodeURI(thing);
    url = 'http://webservice.recruit.co.jp/hotpepper/shop/v1/?key=' + process.env.hotpepperKey +'&format=json&keyword=' + encodeWord;
    bot.reply(message, thing + "でお店を調べています...");
    bot.startConversation(message, function (err, convo) {
        http.get(url, function (result) {
            var body = '';
            var shopArray = [];
            result.setEncoding('utf8');
            result.on('data', function(data) {
                body += data;
            });
            result.on('end', function(data) {
                var v = JSON.parse(body);
                var r = v.results;
                if (r.shop) {
                    if (r.shop.length > 0) {
                        r.shop.forEach(function(val) {
                            shopArray.push(val.name + ' : ' + val.urls.pc);
                        });
                        convo.say(shopArray.join('\n'));
                        convo.next();
                    } else {
                        convo.say('ヒットしませんでした');
                        convo.next();
                    }
                } else {
                    convo.say('見つからないかヒット数が多すぎるのでキーワードを整理してください');
                    convo.next();
                }
            });
        });
    });
});

controller.hears(['(.+)って呼んで'], 'direct_message,direct_mention,mention', function (bot, message) {

    // 「◯◯って呼んで」の、◯◯の部分を取り出します。
    // message.match[1] には、hearsの正規表現にマッチした単語が入っています。

    var name_from_msg = message.match[1];


    // まず、controller.storage.users.getで、ユーザーデータを取得します。

    // message.userには、ユーザーIDが入っています。
    // ユーザーデータは、ユーザーIDと紐付けていますので、第一引数には、必ずmessage.userを入れます。

    controller.storage.users.get(message.user, function (err, user_info) {

        // ▼ データ取得後の処理 ▼

        // ユーザーデータが存在しているかどうか調べる
        // ※第二引数で指定した変数(ここでは'user_info')に、ユーザーデータが入っています。
        if (!user_info) {

            // ▼ ユーザーデータがなかった場合の処理 ▼

            // ユーザーidとユーザー名 のオブジェクトを、user_infoとして作成します。
            user_info = {
                id: message.user,
                name: name_from_msg
            };

        }

        // user_infoを保存します。
        controller.storage.users.save(user_info, function (err, id) {

            // ▼ 保存完了後の処理▼

            bot.reply(message, 'あなたのお名前は *' + user_info.name + '* さんですね！忘れるまで覚えておきます！');

        });

    });

});

controller.hears(['iPhone10'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {

    bot.reply(message, "iPhone10!!!");
    var https = require('https');
    var url = "https://slack.com/api/chat.postMessage?token=" + process.env.token + "&channel=%23" + process.env.botChannel + "&text=%3Alongiphone1%3A%0A%3Alongiphone2%3A%0A%3Alongiphone3%3A%0A%3Alongiphone4%3A&username=iphone10&icon_emoji=%3Alongiphone1%3A%3Alongiphone2%3A%3Alongiphone3%3A%3Alongiphone4%3A&pretty=1"
    https.get(url);

});

controller.hears(['じゃんけん'], 'direct_message,direct_mention,mention', function (bot, message) {

    function sayAiko(convo) {
        convo.say('あいこですね。また遊びましょう！:wink:');
    }

    function sayWin(convo) {
        convo.say('私の勝ちです！じゃんけん強いのがばれましたね:muscle:。また遊びましょう！:blush:');
    }

    function sayLose(convo) {
        controller.storage.users.get(message.user, function (err, user_info) {

            if (user_info && user_info.name) {
                var yourName = user_info.name + "さん";
            } else {
                var yourName = "あなた";
            }
            convo.say('あなたの勝ちです！:congratulations:' + yourName + "はお強いのですね:sushi:。また遊びましょう！:hugging_face:");
        });
    }

    bot.reply(message, 'じゃんけんですか？いいですね！:fist::v::hand:');

    // 会話を開始します。
    bot.startConversation(message, function (err, convo) {
        var jankenRPS = ["r", "s", "p"];
        var selectJanken = jankenRPS[Math.floor(Math.random() * jankenRPS.length)];
        // convo.ask() で質問をします。
        convo.ask('じゃんけーん... `グー` `チョキ` `パー`', [
            {
                pattern: 'グー', // マッチさせる単語
                callback: function (response, convo) {
                    if (selectJanken === "r") {
                        convo.say("グー！");
                        sayAiko(convo);
                    } else if (selectJanken === "s") {
                        convo.say("チョキ！");
                        sayLose(convo);
                    } else if (selectJanken === "p") {
                        convo.say("パー！");
                        sayWin(convo);
                    } else {
                        convo.say("すみません。じゃんけんができませんでした。また遊びましょう！:+1:");
                    }
                    convo.next();
                }
            },
            {
                pattern: 'チョキ',
                callback: function (response, convo) {
                    if (selectJanken === "r") {
                        convo.say("グー！");
                        sayWin(convo);
                    } else if (selectJanken === "s") {
                        convo.say("チョキ！");
                        sayAiko(convo);
                    } else if (selectJanken === "p") {
                        convo.say("パー！");
                        sayLose(convo);
                    } else {
                        convo.say("すみません。じゃんけんができませんでした。また遊びましょう！:+1:");
                    }
                    convo.next();
                }
            },
            {
                pattern: 'パー',
                callback: function (response, convo) {
                    if (selectJanken === "r") {
                        convo.say("グー！");
                        sayLose(convo);
                    } else if (selectJanken === "s") {
                        convo.say("チョキ！");
                        sayWin(convo);
                    } else if (selectJanken === "p") {
                        convo.say("パー！");
                        sayAiko(convo);
                    } else {
                        convo.say("すみません。じゃんけんができませんでした。また遊びましょう！:+1:");
                    }
                    convo.next();
                }
            },
            {
                default: true,
                callback: function (response, convo) {

                    // ▼ どのパターンにもマッチしない時の処理 ▼

                    convo.say('よくわかりませんでした。また遊びましょう');
                    convo.next(); // 会話を次に進めます。この場合、最初の質問にも戻ります。
                }
            }
        ]);

    })

});



//=========================================================
// 絵文字リアクション
//=========================================================

controller.hears(['ハイタッチ'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.reply(message, 'ハイタッチ！');

    // 絵文字リアクションを追加
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'raising_hand', // ここで絵文字名を指定します (例 : smilely, muscle など)
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err); // エラーが出たとき用の出力
        }
    });

});

controller.hears(['なす', 'ナス', '茄子', 'なすび'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.reply(message, ':oguri:');

    // 絵文字リアクションを追加
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'oguri', // ここで絵文字名を指定します (例 : smilely, muscle など)
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err); // エラーが出たとき用の出力
        }
    });

});

//=========================================================
// どれにも当てはまらなかった場合の返答
//=========================================================

// controller.hears()には優先順位があり、上のものから優先にマッチします。
// すべてにマッチするhears()を、一番最後に記述すれば、
// 「当てはまらなかった場合の返答」を作成できます。

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var thing = message.match[1];
    var encodeThing = encodeURI(thing);
    var http = require('http');
    var url = "http://yukari-factory.com/api/v1/yukari_sentences/random?word=" + encodeThing;
    bot.startConversation(message, function (err, convo) {
        http.get(url, function (res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(data) {
                body += data;
            });
            res.on('end', function(data) {
                var m = JSON.parse(body);
                convo.say(m.result);
                convo.next();
            });
        });
    });
});
