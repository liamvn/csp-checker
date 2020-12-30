const puppeteer = require('puppeteer');
const fs = require('fs');
const urls = fs.readFileSync('urls.txt').toString().split('\r\n');

puppeteer.launch().then(async browser => {
  const promises = [];

  let index = 1;
  const urlsLen = urls.length;
  const results = [];

  for (const elem of urls) {
    const url = elem;
    console.log(`Running page: ${url} (${index}/${urlsLen}) \n`);
    index++;

    promises.push(browser.newPage().then(async page => {
      await page.on('console', msg => {
        const text = msg.text()
        const refusedCSP = text.search(/Refused.*Content Security Policy/g)
        if (refusedCSP >= 0) {
          results.push({
            result: 'FAILED',
            page: url,
            message: text
          })
        }
      });
      await page.goto(url);
    }))
  }

  await Promise.all(promises).then(() => {
    fs.writeFileSync('results.json',  JSON.stringify(results));
  })
  browser.close();
});