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
const gettingVisitedCountries = async () => {
  const result = await db.query("select country_code from visited_countries");
  const countries = [];
  result.rows.forEach((row) => countries.push(row.country_code));
  return countries;
};

app.get("/", async (req, res) => {
  const countries = await gettingVisitedCountries();
  res.render("index.ejs", { countries: countries, total: countries.length });
  //Write your code here.
});

app.post("/add", async (req, res) => {
  const upperCountryCode = req.body.country;

  const country_code_result = await db.query(
    `select country_code from countries where Lower(country_name) like '%' || $1 || '%'`,
    [upperCountryCode.toLowerCase()]
  );
  if (country_code_result.rows.length !== 0) {
    const data = country_code_result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "Insert into visited_countries(country_code) values ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await gettingVisitedCountries();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } else {
    const countries = await gettingVisitedCountries();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Wrong country entered, please try again",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
