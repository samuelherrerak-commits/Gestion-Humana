class PubSub {
  constructor() {
    this._handlers = {};
  }

  on(event, fn) {
    if (!this._handlers[event]) {
      this._handlers[event] = [];
    }
    this._handlers[event].push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const hs = this._handlers[event];
    if (!hs) return;
    this._handlers[event] = hs.filter(h => h !== fn);
  }

  emit(event, data) {
    const hs = this._handlers[event];
    if (!hs) return;
    hs.forEach(fn => {
      try { fn(data); } catch (e) { console.error('[PubSub]', event, e); }
    });
  }

  clear(event) {
    if (event) {
      delete this._handlers[event];
    } else {
      this._handlers = {};
    }
  }
}

export const pubsub = new PubSub();
