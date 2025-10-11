const VARIABLES = {
    BASE_URL: process.env.MONOLITH_API_BASE_URL || "http://localhost:8000",
    NEXT_SESSION_SECRET: process.env.NEXT_SESSION_SECRET || "default-secret",
};

export default VARIABLES;