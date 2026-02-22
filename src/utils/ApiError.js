class ApiError extends Error{
    constructor(statusCode, message="Error occurred", errors = [])
    {
        super(message)
        this.statusCode=statusCode
        this.success=false
        this.errors=errors
    }
}

export {ApiError}