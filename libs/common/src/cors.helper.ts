import { INestApplication } from '@nestjs/common';

export function setupCors(app: INestApplication) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4000')
        .split(',')
        .map((o) => o.trim());

    app.enableCors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: Origin '${origin}' not allowed`));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
}
