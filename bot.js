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
        '`○○って呼んで` の○○は一文字以上でないと反応しないように修正しました。',
        '何にもマッチしない単語・文章で呼びかけると、テキトーに反応します。'
    ];
    var joinNotifyTalk = notifyTalk.join("\n");
    bot.reply(message, joinNotifyTalk);

});

controller.hears(['機能一覧'], 'direct_message,direct_mention,mention', function (bot, message) {

    var functionTalk = [
        '`こんにちは`, `おはよう` にはいくつかのパターンの反応をします。',
        '`じゃんけん` と呼びかけると、じゃんけんをすることができます。',
        '`天気` と呼びかけると、18時以前は今日の・18時以降は明日の天気予報をお知らせします。',
        '`昼ごはん` と呼びかけると、昼ごはんにおすすめの場所をお知らせします。',
        '`なす` とつぶやくと、なすの反応が来ます。',
        '`○○って呼んで` と呼びかけると、○○にある文字列であなたの名前を忘れるまで覚えます。'
    ];
    var joinFunctionTalk = functionTalk.join("\n");
    bot.reply(message, joinFunctionTalk);

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

controller.hears(['こんにちは'], 'direct_message,direct_mention,mention', function (bot, message) {

    controller.storage.users.get(message.user, function (err, user_info) {
        if (user_info && user_info.name) {
            var yourName = user_info.name + "さん";
        } else {
            var yourName = "";
        }
    });

    // bot.reply()で、botに発言をさせます。
    var helloTalk = [
        'こんにちは！私は *Botkit製のBot* です！',
        'こんにちは！調子はいかがですか？',
        'こんにちは！ :oguri: ',
        'こんにちは！ `○○って呼んで`って話しかけると、名前を忘れるまで覚えますよ!'
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

controller.hears(['昼ごはん', 'おなかすいた', 'お腹すいた'], 'direct_message,direct_mention,mention', function (bot, message) {

    var lunch = ['中華', 'そば', 'にいむら', 'オリジンキッチン', 'もちもち', '丸亀製麺', '裏の中華', 'インドカレー', 'ココイチ', '代々木ビレッジ'];
    var lunch_talk = lunch[Math.floor(Math.random() * lunch.length)];
    bot.reply(message, lunch_talk + "で食べましょう！");

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
                convo.say(weather.dateLabel + "の" + v.title + "は" + weather.telop + "です。最高気温は" + weather.temperature.max.celsius + "度です！");
                convo.next();
            });
        });
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
// どれにも当てはまらなかった場合の返答
//=========================================================

// controller.hears()には優先順位があり、上のものから優先にマッチします。
// すべてにマッチするhears()を、一番最後に記述すれば、
// 「当てはまらなかった場合の返答」を作成できます。

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var http = require('http');
    var url = "http://yukari-factory.com/api/v1/yukari_sentences/random?word=" + message.text;
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
