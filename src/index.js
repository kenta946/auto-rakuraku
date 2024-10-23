const puppeteer = require('puppeteer');
const cron = require('node-cron');
require('dotenv').config();

const userId = process.env.USER_ID;
const password = process.env.PASSWORD;

console.log('USER_ID:', userId);
console.log('PASSWORD:', password);

// ブラウザテスト
(async () => {
    console.log('Puppeteerのテスト起動を開始します');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('ブラウザが起動しました');
    await browser.close();
    console.log('ブラウザが正常に終了しました');
})();

async function login(page) {
    try {
        console.log('ログイン処理を開始します'); 
        await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/login');
        await page.type('input[name="loginId"]', userId);
        await page.type('input[name="password"]', password);
        await page.click('button');
        await page.waitForNavigation();
        console.log('ログイン完了');
    } catch (error) {
        console.error('ログインエラー:', error);
    }
}

async function performClock(action) {
    console.log('ブラウザ起動中...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    console.log('新しいページを開きました。');

    // 位置情報を偽装
    try {
        const context = browser.defaultBrowserContext();
        await context.overridePermissions('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/top', ['geolocation']);
        await page.setGeolocation({
            latitude: 34.67536300091403,  // キャリスタ緯度
            longitude: 135.49971632649746, // キャリスタの経度
        });
        console.log('位置情報を設定しました。');
    } catch (error) {
        console.error('位置情報設定エラー:', error);
    }

    await login(page); // ログインを実行
    await clock(page, action); // 出勤または退勤を実行
    await browser.close();
    console.log('ブラウザを閉じました。');
}


// 1時間ごとに実行
cron.schedule('0 * * * *', async () => {
    console.log('cronジョブが実行されました'); // 追加
    const currentHour = new Date().getHours(); // 現在の時刻を取得
    if (currentHour === 9) {
        console.log('9時出勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    } else if (currentHour === 12) {
        console.log('12時退勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    } else if (currentHour === 13) {
        console.log('13時再出勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    } else if (currentHour === 18) {
        console.log('18時退勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    } else {
        console.log('時間外です。'); // 時間外の場合のメッセージ
    }
});
