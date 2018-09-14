const ListenerHandler = require('./index');
const Emitter = require('events');

class dude {
    constructor() {
        this.a = 2;
        this.emitter = new Emitter();
        this.listenerHandler = new ListenerHandler(
            ['hey', 'dumm'],
            this.emitter
        );

        this.listenerHandler.addListener('hey', this.myFunction.bind(this));
        this.listenerHandler.addListener('hey', this.myFunction.bind(this));
        this.listenerHandler.addListener('hey', this.myFunction);
        this.listenerHandler.addListener('hey', this.myFunction.bind(this));
    }

    myFunction() {
        console.log(this.a);
        this.a = 3;
        console.log(this.a);
    }    
}

const d = new dude();

d.emitter.emit('hey');
d.emitter.on('error', error => {
    console.log(error);
});
console.log('Listeners', d.emitter.listenerCount('hey'));