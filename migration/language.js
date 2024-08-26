const { MongoClient } = require('mongodb');
const config = require('./dbConfig');
const mongoose = require('mongoose');



async function transferDataWithAggregation() {
    const sourceClient = new MongoClient(config.sourceDB.url);
    await sourceClient.connect();
    const sourceDb = sourceClient.db(config.sourceDB.database);
    
    const destinationClient = new MongoClient(config.destinationDB.url);
    await destinationClient.connect();
    const destinationDb = destinationClient.db(config.destinationDB.database);
  
    try {
      const sourceCollection = sourceDb.collection('languages');
      const destinationCollection = destinationDb.collection('languages');
  
      // Define your aggregation pipeline
      const pipeline = [
        {
          $match: {is_deleted: false }
        },
        // {

        //   $limit:1
        // }

      ];
  
      const cursor = sourceCollection.aggregate(pipeline);
  
      //console.log(cursor);
      // Insert data into destination collection in batches
      const batchSize = cursor.length;
      let batch = [];
  
      while (await cursor.hasNext()) {

        const d = await cursor.next();
        let data = {};
        data._id = d._id;
      
        data.name = {
            jp: (d.name_jap) ? d.name_jap : '',
            fr : (d.name_fr) ? d.name_fr : '',
            zh : (d.name_zh) ? d.name_zh : '',
            pt : (d.name_pt) ? d.name_pt : '',
            ko : (d.name_ko) ? d.name_ko : '',
            es : (d.name_es) ? d.name_es : '',
            vi : (d.name_vi) ? d.name_vi : '',
            tl : (d.name_tl) ? d.name_tl : '',
            id : (d.name_id) ? d.name_id : '',
            my : (d.name_my) ? d.name_my : '',
            en : (d.name) ? d.name : '',
        };
        data.isActive =  (d.is_deleted==false) ? true : false;

        // console.log(data);
        batch.push(data);
        if (batch.length === batchSize) {
        try {
          await destinationCollection.insertMany(batch);
          batch = [];
        } catch (insertErr) {
            console.error('Error inserting document:', insertErr);
          }
        }
      }
  
      // Insert any remaining documents
      if (batch.length > 0) {
        await destinationCollection.insertMany(batch);
      }
  
      console.log('Data transfer completed successfully!');
    } catch (err) {
      console.error('Error during data transfer:', err);
    } finally {
      await sourceClient.close();
      await destinationClient.close();
    }
  }
  
  transferDataWithAggregation();
