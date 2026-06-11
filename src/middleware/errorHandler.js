const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erro interno do servidor';

    console.error(`[ERROR] ${statusCode}: ${message}`);

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            status: statusCode
        }
    });
};

export default errorHandler;