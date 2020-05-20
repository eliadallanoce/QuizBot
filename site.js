const express = require('express'); 
const app = express();
app.use('/CSS', express.static('CSS'));
app.use('/img', express.static( 'img' ) );
//const port = 3000; 
const ejs = require('ejs');
app.set("view engine", "ejs");
var port = process.env.PORT || 3000;
app.get('/', (req, res)=> res.send("ciaoo11"));
app.listen(port, ()=> console.log('server in ascolto:'+ port));
/*
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./QuizBot.db', (err) => {
    if (err) {
        console.log(err.message);
    }
});
app.use(express.urlencoded(
    {
        extended: true
    }));
    app.route("/")
    .get(function(req, res){
        res.render('pages/login');    
    })
    .post(function(req, res){
    var usern = req.body.username;
    var pass = req.body.password;
    var sql = "SELECT * FROM Utenti WHERE Username=? AND Password=?";
    db.get(sql, [usern, pass], (err, row) => {
        if (!row)
        {   
            res.send("Creadenziali errate");
        }
        else
        {
            res.redirect("/startpage"); 
        }
                
    }); 
})
app.route("/startpage")
.get(function(req, res){
res.render('pages/startpage');
})
app.route("/risposte")
.get(function(req, res){
    var sql = "SELECT * FROM Risposte";
    db.all(sql, [], (err, rows) => {
        if (err)
            return console.log(err.message);
            else
                res.render('pages/indexrisp', { testo: "Elenco Risposte del Quiz", risps: rows });
    }); 
})
app.route("/domande")
.get(function(req, res){
    var sql = "SELECT * FROM Domande";
    db.all(sql, [], (err, rows) => {
        if (err)
            return console.log(err.message);
            else
                res.render('pages/indexdom', { testo: "Elenco Domande del Quiz", doms: rows });
    }); 
})
app.route("/cercadom")
    .get(function(req, res)
    {
        var sql = "SELECT * FROM Domande WHERE Id_Domanda=?";
        db.all(sql, [req.query.id], (err, rows) => {
        if (err)
            return console.log(err.message);
            else{
                if (req.query.id)
                {
                    let cercaElemento = rows.find((dom) => (dom.Id_Domanda == req.query.id));
                    if (cercaElemento)
                    res.render('pages/cercadom', {  testo: "Domanda cercata:", cercaEl: cercaElemento });
                    else
                        res.send("Domanda non trovata!");
                }     
            }
            
    }); 
});
app.route("/cercarisp")
    .get(function(req, res)
    {
        var sql = "SELECT * FROM Risposte WHERE Id_Risposta=?";
        db.all(sql, [req.query.id], (err, rows) => {
        if (err)
            return console.log(err.message);
            else{
                if (req.query.id)
                {
                    let cercaElemento = rows.find((risp) => (risp.Id_Risposta == req.query.id));
                    if (cercaElemento)
                    res.render('pages/cercarisp', {  testo: "Domanda cercata:", cercaEl: cercaElemento });
                    else
                        res.send("Risposta non trovata!");
                }     
            }
            
    }); 
});
app.route("/aggiungirisp")
    .get(function(req, res){
        res.render("pages/aggiungirisp");
    })
    .post(function (req, res) {
        let risp = req.body.risposta;
        let corr = req.body.correttezza;
        var fk_dom= req.body.fk_domanda;
        var sql = "INSERT INTO Risposte(Risposta, Fk_Domanda, Correttezza) VALUES(?, ?, ?)";
        db.run(sql, [risp, fk_dom, corr], (err) => {
        if (err)
            return console.log(err.message);
    });
        res.redirect("/risposte");
    })
app.route("/aggiungidom")
    .get(function(req, res){
        res.render("pages/aggiungidom");
    })
    .post(function (req, res) {
        let dom = req.body.domanda;
        let val = req.body.valore;
        var sql = "INSERT INTO Domande(Domanda, Valore) VALUES(?, ?)";
        db.run(sql, [dom, val], (err) => {
        if (err)
            return console.log(err.message);
    });
        res.redirect("/domande");
    })
    app.route("/eliminadom")
    .get(function(req, res){
        res.render("pages/eliminadom");
    })
    .post(function(req, res)
    {
        var id_dom = req.body.id;
        var sql = "DELETE FROM Domande WHERE Id_Domanda= ?";
        db.run(sql, [id_dom], (err) => {
        if (err)
            { 
                res.send("Domanda non trovata");
                return console.log(err.message);
            }
            res.redirect("/domande");
    });    
    })
    app.route("/eliminarisp")
    .get(function(req, res){
        res.render("pages/eliminadom");
    })
    .post(function(req, res)
    {
        var id_risp = req.body.id;
        var sql = "DELETE FROM Risposte WHERE Id_Risposta= ?";
        db.run(sql, [id_risp], (err) => {
        if (err)
            { 
                res.send("Risposta non trovata");
                return console.log(err.message);
            }
            res.redirect("/risposte");
    });    
    })
    app.route("/modificadom")
    .get(function(req, res){
        res.render("pages/modificadom", {testo : "Modifica la domanda"});
    })
    .post(function(req, res)
    {
        var dom= req.body.domanda;
        var val = req.body.valore;
        var id_dom = req.body.id;
        var sql = "UPDATE Domande SET Domanda=? AND Valore=? WHERE Id_Domanda=?";
    db.run(sql, [dom, val, id_dom], (err) => {
        if (err)
        {
            res.send("Domanda non trovata!");
            return console.log(err.message);
        }
        res.redirect("/domande");      
    });      
    })
    app.route("/modificarisp")
    .get(function(req, res){
        res.render("pages/modificarisp", {testo : "Modifica la risposta"});
    })
    .post(function(req, res)
    {
        var id_risp= req.body.id;
        var risp= req.body.risposta;
        var fk_dom = req.body.fk_domanda;
        var corr = req.body.correttezza;
        var sql = "UPDATE Risposte SET (Risposta=? AND Fk_Domanda=? AND Correttezza=?) WHERE Id_Risposta=?";
    db.run(sql, [risp, fk_dom, corr, id_risp], (err) => {
        if (err)
        {
            res.send("Risposta non trovata!");
            return console.log(err.message);
        }
        
        */
        res.redirect("/risposte");      
    });      
    })

    app.get("/about", function (req, res) {
        res.render('pages/about');
    })
app.listen(port, () => console.log('il server è in ascolto sulla porta ' + port)); 
