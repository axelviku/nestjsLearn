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
      const sourceCollection = sourceDb.collection('currencies');
      const destinationCollection = destinationDb.collection('currencies');
  
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
      ];
  
      //Define Query this side
      const cursor = sourceCollection.aggregate([]);
  
      // Insert data into destination collection in batches
      const batchSize = cursor.length;
      let batch = [];
  
      while (await cursor.hasNext()) {

        const d = await cursor.next();

        var exchangeRates = d.rates.map(function(rate) {
            // Rename currency to currency_name
            return {_id:rate._id,conversionToCurrency:rate.conversion_to,conversionValue:rate.price};
        });

        //make data for insertion data
        let data = {};
        data._id = d._id;
        data.name = d.name;
        data.baseCurrency = d.base;
        data.exchangeRates = exchangeRates;
        data.symbol = d.symbol;
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
