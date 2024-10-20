var models;

if (models === undefined) {
    models = {};
}

models.switcherModel = function () {
    const paths = {
        defaultPath: "/",
        statesPath: "/states",
        examplePath: "/example",
    };

    const labels = {
        states: "Switch to States",
        example: "Switch to Example",
    };

    const pathLabelMapping = [
        {path: paths.statesPath, label: labels.states},
        {path: paths.examplePath, label: labels.example}
    ];

    return {
        paths: paths,
        labels: labels,
        pathLabelMapping: pathLabelMapping
    };
};