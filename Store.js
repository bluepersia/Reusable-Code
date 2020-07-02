


class Store 
{
    createStore ()
    {
        let currentState = this.reducer (undefined, {});
        const afterReduce = new Map ([]);

        const store = {
            getState: () => currentState,
            dispatch: action =>
            {
                const oldState = currentState;
                currentState = this.reducer (currentState, action);

                this.onReduce (action, oldState, currentState);

                if (afterReduce.has (action.type))
                    afterReduce.get (action.type).forEach (callback => callback(action, oldState, currentState));
            },
            addCallback: (type, callback) => {

                if (afterReduce.has (type))
                    {
                        const callbacks = afterReduce.get (type);
                        if (callbacks.includes (callback))
                            return;

                        afterReduce.set (type, [...callbacks, callback]);
                    }
                else 
                {
                    afterReduce.set (type, [callback]);
                }

            },
            removeCallback: (type, callback) => {

                if (afterReduce.has (type))
                    afterReduce.set (type, afterReduce.get (type).filter (cb => cb != callback));

            },
            clearCallbacks: () => afterReduce = []
            
        };

        return store;
    }
    
    
    getInitialState ()
    {
        return {};
    }

    reducer (state = this.getInitialState (), action)
    {
        return state;
    }

    onReduce (action, oldState, currentState)
    {
       
    }
}


export default Store;