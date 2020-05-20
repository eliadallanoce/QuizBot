const telegramBot = require('node-telegram-bot-api');
const token = '1171240003:AAGRQsiP-BXG37RPf03gRx821nqoKqo2Nik';
const bot = new telegramBot(token, { polling: true });
const sqlite3 = require('sqlite3').verbose();
const vorpal = require('vorpal')();
var Table = require('cli-table');
var colors = require('colors/safe');
var site = require('./site.js');
let db = new sqlite3.Database('./QuizBot.db', (err) => {
    if (err) {
        console.log(err.message);
    }
});

//BOT
bot.onText(/\/regole/, (msg) => {
    var chat_id = msg.chat.id;
    var back = {
        "inline_keyboard": [
            [{ text: "Indietro", callback_data: "ind" }]
        ]
    };
    var regole = "Il giocatore deve rispettare le norme di gioco.\n" +
        "L'utente dopo aver letto il regolamento può avviare il gioco, rispondendo alle 5 domande proposte," +
        " ciascuna con un valore preciso.\nDomanda 1=10 punti\nDomanda 2=30 punti\nDomanda 3=50 punti\nDomanda 4=70punti\n" +
        "Domanda 5=100 punti";
    bot.sendMessage(chat_id, "<b>Regole:\n</b>" + regole, {
        parse_mode: 'HTML',
        reply_markup: back
    });
    bot.on("callback_query", (query) => {
        var data = query.data;
        if (data === 'ind') {
            bot.deleteMessage(chat_id, query.message.message_id, back);
        }
    });
});
bot.onText(/\/info/, (msg) => {
    var chat_id = msg.chat.id;
    var back = {
        "inline_keyboard": [
            [{ text: "Indietro", callback_data: "ind" }]
        ]
    };
    bot.sendMessage(chat_id, "<b>Info:</b>\n- Sviluppato da Elia Dallanoce\n- Creato Maggio 2020\n- Lingua: Italiano", {
        parse_mode: 'HTML',
        reply_markup: back
    });
    bot.on("callback_query", (query) => {
        var data = query.data;
        if (data === 'ind') {
            bot.deleteMessage(chat_id, query.message.message_id, back);
        }
    });
});

function SelezionaDomanda(chatid, mess, valore, sql, punti) {
    let query = "SELECT count(Id_Domanda) as 'id' FROM Domande WHERE Valore=?";
    db.get(query, [valore], (err, row) => {
        if (err)
            return console.error(err.message);
        var IdRandom = Math.floor(Math.random() * (row.id - 1)) + 1;
        Domanda(chatid, IdRandom, mess, valore, sql, punti);
    });
}
function Domanda(chatid, IdRandom, mess, valore, sql, punti) {
    db.get(sql, [IdRandom, valore], (err, row) => {
        if (err)
            return console.error(err.message);
        bot.editMessageText("<b>Domanda</b>:\n" + row.Domanda, {
            chat_id: chatid,
            message_id: mess,
            parse_mode: "HTML"
        });
        SelezionaRisposta(chatid, IdRandom, punti);
        return row
            ? console.log(row.Domanda)
            : console.log('Nessuna domanda con Id=' + IdRandom);
    });
}

//ADMIN
vorpal
    .command('aggDom [valore] [domanda...]', 'Aggiungi una domanda')
    .action(function (args, callback) {
        var domanda = args.domanda.join(' ');
        var valore = args.valore;
        AggiungiDomanda(domanda, valore);
        console.log(colors.yellow("Domanda inserita!"));
        callback();
    });
vorpal
    .command('aggRisp [fk_domanda] [correttezza] [risposta...]', 'Aggiungi una risposta')
    .action(function (args, callback) {
        var risposta = args.risposta.join(' ');
        var fk_domanda = args.fk_domanda;
        var corret = args.correttezza;
        AggiungiRisposta(risposta, corret, fk_domanda);
        console.log(colors.yellow("Risposta inserita!"));
        callback();
    });
vorpal
    .command('elimDom [id_domanda]', 'Elimina la domanda')
    .action(function (args, callback) {
        var id_dom = args.id_domanda;
        RimuoviDomanda(id_dom);
        console.log(colors.yellow("Domanda Id=" + id_dom + " eliminata!"));
        callback();
    });
vorpal
    .command('elimRisp [id_risposta]', 'Elimina la risposta')
    .action(function (args, callback) {
        var id_risp = args.Id_risposta;
        RimuoviRisposta(id_risp);
        console.log(colors.yellow("Risposta Id=" + id_risp + " eliminata!"));
        callback();
    });
vorpal
    .command('modDom [valore] [id_domanda] [domanda...]', 'Modifica la domanda')
    .action(function (args, callback) {
        var dom = args.domanda.join(' ');
        var val = args.valore;
        var id_dom = args.id_domanda;
        ModificaDomanda(dom, val, id_dom);
        console.log(colors.yellow("Domanda Id=" + id_dom + " modificata!"));
        callback();
    });
vorpal
    .command('modRisp [fk_domanda] [id_risposta] [risposta...]', 'Modifica la risposta')
    .action(function (args, callback) {
        var risp = args.risposta.join(' ');
        var fk_dom = args.fk_domanda;
        var id_risp = args.Id_risposta;
        ModificaRisposta(risp, fk_dom, id_risp);
        console.log(colors.yellow("Risposta Id=" + id_dom + " modificata!"));
        callback();
    });
vorpal
    .command('VisDom', 'Mostra tutte le domande')
    .action(function (args, callback) {
        LeggiDomande();
        callback();
    });
vorpal
    .command('VisDomVal [valore]', 'Mostra tutte le domande con un valore specificato')
    .action(function (args, callback) {
        var val = args.valore;
        LeggiDomandeVal(val);
        callback();
    });
vorpal
    .command('VisRispDom [fk_domanda]', 'Mostra tutte le risposte associate a una domanda')
    .action(function (args, callback) {
        var fk_dom = args.fk_domanda;
        LeggiRisposteDom(fk_dom)
        callback();
    });
    vorpal
    .command('VisUt', 'Mostra tutti gli utenti')
    .action(function (args, callback) {
        VisualizzaUtenti();
        callback();
    });
    vorpal
    .command('aggUt [nome] [cognome] [username] [password]', 'Aggiungi un utente')
    .action(function (args, callback) {
        var nome = args.nome;
        var cognome = args.cognome;
        var username= args.username;
        var password= args.password;
        AggiugniUtente(nome, cognome, username, password);
        console.log(colors.yellow("Utente inserito!"));
        callback();
    });
    vorpal
    .command('elimUt [id]', 'Elimina un utente')
    .action(function (args, callback) {
        var id_ut = args.id;
        RimuoviUtente(id_ut);
        console.log(colors.yellow("Utente inserito!"));
        callback();
    });
vorpal
    .delimiter('Admin>') 
    .show();


function AggiugniUtente(nome, cognome, username, password)
{
    var sql = "INSERT INTO Utenti(Nome, Cognome, Username, Password) VALUES(?, ?, ?, ?)";
    db.run(sql, [nome, cognome, username, password], (err) => {
        if (err)
            return console.log(err.message);
    });
}
function RimuoviUtente(id_ut)
{
    var sql = "DELETE FROM Utenti WHERE Id_Utente= ?";
    db.run(sql, id_ut, (err) => {
        if (err)
            return console.log(err.message);
    });
}
function VisualizzaUtenti()
{
    var table = new Table({
        head: ['Id', 'Nome', 'Cognome', 'Username', 'Password'],
        colWidths: [5, 20, 20, 20, 20],
        style: { head: ['green'], border: ['red'] }
    });
    var sql = "SELECT * FROM Utenti";
    db.all(sql, [], (err, rows) => {
        if (err)
            return console.log(err.message);
        rows.forEach((row) => {
            table.push([row.Id_Utente, row.Nome, row.Cognome, row.Username,row.Password]);
        });
        console.log(colors.yellow("Utenti:"));
        console.log(table.toString());
    });
}
function AggiungiDomanda(domanda, valore) {
    var sql = "INSERT INTO Domande(Domanda, Valore) VALUES(?, ?)";
    db.run(sql, [domanda, valore], (err) => {
        if (err)
            return console.log(err.message);
    });
}
function AggiungiRisposta(risposta, corret, fk_domanda) {
    var sql = "INSERT INTO Risposte(Risposta, Fk_Domanda, Correttezza) VALUES(?, ?, ?)";
    db.run(sql, [risposta, fk_domanda, corret], (err) => {
        if (err)
            return console.log(err.message);
    });
}
function RimuoviDomanda(id_dom) {
    var sql = "DELETE FROM Domande WHERE Id_Domanda= ?";
    db.run(sql, id_dom, (err) => {
        if (err)
            return console.log(err.message);
    });
}
function RimuoviRisposta(id_risp) {
    var sql = "DELETE FROM Risposte WHERE Id_Risposta= ?";
    db.run(sql, id_risp, (err) => {
        if (err)
            return console.log(err.message);
    });
}
function ModificaDomanda(dom, val, id_dom) {
    var sql = "UPDATE Domande SET Domanda=? AND Valore=? WHERE Id_Domanda= ?";
    db.run(sql, [dom, val, id_dom], (err) => {
        if (err)
            return console.log(err.message);
    });
}
function ModificaRisposta(risp, fk_dom, id_risp) {
    var sql = "UPDATE Risposte SET Risposta=? AND Fk_Domanda=? WHERE Id_Risposta=?";
    db.run(sql, [risp, fk_dom, id_risp], (err) => {
        if (err)
            return console.log(err.message);
    });
}
function LeggiDomande() {
    var table = new Table({
        head: ['Id', 'Domanda', 'Valore'],
        colWidths: [5, 75, 10],
        style: { head: ['green'], border: ['red'] }
    });
    var sql = "SELECT * FROM Domande";
    db.all(sql, [], (err, rows) => {
        if (err)
            return console.log(err.message);
        rows.forEach((row) => {
            table.push([row.Id_Domanda, row.Domanda, row.Valore]);
        });
        console.log(colors.yellow("Domande:"));
        console.log(table.toString());
    });

}
function LeggiDomandeVal(val) {
    var table = new Table({
        head: ['Id', 'Domanda'],
        colWidths: [5, 75],
        style: { head: ['green'], border: ['red'] }
    });
    var sql = "SELECT * FROM Domande WHERE Valore=?";
    db.all(sql, [val], (err, rows) => {
        if (err)
            return console.log(err.message);
        rows.forEach((row) => {
            table.push([row.Id_Domanda, row.Domanda]);
        });
        console.log(colors.yellow("Domande:"));
        console.log(table.toString());
    });
}
function LeggiRisposteDom(fk_dom) {
    var table = new Table({
        head: ['Id', 'Risposta', 'Correttezza'],
        colWidths: [5, 20, 10],
        style: { head: ['green'], border: ['red'] }
    });
    var sql = "SELECT * FROM Risposte WHERE Fk_Domanda=?";
    db.all(sql, [fk_dom], (err, rows) => {
        if (err)
            return console.log(err.message);
        rows.forEach((row) => {
            table.push([row.Id_Risposta, row.Risposta, row.Correttezza]);
        });
        console.log(colors.yellow("Risposte:"));
        console.log(table.toString());
    });
}

