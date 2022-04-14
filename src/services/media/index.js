import express from "express";
import { getMovies, writeMovies } from "../../lib/fs-tools.js";
import uniqid from 'uniqid'
import createError from "http-errors";


const mediaRouter = express.Router()


// 1. POST NEW MOVIE 
mediaRouter.post('/', async(req, res, next) => {
    try {
        const movies = await getMovies()
        const newMovie = {
            ...req.body,
            _id: uniqid()
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


export default mediaRouter