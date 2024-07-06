import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from 'common/schemas/country.schema';
import { City } from 'common/schemas/city.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ResourcesService {
    constructor(
        @InjectModel(Country.name) private countryModel: Model<Country>,
        @InjectModel(City.name) private readonly cityModel: Model<City>,
      ) { }
      async countryFind(req): Promise<object> {
        try {
          var getCountry = await this.countryModel.find({});
          console.log(req);
          const data = getCountry.map(country => ({
            _id: country._id,
            name: country.name[req]
          }));
          return {
            success: true,
            info: {
              country: data,
            },
            message:"Country Lists Fetch succesfully"
          };
        } catch (error) {
          console.error(error);
        }
      }
    
      async cityFind(req,countryid): Promise<object> {
        try {
          const countryId = new Types.ObjectId(countryid);
          var getCity = await this.cityModel.find({countryId:countryId});
    
          const data = getCity.map(city => ({
            _id : city._id,
            countryId : city.countryId,
            name : city.name[req]
          }));
          return {
            success: true,
            info: {
              city: data,
            },
            message:"City List Fetch succesfully"
          };
        } catch (error) {
          console.log(error);
        }
    
      }
}
