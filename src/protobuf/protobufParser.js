const protobuf = require("protobufjs");

const protoRoot = "src/protobuf/proto";
const protos = [
    "groups/group_search_service.proto",
    "entity/entity_service.proto",
];
const root = new protobuf.Root();

protos.forEach((proto) => {
    root.resolvePath = function(origin, target) {
        if(!target.startsWith("src")){
            return `${protoRoot}/${target}`;
        }
        return target;
    };
    root.load(`${protoRoot}/${proto}`).catch((err) => console.log(err));
});

module.exports = root;