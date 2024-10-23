    const puppeteer = require('puppeteer');
    const cron = require('node-cron');
    require('dotenv').config();

    const userId = process.env.USER_ID;
    const password = process.env.PASSWORD;

    // ログイン関数
    async function login(page) {
    await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/login');
    await page.type('#user_id', userId);
    await page.type('#password', password);
    await page.click('button');
    await page.waitForNavigation();
    console.log('ログイン完了');
    }

    // 出勤/退勤を実行する関数
    async function clock(page, action) {
    await page.goto('https://rklacrosse.rakurakukintai.jp/NMy5Xnk8USa/top');
    await page.click(action);  // actionには、出勤ボタンまたは退勤ボタンのセレクタを入れる
    console.log(`${action} 完了`);
    }

    // 自動打刻を行う関数
    async function performClock(action) {
    const browser = await puppeteer.launch({ headless: false });
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

    // 9時出勤
    cron.schedule('0 9 * * *', () => {
    console.log('9時出勤');
    performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    });

    // 12時退勤
    cron.schedule('0 12 * * *', () => {
    console.log('12時退勤');
    performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    });

    // 13時再出勤
    cron.schedule('0 13 * * *', () => {
    console.log('13時出勤');
    performClock('.v-btn.v-btn--contained.theme--light.v-size--large.primary'); // 出勤ボタンのセレクタを指定
    });

    // 18時退勤
    cron.schedule('0 18 * * *', () => {
    console.log('18時退勤');
    performClock('.v-btn.v-btn--contained.theme--light.v-size--large'); // 退勤ボタンのセレクタを指定
    });
