require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const booksRouter = require('./routes/books')


app.set('view engine', 'ejs')
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))



app.use(express.json())


app.use('/', indexRouter)
app.use('/books', booksRouter)

app.listen(3000, () => console.log('Server Started'))


