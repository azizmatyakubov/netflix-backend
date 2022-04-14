import fs from 'fs-extra'
import {join} from 'path'


const {readJson, writeJson} = fs

export const moviesJsonPath = join(process.cwd(), './src/data/movies.json')
export const imagePublicFolderPath = join(process.cwd(), './public/image')

export const getMovies = () => readJson(moviesJsonPath)
export const writeMovies = (content) => writeJson(moviesJsonPath, content)


export const saveCoverMovie = (filename, contentAsBuffer) => fs.writeFile(join(imagePublicFolderPath, filename), contentAsBuffer)