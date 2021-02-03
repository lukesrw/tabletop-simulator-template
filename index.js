const { promises } = require("fs");
const path = require("path");

const JSON_FILE =
    "C:/Users/you/Documents/My Games/Tabletop Simulator/Saves/_FILE_.json";

/**
 * @returns {void}
 */
async function buildJSON() {
    let files = {
        _dirs: await promises.readdir(path.join(__dirname, "objects"))
    };

    for (let dir_i = 0; dir_i < files._dirs.length; dir_i += 1) {
        let dir = files._dirs[dir_i];

        files[dir] = {
            _files: await promises.readdir(path.join(__dirname, "objects", dir))
        };

        for (let file_i = 0; file_i < files[dir]._files.length; file_i += 1) {
            let file = files[dir]._files[file_i];

            files[dir][file] = await promises.readFile(
                path.join(__dirname, "objects", dir, file),
                "utf-8"
            );
        }
    }

    let output = await promises.readFile(JSON_FILE, "utf-8");
    output = JSON.parse(output);

    if (Object.prototype.hasOwnProperty.call(files, "global")) {
        if (
            Object.prototype.hasOwnProperty.call(files.global, "LuaScript.lua")
        ) {
            output.LuaScript = files.global["LuaScript.lua"];
        }
        if (Object.prototype.hasOwnProperty.call(files.global, "XmlUI.xml")) {
            output.XmlUI = files.global["XmlUI.xml"];
        }
    }

    output.ObjectStates.forEach((state, state_i) => {
        let nickname = state.Nickname;

        if (Object.prototype.hasOwnProperty.call(files, nickname)) {
            if (
                Object.prototype.hasOwnProperty.call(
                    files[nickname],
                    "LuaScript.lua"
                )
            ) {
                output.ObjectStates[state_i].LuaScript =
                    files[nickname]["LuaScript.lua"];
            }
            if (
                Object.prototype.hasOwnProperty.call(
                    files[nickname],
                    "XmlUI.xml"
                )
            ) {
                output.ObjectStates[state_i].XmlUI =
                    files[nickname]["XmlUI.xml"];
            }
        }
    });

    await promises.writeFile(JSON_FILE, JSON.stringify(output, null, 4));

    await promises.writeFile(
        path.join(__dirname, "Save.json"),
        JSON.stringify(output, null, 4)
    );
}

buildJSON();
