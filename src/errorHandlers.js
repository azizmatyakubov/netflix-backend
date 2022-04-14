export const badRequestErrorHandler = (err, req, res, next) => {
    if(err.status === 400) {
        res.status(400).send({ message: err.message, errorsList: err.errorsList })
    }
    else {
        next(err)
    }
}

export const unauthorizedErrorHandler = (err, req, res, next) => {
    if(err.status === 401) {
        res.status(401).send({message: err.message, errorsList: err.errorsList})
    } else {
        next(err)
    }
}


export const notFoundErrorHandler = (err, req, res, next) => {
    if(err.status === 404) {
        res.status(404).send({message: err.message, errorsList: err.errorsList})
    } 
    else {
        next(err)
    }
}

export const genericErrorHandler = (err, req, res, next) => {
    res.status(500).send({message: 'Generic Server Error !!!'})
}