const { MongoClient } = require('mongodb');
const config = require('./dbConfig');



async function transferDataWithAggregation() {
    const sourceClient = new MongoClient(config.sourceDB.url);
    await sourceClient.connect();
    const sourceDb = sourceClient.db(config.sourceDB.database);
    
    const destinationClient = new MongoClient(config.destinationDB.url);
    await destinationClient.connect();
    const destinationDb = destinationClient.db(config.destinationDB.database);
  
    try {
      const sourceCollection = sourceDb.collection('countries');
      const destinationCollection = destinationDb.collection('countries');
  
      // Define your aggregation pipeline
      const pipeline = [
        {
          $match: { }
        },
        {
          $project: {  }
        },
        {
          $limit: 1000 // Example to limit the documents
        }
        // Add more stages as needed
      ];
  
      const cursor = sourceCollection.aggregate([]);
  
      // Insert data into destination collection in batches
      const batchSize = cursor.length;
      let batch = [];
  
      while (await cursor.hasNext()) {

        const d = await cursor.next();
        let data = {};   
        data._id = d._id;
        data.dialCode = d.countryCode;
        data.isoCode = d.countryIsoCode;
        data.flag = d.countryFlag;
        data.name={en : d.name}
        data.name.jp = d.name_jap;
        data.name.fr = d.name_fr;
        data.name.zh = d.name_zh;
        data.name.pt = d.name_pt;
        data.name.ko = d.name_ko;
        data.name.es = d.name_es;
        data.name.vi = d.name_vi;
        data.name.tl = d.name_tl;
        data.name.id = d.name_id;
        data.name.my = d.name_my;
        data.is_active = d.status;

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
