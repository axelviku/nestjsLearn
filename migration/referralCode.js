const { MongoClient,ObjectId } = require('mongodb');
const config = require('./dbConfig');



async function transferDataWithAggregation() {
    const sourceClient = new MongoClient(config.sourceDB.url);
    await sourceClient.connect();
    const sourceDb = sourceClient.db(config.sourceDB.database);
    
    const destinationClient = new MongoClient(config.destinationDB.url);
    await destinationClient.connect();
    const destinationDb = destinationClient.db(config.destinationDB.database);
  
    try {
      const sourceCollection = sourceDb.collection('referral_codes');
      const destinationCollection = destinationDb.collection('referral_codes');
  
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
        data.name = d.name;
        data.codeType = d.type;
        data.referralCode = d.referral_code;
        data.description = d.description;
        data.assignedSpecificInterpreters = d.ec_interpreter_associates;
        data.isCreditCardShown = (d.credit_card=="Yes") ? true : false;
        data.isCallRateShown = d.is_price_shown;
        data.isFreeCallApply = (d.free_minutes) ? true: false;
        data.isReferralAdmin = (d.referral_admin_id) ? true : false;
        if(d.referral_admin_id){
          const userCollection = sourceDb.collection('users');
          const referalAdmin = await userCollection.findOne({_id:new ObjectId(d.referral_admin_id)});

          data.referralAdminDetails = {
            emailAddress: referalAdmin?.email,
            referralAdminId: d.referral_admin_id,
          };
        }
        

        data.freeCallConditions = {
          allowedCallLimit : 100,
          assignedFreeCallMinutes : (d.free_minutes) ? parseInt(d.free_minutes) : 0
        }
        data.callingPriceCalculation = {
            referralDiscountPercentage: parseInt(d.referral_discount_percentage),
            referralAdminRevenuePercentage: 5,
            oyraaEarningPercentage: 35,
            interpreterEarningPercentage: 60,
            oyraaEarningPercentageWithDiscount: 40 - d.referral_discount_percentage,
        };
       
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
