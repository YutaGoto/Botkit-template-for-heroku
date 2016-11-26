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

controller.hears(['こんにちは'], 'direct_message,direct_mention,mention', function (bot, message) {

    // bot.reply()で、botに発言をさせます。
    bot.reply(message, 'こんにちは！私は *Botkit製のBot* です！ \n _まだそこまでいろんなことができません。_ :sweat_smile:');

});

controller.hears(['昼ごはん', 'ランチ', 'おなかすいた', 'お腹すいた', 'はらへった'], 'direct_message,direct_mention,mention', function (bot, message) {

    var lunch = ['中華', 'そば', 'にいむら', 'オリジンキッチン', 'もちもち', '丸亀製麺', '裏の中華']
    var lunch_talk = lunch[Math.floor(Math.random() * lunch.length)];
    bot.reply(message, lunch_talk);

});

controller.hears(['天気', 'てんき'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.reply(message, "天気情報を取得しています...");
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
            if (time.getHours() < 18) {
                var weather = v.forecasts[0];
            } else {
                var weather = v.forecasts[1];
            }
            console.log(weather.dateLabel + "の" + v.title + "は" + weather.telop + "です。最高気温は" + weather.temperature["max"]["celsius"] + "度です！")
        })
    });
});



//=========================================================
// 質問形式の会話
//=========================================================

controller.hears(['ラーメン'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.reply(message, ':ramen:いいですよね:grin:');

    // 会話を開始します。
    bot.startConversation(message, function (err, convo) {

        // convo.ask() で質問をします。
        convo.ask('私が何味が好きか当ててみてください！', [
            {
                pattern: '醤油', // マッチさせる単語
                callback: function (response, convo) {

                    // ▼ マッチした時の処理 ▼

                    convo.say('正解！:ok_woman:\n醤油！これぞ王道！:+1:'); // convo.say()で発言をします。
                    convo.next(); // convo.next()で、会話を次に進めます。通常は、会話が終了します。
                }
            },
            {
                pattern: '味噌',
                callback: function (response, convo) {
                    convo.say('正解！:ok_woman:\n寒いと味噌たべたくなります！:+1:');
                    convo.next();
                }
            },
            {
                default: true,
                callback: function (response, convo) {

                    // ▼ どのパターンにもマッチしない時の処理 ▼

                    convo.say('うーん、おしいです！:no_good:');
                    convo.repeat(); // convo.repeat()で、質問を繰り返します。
                    convo.next(); // 会話を次に進めます。この場合、最初の質問にも戻ります。
                }
            }
        ]);

    })

});



//=========================================================
// 絵文字リアクション
//=========================================================

controller.hears(['ハイタッチ'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {

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

controller.hears(['なす', 'ナス', '茄子', 'なすび'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {

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


controller.hears(['(.*)って呼んで'], 'direct_message,direct_mention,mention', function (bot, message) {


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



//=========================================================
// どれにも当てはまらなかった場合の返答
//=========================================================

// controller.hears()には優先順位があり、上のものから優先にマッチします。
// すべてにマッチするhears()を、一番最後に記述すれば、
// 「当てはまらなかった場合の返答」を作成できます。

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function (bot, message) {


    // ユーザーデータを取得
    controller.storage.users.get(message.user, function (err, user_info) {

        if (user_info && user_info.name) {

            // ▼ ユーザーデータが保存されていたときの処理 ▼
            var talk_pattern = [ 
                user_info.name + "さん呼びましたか",
                "お呼びですか？",
                "はい、今日はとても良い天気ですね",
                "呼んでみただけ、じゃないですよね？",
                "はい、なんでしょうか",
                "はい、今日はとても悪い天気ですね",
                "いかがなさいましたか",
                "はっ！どうしました？！",
                "はい、" + user_info.name + "さん",
                "はい",
                "グーッと背伸びをしましょう",
                "話題が尽きましたか？",
                "はい、なんでしょう？"
            ];
            var random_talk = talk_pattern[Math.floor(Math.random() * talk_pattern.length)];
            bot.reply(message, random_talk);

        } else {

            // ▼ ユーザーデータが保存されていなかった場合の処理 ▼

            bot.reply(message, 'はじめまして！\n`「◯◯って呼んで」`って話しかけると、名前を忘れるまで覚えますよ!');

        }
    });
});
