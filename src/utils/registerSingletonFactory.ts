import { type DependencyContainer, type InjectionToken, instanceCachingFactory } from 'tsyringe';

/**
 * Convenience for registering a singleton factory in Tsyringe.
 *
 * @param container - your DI container
 * @param token     - the class or token you want to register
 * @param factory   - a function that, given the container, returns a new instance
 */
export function registerSingletonFactory<T>(
    container: DependencyContainer,
    token: InjectionToken<T>,
    factory: (c: DependencyContainer) => T
): void {
    container.register<T>(token, {
        useFactory: instanceCachingFactory<T>(factory),
    });
}
