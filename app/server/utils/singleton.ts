const instances = new Map();

export const singletonScope = <TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
) => {
  return (...args: TArgs) => {
    if (!instances.has(fn)) {
      instances.set(fn, fn(...args));
    }

    return instances.get(fn) as TResult;
  };
};

declare module "h3" {
  interface H3EventContext {
    singletonInstances?: Map<Function, any>;
  }
}

export const requestScope = <TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
) => {
  return (...args: TArgs) => {
    const { context } = useEvent();

    if (!context.singletonInstances) {
      context.singletonInstances = new Map();
    }

    if (!context.singletonInstances.has(fn)) {
      context.singletonInstances.set(fn, fn(...args));
    }

    return context.singletonInstances.get(fn) as TResult;
  };
};
