class DivideBySheep {
    static solve(data) {
        const states = { "request_count_1": [], "request_count_2": [], "request_count_3": [data.state] };
        const history = {};
        history[data.state.request.join(",")] = {};
        history[data.state.request.join(",")][data.state.entities.join(",")] = true;

        while (true) {
            const state = (function () {
                if (states.request_count_1.length > 0) return states.request_count_1.shift();
                if (states.request_count_2.length > 0) return states.request_count_2.shift();
                if (states.request_count_3.length > 0) return states.request_count_3.shift();
            })();

            if (state == null) return new Solution(data);

            for (const next_state of GameState.move(state, data.islands)) {
                if (next_state.request.length == 0) {
                    return (function (state) {
                        while (true) {
                            if (state.parent == null) return new Solution(data);
                            state.parent.next = state;
                            state = state.parent;
                        }
                    })(next_state);
                }

                if (GameState.isImpossibleToSolve(next_state, data.islands)) continue;

                const request_ID = next_state.request.join(",");
                const entities_ID = next_state.entities.join(",");

                if (!history[request_ID]) history[request_ID] = {};
                if (history[request_ID][entities_ID]) continue;
                history[request_ID][entities_ID] = true;

                if (next_state.request.length == 1) states.request_count_1.push(next_state);
                if (next_state.request.length == 2) states.request_count_2.push(next_state);
                if (next_state.request.length == 3) states.request_count_3.push(next_state);
            }
        }
    }
}