module.exports = {
    ServerPort: process.env["PORT"] || 3000,

    // DatabaseUrl: process.env["DATABASE_URL"] || "mongodb://localhost:27017/Cource"
    DatabaseUrl: "mongodb://localhost:27001,localhost:27002,localhost:27003/Cource?replicaSet=My_Replica_Set"
}