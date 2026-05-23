export class BusinessLogicError extends Error { // custom error class for business logic fails. e.g, bad input, unauthorized
    constructor(msg, statusCode = 400) {
        super(msg);
        this.statusCode = statusCode; // attach the HTTP error code so the error handler can use it in response
        this.name = "BusinessLogicError"; // change default error name from Error for easier identification
    }
}
