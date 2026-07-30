import { Company } from "../models/index.js";
import { uploadFile } from "../utils/upload.js";

export const registerCompany = async (req, res) => {
  const { companyName, description, website, location, industry } = req.body;
  const userId = req.id;

  try {
    if (!companyName) {
      return res.status(400).json({ message: "Company name is required", success: false });
    }

    const existing = await Company.findOne({ where: { name: companyName } });
    if (existing) {
      return res.status(400).json({ message: "Company already registered", success: false });
    }

    const newCompany = await Company.create({
      name: companyName,
      description: description || "",
      website: website || "",
      location: location || "",
      industry: industry || "Information Technology",
      userId,
    });

    return res.status(201).json({
      message: "Company registered successfully!",
      success: true,
      company: newCompany,
    });
  } catch (error) {
    console.error("Register Company Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.findAll({ where: { userId } });
    return res.status(200).json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found", success: false });
    return res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location, industry } = req.body;
    const file = req.file;

    const companyId = req.params.id;
    const company = await Company.findByPk(companyId);

    if (!company) return res.status(404).json({ message: "Company not found", success: false });

    if (name) company.name = name;
    if (description) company.description = description;
    if (website) company.website = website;
    if (location) company.location = location;
    if (industry) company.industry = industry;

    if (file) {
      const uploadRes = await uploadFile(file, "companies");
      if (uploadRes) company.logo = uploadRes.url;
    }

    await company.save();

    return res.status(200).json({ message: "Company profile updated successfully!", success: true, company });
  } catch (error) {
    console.error("Update Company Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
