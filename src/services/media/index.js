import express from "express";
import { getMovies, getMoviesReadableStream, saveCoverMovie, writeMovies } from "../../lib/fs-tools.js";
import uniqid from 'uniqid'
import createError from "http-errors";
import multer from "multer";
import {pipeline} from 'stream'
import json2csv from 'json2csv'
import { getPdfReadableStream } from "../../lib/pdf-tools.js";
import { createGzip } from "zlib";
import { sendEmail } from "../../lib/email-tools.js";

const mediaRouter = express.Router()


// DOWNLOAD JSON 
mediaRouter.get('/downloadJson', async (req, res, next) => {
    try {
        const source = getMoviesReadableStream()
        const trasform = createGzip()
        const destination = res
        res.setHeader("Content-Disposition", "attachment; filename=movies.json.gz")

        pipeline(source, trasform, destination, (err)=>{
            if(err) console.log(err)
        })
    } catch (error) {
        next(error)
    }
})

// DOWNLOAD CSV
mediaRouter.get('/downloadCsv', async(req, res, next) => {
    try {
        const source = getMoviesReadableStream()
        const trasform = new json2csv.Transform()
        const destination = res

        res.setHeader("Content-Disposition", "attachment; filename=movies.csv")

        pipeline(source, trasform, destination, (err)=>{
            if(!err){
                res.status(200).send('sent')
            } else {
                console.log(err)
            }
        })

        
    } catch (error) {
        next(error)
    }
})

mediaRouter.get('/downloadPdf', async(req, res, next) => {
    try {
        

        const users = ['a.matyaqubov0712@gmail.com']
        sendEmail(users, 'new download', 'You downloaded new pdf')
        
        res.setHeader("Content-Disposition", "attachment; filename=movie.pdf")
        const movies = await getMovies()
        const source = getPdfReadableStream(movies[0])
        const destination = res

        pipeline(source, destination, (err)=>{
            if(err) console.log(err)
        })
    } catch (error) {
        next(error)
    }
})

// 1. POST NEW MOVIE 
mediaRouter.post('/', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const newMovie = {
            ...req.body,
            _id: uniqid(),
            reviws: []
        }
        movies.push(newMovie)
        writeMovies(movies)
        res.status(201).send(newMovie)
    } catch (error) {
        next(error)
    }
})

// 2. GET ALL MOVIES 
mediaRouter.get('/', async(req, res, next) => {
    try {
        const movies = await getMovies()
        res.status(200).send(movies)
    } catch (error) {
        next(error)
    }
})

// 3. GET MOVIE BY ID 
mediaRouter.get('/:movieID', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const foundMovie = movies.find(movie => movie._id === req.params.movieID)
        if(foundMovie) {
            res.status(200).send(foundMovie)
        } else {
            next(createError(404, `movie with id ${req.params.movieID} not found`))
        }
    } catch (error) {
        next(error)
    }
})

// 4. CHANGE BY ID 
mediaRouter.put('/:movieID', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const indexOfMovie = movies.findIndex(movie => movie._id === req.params.movieID)
        if(indexOfMovie !== -1) {
            const oldMovie = movies[indexOfMovie]
            const updatedMovie = {...oldMovie, ...req.body, updatedAt: new Date()}
            movies[indexOfMovie] = updatedMovie
            writeMovies(movies)
            res.status(200).send(`movie with id ${req.params.movieID} changed`)
        } else {
            next(createError(404, `Post with id ${req.params.movieID} not found`))
        }
    } catch (error) {
        next(error)
    }
})

// 5. DELETE BY ID 
mediaRouter.delete('/:movieID', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const remainingPosts = movies.filter(movie => movie._id !== req.params.movieID)
        if(remainingPosts) {
            writeMovies(remainingPosts)
            res.status(200).send(`${req.params.movieID} is deleted`)
        }
    } catch (error) {
        next(error)
    }
})

// 6. POST REVIEW 
mediaRouter.post('/:movieID/reviews', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const indexOfMovie = movies.findIndex(movie => movie._id === req.params.movieID)
        if(indexOfMovie !== -1) {
            const comments = movies[indexOfMovie].reviews
            comments.push({...req.body, _id: uniqid(), createdAt: new Date()})
            writeMovies(movies)
            res.status(201).send('new comment added')
        } else {
            next(createError(404, `${req.params.movieID} not found`))
        }
    } catch (error) {
        next(error)
    }
})

// 7. GET ONLY REVIEWS 
mediaRouter.get('/:movieID/reviews', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const indexOfMovie = movies.findIndex(movie => movie._id === req.params.movieID)
        if(indexOfMovie !== -1) {
            const movieReview = movies[indexOfMovie].reviews
            console.log(movieReview)
            res.status(200).send(movieReview)
        }
    } catch (error) {
        next(error)
    }
})

// 8. DELETE REVIEW 
mediaRouter.delete('/:mediaID/reviews/:reviewID', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const indexOfMovie = movies.findIndex(movie => movie._id === req.params.mediaID)
        if(indexOfMovie !== -1) {
            const foundMovie = movies[indexOfMovie]
            const indexOfReview = foundMovie.reviews.findIndex(review => review._id === req.params.reviewID)
            if(indexOfReview !== -1) {
                const remainingReviews = foundMovie.reviews.filter(review => review._id !== req.params.reviewID)
                movies[indexOfMovie].reviews = remainingReviews
                writeMovies(movies)
                res.status(200).send(`${req.params.reviewID} is deleted`)

            } else {
                next(createError(404, `review with id ${req.params.mediaID} not found`))
            }
        } else {
            next(createError(404, `movie with id ${req.params.reviewID} not found` ))
        }
    } catch (error) {
        next(error)
    }
})

// 9. POST POSTER 
mediaRouter.post('/:movieID/poster', multer().single('coverMovie'), async(req, res, next) => {
    try {
        const movieID = req.params.movieID
        const url = `http://localhost:${process.env.PORT}/image/${movieID}.jpg`
        await saveCoverMovie(`${movieID}.jpg`, req.file.buffer)
        const movies = await getMovies()
        const foundMovie = movies.find(movie => movie._id === movieID)
        if(foundMovie) {
            foundMovie.Poster = url
            writeMovies(movies)
            res.status(201).send('cover added')
        } else {
            next(createError(404, `Movie with id ${movieID} not found`))
        }
    } catch (error) {
        next(error)
    }
})



export default mediaRouter