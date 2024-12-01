import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from "cheerio"
const TelegramBot = require('node-telegram-bot-api');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');


const fs = require('fs');


@Injectable()
export class AppService {
    products = [''];
    lastProduct = this.products[0];
    token = process.env.TELEGRAM_BOT_TOKEN;
    bot = new TelegramBot(this.token, {polling: true});
    idAdmin = process.env.CHAT_ID;
    
    async scraper() {
    console.log('startscraper', process.env.TELEGRAM_BOT_TOKEN);

    const searchString = 'морозильная+камера';
    

    const options = new chrome.Options();
    options.addArguments('--headless'); 
    options.addArguments('--disable-gpu'); 
  
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    try {
      await driver.get(`https://www.avito.ru/kazan/bytovaya_tehnika?cd=1&q=${searchString}&s=104`);
      

      await driver.sleep(2000); 
  

      const html = await driver.getPageSource();

      fs.writeFile('output1.html', html, (err) => {
        if (err) {
            console.error('Ошибка при записи в файл:', err);
        } else {
            console.log('Данные успешно записаны в файл!');
        }});

      const $ = cheerio.load(html);
      $('.iva-item-title-CdRXl a').each((index, element) => {
        if($(element).attr('href') === this.lastProduct) {
          this.lastProduct = this.products[1];
          return false;
        }
      this.products.push($(element).attr('href'))
  });
    } finally {
      await driver.quit();
    }
    
    // const response = await axios.get(`https://www.avito.ru/kazan/bytovaya_tehnika?cd=1&q=${searchString}&s=104`,{
    //   headers: {
    //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    //   }
    // });
    // const html = response.data;
    // const $ = cheerio.load(html);
  //   fs.writeFile('output.txt', html, (err) => {
  //     if (err) {
  //         console.error('Ошибка при записи в файл:', err);
  //     } else {
  //         console.log('Данные успешно записаны в файл!');
  //     }
  // });
  
  

  }

  async sendMessageBot() {
    console.log('this.products.length',this.products.length);

    while (this.products.length>1) {
      // console.log(this.products.pop());
      const url = "https://www.avito.ru" + this.products.pop();
      console.log('url', url);
      


      const options = new chrome.Options();
    options.addArguments('--headless'); 
    options.addArguments('--disable-gpu'); 
  
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    try {
      await driver.get(url);

      await driver.sleep(2000); 
  
      const html = await driver.getPageSource();
      fs.writeFile('output.txt', html, (err) => {
            if (err) {
                console.error('Ошибка при записи в файл:', err);
            } else {
                console.log('Данные успешно записаны в файл!');
            }});
      const $ = cheerio.load(html);
      const price = $('.style-price-value-mHi1T.style-item-price-main-jpt3x.style-itemPriceMainRedesign-_YK41 span span span').attr('content');
      const description = $('.style-item-description-text-mc3G6 p').text();
      const address = $('.style-item-address__string-wt61A').text();
      const data = {
        url,
        price,
        description,
        address
      }
      const message = `Цена ${data.price}\nОписание ${description}\nАдрес ${address}\n${url}`
      this.bot.sendMessage(this.idAdmin, message);
      console.log('data', data);
      
    } finally {
      await driver.quit();
    }


      // const response = await axios.get(url,{
      //   headers: {
      //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      //   },
      //   timeout: 80000,
      // });
      // const html = response.data;
      // const $ = cheerio.load(html);
      // const price = $('.style-price-value-mHi1T.style-item-price-main-jpt3x.style-itemPriceMainRedesign-_YK41 span span span').attr('content');
      // const description = $('.style-item-description-text-mc3G6 p').text();
      // const address = $('.style-item-address__string-wt61A').text();
      // const data = {
      //   url,
      //   price,
      //   description,
      //   address
      // }
      // const message = `Цена ${data.price}\nОписание ${description}\nАдрес ${address}\n${url}`
      // this.bot.sendMessage(this.idAdmin, message);
      // console.log('data', data);
    }

  }

  async checkProduct() {
    console.log("dd", this.products.length);
  }

}
