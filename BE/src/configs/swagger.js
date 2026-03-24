import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { env } from './environment.js'

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SaaS Multi-Vendor E-Commerce API',
            version: '1.0.0',
            description: 'API Documentation cho hệ thống SaaS của Chú 6',
        },
        servers: [
            { url: `http://localhost:${env.PORT || 5000}/api/v1`, description: 'Development Server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/v1/*.js'],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)

export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
    console.log(`📑 Swagger Docs available at http://localhost:${env.PORT || 5000}/api-docs`)
}