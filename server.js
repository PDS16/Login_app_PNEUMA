const express = require("express");
const app = express();
const {pool} = require("./dbConfig.js")
const PORT = process.env.PORT || 4000;
const session = require("cookie-session");
const flash = require("express-flash");
const path = require("path")
app.set("view engine","html");
app.engine('html', require('ejs').renderFile);

if (process.env.NODE_ENV === "production") {
    //server static content
    //npm run build
    app.use(express.static(path.join(__dirname, "views")));
  }  
app.use(express.urlencoded({extended : false}))
app.get("/", (req,res) => {
    res.render("login");
});

app.use(
    session({
        secret: "secret",

        resave: false,

        saveUninitialized: false
    })
);

app.use(flash());

app.get("/users/login", (req, res) => {
    res.render("logback");
  });

app.post("/users/login", (req,res) => {
      let {name, email, age, phone } = req.body;

      pool.query(
        `INSERT INTO users (name, email, age, phoneno)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name`,
        [name, email, age, phone],
        (err, results) => {
          if (err) {
            throw err;
          }
        //   console.log(results.rows);
          //req.flash("success_msg", "You are now registered. Please log in");
          pool.query(
            `SELECT * FROM users`,
            (err,results_table) =>{
                if (err) {
                    throw err;
                }
                // console.log(results_table.rows[0]['name']);
                res.render("dashboard.html", { table : results_table.rows, name : name, email : email, age : age, phone : phone});
                // if ( window.history.replaceState ) {
                //     window.history.replaceState( null, null, window.location.href );
                //   }
            }
        )
        }
      );
        
  })

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "views/login.html"));
  });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})