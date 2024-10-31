/**
 * @type {import('next').NextConfig}
 */


const cron = require('node-cron');

const fetch = require('node-fetch');

const axios = require('axios');

const cheerio = require('cheerio');

cron.schedule('59 8 * * *', async function () {
  const vcbUrl = "https://vietabank.com.vn/tien-ich/ty-gia/ty-gia-ngoai-te.html";

  const header = [
      "code", "name","rateTM","rateCk","rateBan"
  ]
  
  await axios
  .get(vcbUrl)
  .then(({data: html}) => {
    const $ = cheerio.load(html);
    const data = [...$("table")].map(table => {
      return [...$(table).find("> tbody > tr")].splice(2,13).map(tr =>
        Object.fromEntries(
          [...$(tr).find("> td")]
            .map((td, i) => [header[i], $(td).text().trim()])
            .filter(e => Boolean(e[1]))
        )
      );
    });

    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      element.map((e) => {
          fetch("http://localhost:3000/api/currency/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  currency: e.code,
                  rate: e.rateCk === "-" ? 0 : parseFloat(e.rateCk.replace(",","")),
                  date: new Date()
              }),
          }).then(async (res) => {
            let data = await res.json();
            console.log(data);
          }).catch(err => {
            console.log(err);
          });
      })
    }
  })
  .catch(err => console.error(err));
}, null, true, 'Asia/Ho_Chi_Minh');


const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["prisma", "@prisma/client"],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
})
