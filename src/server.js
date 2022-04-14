import express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import { moviesJsonPath, getMovies } from './lib/fs-tools.js'
import mediaRouter from './services/media/index.js'
import { badRequestErrorHandler, genericErrorHandler, notFoundErrorHandler, unauthorizedErrorHandler } from './errorHandlers.js'
import {join} from 'path'

const app = express()

const PORT = process.env.PORT || 4001

const publicFolderPath = join(process.cwd(), './public') 

app.use(express.static(publicFolderPath))
app.use(cors())
app.use(express.json())

app.use('/media/', mediaRouter)


// ERROR HANDLERS
app.use(badRequestErrorHandler)
app.use(unauthorizedErrorHandler)
app.use(notFoundErrorHandler)
app.use(genericErrorHandler)

app.listen(PORT, ()=> {
    console.log(`App is listening on ${PORT}`)
    console.table(listEndpoints(app))
})