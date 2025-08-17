import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const port = dotenv.PORT || 9000;

app.get("/check", (req, res) => {
    res.json("This is working fine");
})

app.listen(port, err => {
    if (err) throw new Error(err);
    console.log(`Port is running on ${port} : Test on http://localhost:${port}/check`)
})