// Created by Alex Girenko on 9/2/2016.
// (made on typescript with "target": "es6")
"use strict";
declare function require(name: string): any;
var mongo: any = require('then-mongo');

// saves array of object to mongoDb collection. Typescript is used because of "async" and "await" availability with "target": "es6").
// records are written synchronously one by one
const saveArrayToMongoDb = async function (conString: string, collectionName: string, arrayToInsert: any[], mainWindow: any) {
  var counter: number = 0;
  try {
    var colArr: string[] = [collectionName];
    var db: any = mongo(conString, colArr);
    var collection: any = db[collectionName];
    for (let item of arrayToInsert) {
      item['createdAt'] = new Date(); // requirement: to be compatible with parse.com schema
      await collection.insert(item, {}); // save records to mongodb one by one synchronously
      counter++;
    }
  }
  catch (ex) {
    mainWindow.webContents.send('error-message', 'Data writing error. ' + ex.message);
    return;
  }
  mainWindow.webContents.send('data-writing-completed', counter);
};


export {saveArrayToMongoDb};

