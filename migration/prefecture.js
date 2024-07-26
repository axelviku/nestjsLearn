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
      const sourceCollection = sourceDb.collection('prefectures');
      const destinationCollection = destinationDb.collection('prefectures');
  
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
        let data = d;   
        data._id = d._id;
        data.name={en : d.name}
        data.name.jp = d.name_jap;
        data.isActive = d.status;

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
