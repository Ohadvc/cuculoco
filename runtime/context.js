
let context = {
    step_timeout: 120 * 1000,
    operation_timeout: 40 * 1000,
    current_scenario: null,

};

function set(other) {
    context.trace_id_str = other.trace_id_str;
    context.headless = other.headless;
}

exports.set = set;
exports.context = context;


