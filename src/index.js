const puppeteer = require('puppeteer');
const cron = require('node-cron');
require('dotenv').config();

const userId = process.env.USER_ID;
const password = process.env.PASSWORD;

async function login(page) {    
    try {
        console.log('ログイン処理を開始します'); 
        await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/login');
        await page.type('input[name="loginId"]', userId);
        await page.type('input[name="password"]', password);
        await page.click('button.v-btn.v-btn--contained.primary');
        await page.waitForNavigation(5000);
        console.log('ログイン完了');
    } catch (error) {
        console.error('ログインエラー:', error);
    }
}

async function performClock(action) {
    console.log('ブラウザ起動中...');
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    console.log('新しいページを開きました。');

    // 位置情報を偽装
    try {
        const context = browser.defaultBrowserContext();
        await context.overridePermissions('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/top', ['geolocation']);
        await page.setGeolocation({
            latitude: 34.67536300091403,
            longitude: 135.49971632649746,
        });
        console.log('位置情報を設定しました。');
    } catch (error) {
        console.error('位置情報設定エラー:', error);
    }
    await login(page);
    await clock(page, action); // 出勤または退勤を実行
    await browser.close();
    console.log('ブラウザを閉じました。');
}

// 1時間ごとに実行
cron.schedule('0 * * * *', async () => {
    console.log('cronジョブが実行されました');
    
    // 日本の現在時刻を取得
    const currentHour = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }).split(" ")[1].split(":")[0];

    // 現在の時刻によって処理を分ける
    if (currentHour === '09') {
        console.log('9時出勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    } else if (currentHour === '12') {
        console.log('12時退勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    } else if (currentHour === '13') {
        console.log('13時再出勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    } else if (currentHour === '18') {
        console.log('18時退勤');
        await performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    } else {
        console.log('時間外です。'); // 時間外の場合のメッセージ
    }
});
