import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  database: "world",
  host: "localhost",
  password: "postgres",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query("select country_code from visited_countries");
  const countries = [];
  console.log(result.rows);
  result.rows.forEach((row) => countries.push(row.country_code));
  res.render("index.ejs", { countries: countries, total: result.rowCount });
  //Write your code here.
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
