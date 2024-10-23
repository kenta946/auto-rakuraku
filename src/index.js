const puppeteer = require('puppeteer');
const cron = require('node-cron');
require('dotenv').config();

console.log('アプリケーションが起動しました');

const userId = process.env.USER_ID;
const password = process.env.PASSWORD;

async function login(page) {
    try {
        await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/login');
        await page.type('#user_id', userId);
        await page.type('#password', password);
        await page.click('button');
        await page.waitForNavigation();
        console.log('ログイン完了');
    } catch (error) {
        console.error('ログインエラー:', error);
    }
}

async function clock(page, action) {
    try {
        await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/top');
        await page.click(action);
        console.log(`${action} 完了`);
    } catch (error) {
        console.error(`${action} エラー:`, error);
    }
}

// 自動打刻を行う関数
async function performClock(action) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 位置情報を偽装
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/top', ['geolocation']);
    await page.setGeolocation({
        latitude: 34.67536300091403,  // キャリスタ緯度
        longitude: 135.49971632649746, // キャリスタの経度
    });

    await login(page); // ログインを実行
    await clock(page, action); // 出勤または退勤を実行
    await browser.close();
}

// 1時間ごとに実行
cron.schedule('0 * * * *', async () => {
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
