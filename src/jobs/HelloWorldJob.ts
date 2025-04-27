import { JobBase } from '@be/resque/JobBase';
import { SharedQueue } from '@be/resque/SharedQueue';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { inject, singleton } from 'tsyringe';

export interface HelloWorldJobParams {
    name: string;
    age?: number;
}

@singleton()
export class HelloWorldJob extends JobBase<HelloWorldJobParams> {
    readonly queueName = 'hello-world';
    readonly jobName = 'sayHello';

    constructor(@inject(SharedQueue) sharedQueue: SharedQueue, @inject(LoggerRegistry) loggerRegistry: LoggerRegistry) {
        super(sharedQueue, loggerRegistry.getLogger('HelloWorldJob'));
    }

    async processor(params: HelloWorldJobParams): Promise<void> {
        this.logger.info(`👋 Hello, ${params.name}! Age: ${params.age ?? 'unknown'}`);
    }
}
