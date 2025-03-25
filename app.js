import express from "express";
const app = express();
const PORT = 8088;
import axios from "axios";
import session from "express-session";
import { engine } from "express-handlebars"
import flash from "express-flash";
import dotenv from "dotenv"

//config

    // Dotenv
    dotenv.config();

    // Session
    if(!process.env.SECRET_SESSION) {
        throw new Error("Secret not found in the .env");
    }
    app.use(session({
        secret: process.env.SECRET_SESSION,
        resave: true,
        saveUninitialized: true
    }));

    // Flash
    app.use(flash());

    // request-Parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Globals
    app.use((req, res, next) => {
        res.locals.successMsg = req.flash('successMsg');
        res.locals.errorMsg = req.flash('errorMsg');
        next();
    });

    // Handlebars
    app.engine('handlebars', engine({
        defaultLayout: 'main'
    }));
    app.set('view engine', 'handlebars');
    app.set('views', './views');





app.get('/', async (req, res) => {
    res.render('home.handlebars')
});

app.post('/search-brazil-location-code', async (req, res) => {

    try {
        const BASE_URL = `https://viacep.com.br/ws/`;

        const LOCATION_CODE = req.body.zip;

        // verify the CEP digits
        if (LOCATION_CODE.length !== 8) {
            req.flash('errorMsg', `It's only 8 digits, without the dash.`)
            return res.redirect('/');
        };
    
        const URL = `${BASE_URL}${LOCATION_CODE}/json/`;
        
        // searching in the web the location-code
        const LOCATION_RES = await axios.get(URL);

        const CEP = LOCATION_RES.data.cep

        // Verify the response before show in the screen
        if(!CEP || CEP == "") {
            req.flash('errorMsg', `Invalid CEP. Please try again.`)
            return res.redirect('/');
        }
        else {
            // store in the session the CEP JSON
            req.session.locationData = LOCATION_RES.data;
            res.redirect('/location-result');
        }
        

    } catch (err) {
        req.flash("errorMsg", `There was an error searching the CEP: ${err}`);
        res.redirect('/');
    };

});

app.get('/location-result', (req, res) => {
    res.render('locationResult', { locationData: req.session.locationData });
})


app.listen(PORT, () => {
console.log(`App running in the PORT ${PORT}`)
});