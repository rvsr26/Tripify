/**
 * In-memory replacement for BullMQ
 * Removed Redis dependency for efficiency in single-instance deployments
 */

export const bookingQueue = {
  add: async (name, data) => {
    console.log(`[InMemoryQueue] bookingQueue added job: ${name}`, data);
    // Simulate background processing off the main thread
    setTimeout(async () => {
      console.log('Processing booking job', name, data);
      await new Promise(r => setTimeout(r, 1000));
      console.log('Finished booking job', name);
    }, 100);
  }
};

export const notificationQueue = {
  add: async (name, data) => {
    console.log(`[InMemoryQueue] notificationQueue added job: ${name}`, data);
    // Simulate background processing off the main thread
    setTimeout(async () => {
      console.log('Processing background notification', name, data);
      await new Promise(r => setTimeout(r, 500));
      console.log('Finished notification job', name);
    }, 50);
  }
};

export function initQueues() {
  console.log('In-memory Queues initialized (booking, notification) - Redis removed natively');
}
