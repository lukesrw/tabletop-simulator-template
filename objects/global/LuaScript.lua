objects = {}

function onLoad()
    for key, value in pairs(objects) do
        objects[key] = getObjectFromGUID(value)
    end
end