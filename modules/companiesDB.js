const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema({
    "name": String,
    "permalink": String,
    "crunchbase_url": String,
    "homepage_url": String,
    "blog_url": String,
    "blog_feed_url": String,
    "twitter_username": String,
    "category_code": String,
    "number_of_employees": Number,
    "founded_year": Number,
    "founded_month": Number,
    "founded_day": Number,
    "deadpooled_year": Number,
    "deadpooled_month": Number,
    "deadpooled_day": Number,
    "deadpooled_url": String,
    "tag_list": String,
    "alias_list": String,
    "email_address": String,
    "phone_number": String,
    "description": String,

    "overview": String,
    "image": {},
    "products": [],
    "relationships": [],
    "competitions": [],
    "providerships": [],
    "total_money_raised": String,
    "funding_rounds": [],
    "investments": [],
    "acquisition": {},
    "acquisitions": [],
    "offices": [],
    "milestones": [],
    "ipo": {},
    "video_embeds": [],
    "screenshots": [],
    "external_links": [{
        "external_url": String,
        "title": String
    }],
    "partners": []
});

module.exports = class companiesDB {
  constructor() {
    // We don't have a `Company` object until initialize() is complete
    this.Company = null;
  }

  // Pass the connection string to `initialize()`
  initialize(connectionString) {
    return new Promise((resolve, reject) => {
      const db = mongoose.createConnection(
        connectionString,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );

      db.once('error', (err) => {
        reject(err);
      });
      db.once('open', () => {
        this.Company = db.model("companies", companySchema);
        resolve();
      });
    });
  }

  async addNewCompany(data) {
    const newCompany = new this.Company(data);
    await newCompany.save();
    return newCompany;
  }

  getAllCompanies(page, perPage, tag) {
    let findBy = tag ? { tag_list: new RegExp(tag, "i") } : {};

    if (+page && +perPage) {
      return this.Company.find(findBy).sort({ year: +1 }).skip((page - 1) * +perPage).limit(+perPage).exec();
    }

    return Promise.reject(new Error('page and perPage query parameters must be valid numbers'));
  }

  getCompanyByName(name) {
    // return this.Company.findOne({ name: name }).exec();
    return this.Company.findOne({ name: new RegExp('^' + name + '$', "i") }).exec();
  }

  updateCompanyByName(data, name) {
    return this.Company.updateOne({ name: name }, { $set: data }).exec();
  }

  deleteCompanyByName(name) {
    return this.Company.deleteOne({ name: name }).exec();
  }
}