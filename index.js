const Emitter = require('events');

const generator = function* (event, emitter) {
    let end = false;

    while(!end) {
        yield callback => {
            if(!callback) end = true;
            else {
                const tasks = emitter.listeners(event);
                emitter.removeAllListeners(event);
                tasks.push(callback);
    
                emitter.on(event, async () => {
                    for( task of tasks ) {
                        try {
                            await task();
                        } catch (error) {
                            emitter.emit('error', error);
                        }
                    }
                });
            }
        };
    }

    while(true) yield () => {};
};

class ListenerHandler {
    constructor(events = [], emitter) {
        if (!(emitter instanceof Emitter)) throw new Error('Invalid emitter');
        if(!Array.isArray(events)) throw new Error('Events parameter should be an array');

        this.emitter = emitter;
        this.events = events;
        this.generators = {};

        this.events.forEach(event => {
            this.generators[event] = generator(event, this.emitter);
        });
    }

    addListener(event, callback) {
        if(!(event in this.generators)) throw new Error(`Event ${event} not registered`);
        if(!callback) throw new Error('Invalid callback');

        this.generators[event].next().value(callback);
    }

    blockEvent(event) {
        if(!(event in this.generators)) throw new Error(`Event ${event} not registered`);

        this.generators[event].next().value();
    }

    registerEvent(event) {
        if(!event || typeof event !== 'string') throw new Error('Invalid event');
        if(event in this.generators) throw new Error(`Event ${event} already registered`);

        this.generators[event] = generator(event, this.emitter);
    }

    removeListener(event, callback) {
        if(!(event in this.generators)) throw new Error(`Event ${event} not registered`);
        if(!callback) throw new Error('Invalid callback');

        let tasks = emitter.listeners(event);
        emitter.removeAllListeners(event);
        
        tasks = tasks.filter(task => callback.toString() !== task.toString());

        emitter.on(event, async () => {
            for( task of tasks ) {
                await task();
            }
        });
    }
}

module.exports = ListenerHandler;