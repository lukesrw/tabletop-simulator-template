const { watch } = require("fs");
const { exec, execSync } = require("child_process");

const TARGET = __dirname;

let queue = {};
let events = {
    "change .lua$": "node .",
    "change .xml$": "node ."
};

exec(
    `chdir /D ${__dirname} && npm run watch-start --if-present`,
    (error, stdout, stderr) => {
        if (error || stderr) {
            console.log(`${error || stderr} @ ${new Date()}`);
        }

        console.log(`Watching ${TARGET} @ ${new Date()}`);

        let exec_result = exec(
            `chdir /D ${__dirname} && npm run watch-after-start --if-present`
        );
        exec_result.stdout.on("data", chunk => console.log(chunk.trim()));
        exec_result.stderr.on("data", chunk => console.log(chunk.trim()));

        watch(
            TARGET,
            {
                recursive: true
            },
            (event, file) => {
                if (process.argv[2]) console.log(`${event} ${file}`);

                Object.keys(events).forEach(pattern => {
                    let regex = new RegExp(
                        pattern.split(" ")[1].replace(/\\/gu, "\\\\"),
                        "u"
                    );

                    /**
                     * Event/regex not matched
                     */
                    if (pattern.split(" ")[0] !== event) return false;
                    if (!regex.test(file)) return false;
                    if (
                        !Object.prototype.hasOwnProperty.call(
                            queue,
                            events[pattern]
                        )
                    ) {
                        queue[events[pattern]] = false;
                    }
                    if (queue[events[pattern]]) return false;

                    queue[events[pattern]] = true;

                    console.log(
                        `Executing '${events[pattern]}' @ ${new Date()}`
                    );

                    exec(
                        `chdir /D ${__dirname} && ${events[pattern]}`,
                        (error, stdout, stderr) => {
                            if (error || stderr) {
                                console.log(
                                    `${error || stderr} @ ${new Date()}`
                                );
                            } else {
                                console.log(
                                    `Finished '${
                                        events[pattern]
                                    }' @ ${new Date()}`
                                );
                            }

                            if (stdout.length > 0) console.log(stdout);

                            queue[events[pattern]] = false;
                        }
                    );
                });
            }
        );
    }
);

process.on("SIGINT", () => {
    try {
        execSync(`chdir /D ${__dirname} && npm run watch-end --if-present`);
    } catch (ignore) {}

    process.exit(); // eslint-disable-line
});
