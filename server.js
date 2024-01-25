const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const CompaniesDB = require("./modules/companiesDB.js");
// Create an instance of the companiesDB module
const db = new CompaniesDB();

dotenv.config();
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());





// Define API routes
app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

app.post("/api/companies", async (req, res) => {
  try {
    const newCompany = await db.addNewCompany(req.body);
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(500).json({ error: "Unable to add a new company" });
  }
});

app.get("/api/companies", async (req, res) => {
  const { page, perPage, name } = req.query;
  try {
    const companies = await db.getAllCompanies(page, perPage, name);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch companies" });
  }
});

app.get("/api/company/:id", async (req, res) => {
  const companyId = req.params.id;
  try {
    const company = await db.getCompanyById(companyId);
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ error: "Company not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch company" });
  }
});

app.put("/api/company/:id", async (req, res) => {
  const companyId = req.params.id;
  try {
    const updatedCompany = await db.updateCompanyById(req.body, companyId);
    if (updatedCompany.nModified === 1) {
      res.json(updatedCompany);
    } else {
      res.status(404).json({ error: "Company not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Unable to update company" });
  }
});

app.delete("/api/company/:id", async (req, res) => {
  const companyId = req.params.id;
  try {
    const result = await db.deleteCompanyById(companyId);
    if (result.deletedCount === 1) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Company not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Unable to delete company" });
  }
});


// Initialize the MongoDB connection
db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is running on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Error initializing MongoDB: ${err}`);
  });