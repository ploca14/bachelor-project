import { EventEmitter } from "events";
import { singletonScope } from "~/server/utils/singleton";
// import type { Storage } from "unstorage";

export type Message = null | string | number | boolean | object;

export interface EventBus {
  publish(topic: string, message?: Message): Promise<void>;
  subscribe(
    topic: string,
    callback: (event?: Message) => void,
  ): Promise<() => void>;
  once(topic: string, callback: (event: Message) => void): Promise<void>;
}

export const eventEmitterEventBus = (eventEmitter: EventEmitter): EventBus => {
  const publish = async (topic: string, message: Message) => {
    eventEmitter.emit(topic, message);
  };

  const subscribe = async (
    topic: string,
    callback: (message: Message) => void,
  ) => {
    eventEmitter.on(topic, callback);

    return () => {
      eventEmitter.off(topic, callback);
    };
  };

  const once = async (topic: string, callback: (message: Message) => void) => {
    eventEmitter.once(topic, callback);
  };

  return { publish, subscribe, once };
};

// const inMemoryEventBus = (): EventBus => {
//   const subscriptions = new Map<string, Set<(message: Message) => void>>();

//   const publish = async (topic: string, message: Message) => {
//     const callbacks = subscriptions.get(topic);
//     if (callbacks) {
//       for (const callback of callbacks) {
//         callback(message);
//       }
//     }
//   };

//   const subscribe = async (
//     topic: string,
//     callback: (message: Message) => void,
//   ) => {
//     let callbacks = subscriptions.get(topic);
//     if (!callbacks) {
//       callbacks = new Set();
//       subscriptions.set(topic, callbacks);
//     }
//     callbacks.add(callback);

//     return () => {
//       callbacks?.delete(callback);
//     };
//   };

//   return { publish, subscribe };
// };

// const unstorageEventBus = (storage: Storage): EventBus => {
//   const publish = async (topic: string, message: Message) => {
//     await storage.setItem(topic, message);
//   };

//   const subscribe = (topic: string, callback: (message: Message) => void) => {
//     const unwatch = storage.watch(async (_event, key) => {
//       if (key === topic) {
//         const message = await storage.getItem(topic);
//         callback(message);
//       }
//     });

//     return unwatch;
//   };

//   return { publish, subscribe };
// };

export const useEventBus = singletonScope(() => {
  const eventEmitter = new EventEmitter();
  return eventEmitterEventBus(eventEmitter);
});
