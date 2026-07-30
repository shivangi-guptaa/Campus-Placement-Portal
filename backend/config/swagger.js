import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "University Campus Placement & Internship Management System API",
      version: "1.0.0",
      description:
        "Production-Grade REST API for University Placement Drives, Eligibility Verification, Raw SQL Analytics, and Interview Scheduling.",
      contact: {
        name: "SkillSync TPO Portal Support",
        email: "tpo@university.edu",
      },
    },
    servers: [
      {
        url: "http://localhost:8000/api",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./backend/routes/*.js", "./routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
