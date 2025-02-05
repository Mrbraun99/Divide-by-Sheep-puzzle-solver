class Level {
    static load(data) {
        const islands = { "grid": [...Array(LEVEL_SIZE.y)].map(_ => Array(LEVEL_SIZE.x).fill(null)), "types": { "DELIVERY_ISLAND": null, "SWITCH_BLOCK_ISLAND": null, "TNT_BLOCK_ISLAND": [], "WOLF_EATER_BLOCK_ISLAND": [], "HEATER_BLOCK_ISLAND": [], "FLAME_BLOCK_ISLAND": [] } };
        const entities = data.islands.map(island => island ? Object.keys(island.entities).reduce((acc, type) => acc + island.entities[type] * Math.pow(10, 5 - EntityType[type]), 0).toString().padStart(6, "0") : null);

        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                if (data.islands[y * LEVEL_SIZE.x + x] != null) {
                    islands.grid[y][x] = new Island({ x: x, y: y }, data.islands[y * LEVEL_SIZE.x + x]);

                    switch (islands.grid[y][x].type) {
                        case IslandType.DELIVERY_ISLAND:
                        case IslandType.SWITCH_BLOCK_ISLAND:
                            {
                                islands.types[islands.grid[y][x].type] = islands.grid[y][x];
                                break;
                            }
                        case IslandType.TNT_BLOCK_ISLAND:
                        case IslandType.WOLF_EATER_BLOCK_ISLAND:
                        case IslandType.HEATER_BLOCK_ISLAND:
                        case IslandType.FLAME_BLOCK_ISLAND:
                            {
                                islands.types[islands.grid[y][x].type].push(islands.grid[y][x]);
                                break;
                            }
                    }
                }
            }
        }

        return { "islands": islands, "state": { "parent": null, "move": null, "entities": entities, "request": data.request.map(request => RequestType[request.type] + ':' + request.count) } };
    }
}