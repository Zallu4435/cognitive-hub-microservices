import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'KAFKA_CLIENT',
                useFactory: () => {
                    const isProd = process.env.NODE_ENV === 'production';
                    const kafkaSaslUsername = process.env.KAFKA_SASL_USERNAME || '';
                    const kafkaSaslPassword = process.env.KAFKA_SASL_PASSWORD || '';

                    return {
                        transport: Transport.KAFKA,
                        options: {
                            client: {
                                brokers: [(process.env.KAFKA_BROKER_URL || 'localhost:9092')],
                                ssl: isProd && !!kafkaSaslUsername,
                                sasl: kafkaSaslUsername ? {
                                    mechanism: 'scram-sha-256' as const,
                                    username: kafkaSaslUsername,
                                    password: kafkaSaslPassword,
                                } : undefined,
                            },
                            producerOnlyMode: true,
                        },
                    };
                },
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class KafkaModule { }
