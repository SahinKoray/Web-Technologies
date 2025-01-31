// Importam modulele necesare
import express from 'express'; // Framework pentru servere web
import { Sequelize } from 'sequelize'; // ORM pentru interactiunea cu baza de date

// Configuram conexiunea la baza de date SQLite
const conn = new Sequelize({
    dialect: 'sqlite', // Specificam tipul bazei de date
    storage: 'library.db' // Fisierul unde se salveaza datele
});

// Definim modelul "Book" care reprezinta o tabela in baza de date
const Book = conn.define('book', {
    title: Sequelize.STRING, // Coloana pentru titlul cartii de tip string
    author: Sequelize.STRING, // Coloana pentru autorul cartii de tip string
    genre: Sequelize.STRING, // Coloana pentru genul cartii de tip string
    year: Sequelize.INTEGER // Coloana pentru anul publicarii de tip integer
});

// Sincronizam baza de date si cream/actualizam tabelele pe baza modelelor
try {
    await conn.sync({ alter: true }); // Alter modifica tabelul pentru a reflecta schimbarile in model
} catch (error) {
    console.warn(error); // Afisam eventualele erori
}

// Cream o aplicatie Express
const app = express();

// Configuram serverul sa serveasca fisiere statice din directorul "public"
app.use(express.static('public'));

// Permitem interpretarea datelor JSON in cererile HTTP
app.use(express.json());

// Endpoint pentru verificarea functionarii serverului
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'pong' }); // Raspuns de test "pong"
});

// Endpoint pentru a prelua toate cartile
app.get('/books', async (req, res, next) => {
    try {
        const books = await Book.findAll(); // Obtine toate inregistrarile din tabelul "books"
        res.status(200).json(books); // Returneaza lista de carti in format JSON
    } catch (error) {
        next(error); // Transmite erorile mai departe
    }
});

// Endpoint pentru a adauga o carte noua
app.post('/books', async (req, res, next) => {
    try {
        let newBook = req.body; // Preia detaliile cartii din corpul cererii
        const book = await Book.create(newBook); // Creeaza si salveaza cartea in baza de date
        res.status(201).json(book); // Returneaza cartea creata
    } catch (error) {
        next(error); // Transmite erorile mai departe
    }
});

// Endpoint pentru a prelua o carte dupa ID
app.get('/books/:id', async (req, res, next) => {
    try {
        const book = await Book.findByPk(req.params.id); // Cauta o carte dupa cheia primara (ID)
        if (book) {
            res.status(200).json(book); // Returneaza cartea gasita
        } else {
            res.status(404).json({ message: 'not found' }); // Returneaza mesaj de eroare daca nu este gasita
        }
    } catch (error) {
        next(error); // Transmite erorile mai departe
    }
});

// Endpoint pentru a actualiza o carte dupa ID
app.put('/books/:id', async (req, res, next) => {
    try {
        const book = await Book.findByPk(req.params.id); // Cauta cartea dupa ID
        if (book) {
            // Actualizeaza detaliile cartii
            book.title = req.body.title;
            book.author = req.body.author;
            book.genre = req.body.genre;
            book.year = req.body.year;
            await book.save(); // Salveaza modificarile in baza de date
            res.status(202).json(book); // Returneaza cartea actualizata
        } else {
            res.status(404).json({ message: 'not found' }); // Returneaza mesaj de eroare daca nu este gasita
        }
    } catch (error) {
        next(error); // Transmite erorile mai departe
    }
});

// Endpoint pentru a sterge o carte dupa ID
app.delete('/books/:id', async (req, res, next) => {
    try {
        const book = await Book.findByPk(req.params.id); // Cauta cartea dupa ID
        if (book) {
            await book.destroy(); // Sterge cartea din baza de date
            res.status(204).json({}); // Returneaza raspuns gol cu status 204
        } else {
            res.status(404).json({ message: 'not found' }); // Returneaza mesaj de eroare daca nu este gasita
        }
    } catch (error) {
        next(error); // Transmite erorile mai departe
    }
});

// Middleware pentru gestionarea erorilor
app.use((error, req, res, next) => {
    console.warn(error); // Afiseaza eroarea in consola
    res.status(500).json({ message: 'server error' }); // Returneaza raspuns de eroare generic
});

// Pornirea serverului pe portul 8080
app.listen(8080);