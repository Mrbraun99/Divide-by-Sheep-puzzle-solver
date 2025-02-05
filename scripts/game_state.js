class GameState {
    static move(state, islands) {
        const states = [];

        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                if (islands.grid[y][x] == null || state.entities[y * LEVEL_SIZE.x + x] == null || state.entities[y * LEVEL_SIZE.x + x] == "000000" || state.entities[y * LEVEL_SIZE.x + x].split("").every((ch, index) => index == EntityType.WOLF_FULL || ch == "0")) continue;

                loop: for (const direction of ["RIGHT", "LEFT", "DOWN", "UP"]) {
                    const dst = { x: x + Direction[direction].x, y: y + Direction[direction].y };
                    if (islands.grid[y][x].walls[direction] == WallType.BLOCKING_WALL || dst.x < 0 || dst.y < 0 || dst.x >= LEVEL_SIZE.x || dst.y >= LEVEL_SIZE.y || islands.grid[dst.y][dst.x] == null || state.entities[dst.y * LEVEL_SIZE.x + dst.x] == null) continue;

                    let death_count = 0;
                    const entities = [...state.entities];
                    const request = [...state.request];

                    const leave_src_result = Island.leave(entities[y * LEVEL_SIZE.x + x]);
                    entities[y * LEVEL_SIZE.x + x] = leave_src_result.remaining;

                    if (islands.grid[y][x].walls[direction] == WallType.LASER_WALL) {
                        death_count += parseInt(leave_src_result.leave[EntityType.SHEEP]);
                        leave_src_result.leave = LaserWall.process(leave_src_result.leave);
                    }

                    if (islands.grid[y][x].type == IslandType.TNT_BLOCK_ISLAND && entities[y * LEVEL_SIZE.x + x] == "000000") entities[y * LEVEL_SIZE.x + x] = null;

                    if (islands.types[IslandType.SWITCH_BLOCK_ISLAND] != null && entities[islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.y * LEVEL_SIZE.x + islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.x] == "000000") {
                        for (const island of islands.types[IslandType.FLAME_BLOCK_ISLAND]) {
                            const entities_on_island = Array.from(entities[island.pos.y * LEVEL_SIZE.x + island.pos.x], Number);
                            death_count += entities_on_island[EntityType.SHEEP];
                            death_count += entities_on_island[EntityType.PIG];
                            death_count += entities_on_island[EntityType.WOLF_HUNGRY];
                            death_count += entities_on_island[EntityType.WOLF_FULL];

                            entities[island.pos.y * LEVEL_SIZE.x + island.pos.x] = "00000" + entities_on_island[EntityType.FIRE_STATUE];
                        }
                    }

                    switch (islands.grid[dst.y][dst.x].type) {
                        case IslandType.BOUNCE_BLOCK_ISLAND:
                            {
                                const groups = Object.fromEntries(islands.grid[dst.y][dst.x].arrows.map((direction, index) => [direction, Array.from(leave_src_result.leave, Number).map(count => Math.floor(count / islands.grid[dst.y][dst.x].arrows.length) + (index == 0 ? count % islands.grid[dst.y][dst.x].arrows.length : 0)).join("")]));

                                for (let [bounce, leave] of Object.entries(groups)) {
                                    const pos = { x: dst.x + Direction[bounce].x, y: dst.y + Direction[bounce].y };

                                    if (islands.grid[dst.y][dst.x].walls[bounce] == WallType.BLOCKING_WALL || pos.x < 0 || pos.y < 0 || pos.x >= LEVEL_SIZE.x || pos.y >= LEVEL_SIZE.y || islands.grid[pos.y][pos.x] == null || entities[pos.y * LEVEL_SIZE.x + pos.x] == null) {
                                        death_count += parseInt(leave[EntityType.SHEEP]) + parseInt(leave[EntityType.WOLF_HUNGRY]) + parseInt(leave[EntityType.PIG]) + parseInt(leave[EntityType.FIRE_STATUE]);
                                        continue;
                                    }

                                    if (islands.grid[dst.y][dst.x].walls[bounce] == WallType.LASER_WALL) {
                                        death_count += parseInt(leave[EntityType.SHEEP]);
                                        leave = LaserWall.process(leave);
                                    }

                                    const arrive_dst_result = Island.arrive(leave, entities[pos.y * LEVEL_SIZE.x + pos.x], islands.grid[pos.y][pos.x]);
                                    entities[pos.y * LEVEL_SIZE.x + pos.x] = arrive_dst_result.remaining;
                                    death_count += arrive_dst_result.death_count;
                                    death_count += parseInt(arrive_dst_result.no_space[EntityType.SHEEP]) + parseInt(arrive_dst_result.no_space[EntityType.WOLF_HUNGRY]) + parseInt(arrive_dst_result.no_space[EntityType.PIG]) + parseInt(arrive_dst_result.no_space[EntityType.FIRE_STATUE]);
                                }

                                break;

                            }
                        case IslandType.DELIVERY_ISLAND:
                        case IslandType.BASE_BLOCK_ISLAND:
                        case IslandType.TNT_BLOCK_ISLAND:
                        case IslandType.WOLF_EATER_BLOCK_ISLAND:
                        case IslandType.HEATER_BLOCK_ISLAND:
                        case IslandType.FLAME_BLOCK_ISLAND:
                        case IslandType.SWITCH_BLOCK_ISLAND:
                            {
                                if (islands.grid[y][x].has_border && islands.grid[dst.y][dst.x].has_border) {
                                    if (entities[dst.y * LEVEL_SIZE.x + dst.x] != "000000" && !(entities[dst.y * LEVEL_SIZE.x + dst.x].split("").every((ch, index) => index === EntityType.WOLF_FULL || ch == "0"))) {
                                        const leave_dst_result = Island.leave(entities[dst.y * LEVEL_SIZE.x + dst.x]);
                                        entities[dst.y * LEVEL_SIZE.x + dst.x] = leave_dst_result.remaining;

                                        if (islands.grid[y][x].walls[direction] == WallType.LASER_WALL) {
                                            death_count += parseInt(leave_dst_result.leave[EntityType.SHEEP]);
                                            leave_dst_result.leave = LaserWall.process(leave_dst_result.leave);
                                        }

                                        if (islands.grid[dst.y][dst.x].type == IslandType.TNT_BLOCK_ISLAND && entities[dst.y * LEVEL_SIZE.x + dst.x] == "000000") entities[dst.y * LEVEL_SIZE.x + dst.x] = null;

                                        if (islands.types[IslandType.SWITCH_BLOCK_ISLAND] != null && entities[islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.y * LEVEL_SIZE.x + islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.x] == "000000") {
                                            for (const island of islands.types[IslandType.FLAME_BLOCK_ISLAND]) {
                                                let entities_on_island = Array.from(entities[island.pos.y * LEVEL_SIZE.x + island.pos.x], Number);
                                                death_count += entities_on_island[EntityType.SHEEP];
                                                death_count += entities_on_island[EntityType.PIG];
                                                death_count += entities_on_island[EntityType.WOLF_HUNGRY];
                                                death_count += entities_on_island[EntityType.WOLF_FULL];

                                                entities[island.pos.y * LEVEL_SIZE.x + island.pos.x] = "00000" + entities_on_island[EntityType.FIRE_STATUE];
                                            }
                                        }

                                        if (entities[y * LEVEL_SIZE.x + x] != null) {
                                            const arrive_src_result = Island.arrive(leave_dst_result.leave, entities[y * LEVEL_SIZE.x + x], islands.grid[y][x]);
                                            entities[y * LEVEL_SIZE.x + x] = arrive_src_result.remaining;
                                            death_count += arrive_src_result.death_count;
                                            death_count += parseInt(arrive_src_result.no_space[EntityType.SHEEP]) + parseInt(arrive_src_result.no_space[EntityType.WOLF_HUNGRY]) + parseInt(arrive_src_result.no_space[EntityType.PIG]) + parseInt(arrive_src_result.no_space[EntityType.FIRE_STATUE]);
                                        } else death_count += parseInt(leave_dst_result.leave[EntityType.SHEEP]) + parseInt(leave_dst_result.leave[EntityType.WOLF_HUNGRY]) + parseInt(leave_dst_result.leave[EntityType.PIG]) + parseInt(leave_dst_result.leave[EntityType.FIRE_STATUE]);
                                    }

                                    if (entities[dst.y * LEVEL_SIZE.x + dst.x] != null) {
                                        const arrive_dst_result = Island.arrive(leave_src_result.leave, entities[dst.y * LEVEL_SIZE.x + dst.x], islands.grid[dst.y][dst.x]);
                                        entities[dst.y * LEVEL_SIZE.x + dst.x] = arrive_dst_result.remaining;
                                        death_count += arrive_dst_result.death_count;
                                        death_count += parseInt(arrive_dst_result.no_space[EntityType.SHEEP]) + parseInt(arrive_dst_result.no_space[EntityType.WOLF_HUNGRY]) + parseInt(arrive_dst_result.no_space[EntityType.PIG]) + parseInt(arrive_dst_result.no_space[EntityType.FIRE_STATUE]);
                                    } else death_count += parseInt(leave_src_result.leave[EntityType.SHEEP]) + parseInt(leave_src_result.leave[EntityType.WOLF_HUNGRY]) + parseInt(leave_src_result.leave[EntityType.PIG]) + parseInt(leave_src_result.leave[EntityType.FIRE_STATUE]);

                                    break;
                                }

                                if (entities[dst.y * LEVEL_SIZE.x + dst.x] != null) {
                                    const arrive_dst_result = Island.arrive(leave_src_result.leave, entities[dst.y * LEVEL_SIZE.x + dst.x], islands.grid[dst.y][dst.x]);
                                    entities[dst.y * LEVEL_SIZE.x + dst.x] = arrive_dst_result.remaining;
                                    death_count += arrive_dst_result.death_count;

                                    if (islands.grid[dst.y][dst.x].has_portal && entities[y * LEVEL_SIZE.x + x] != null) {
                                        entities[y * LEVEL_SIZE.x + x] = Array.from(entities[y * LEVEL_SIZE.x + x], Number);
                                        for (const type of [EntityType.SHEEP, EntityType.WOLF_HUNGRY, EntityType.PIG, EntityType.FIRE_STATUE]) entities[y * LEVEL_SIZE.x + x][type] = parseInt(arrive_dst_result.no_space[type]);
                                        entities[y * LEVEL_SIZE.x + x] = entities[y * LEVEL_SIZE.x + x].join("");
                                    } else death_count += parseInt(arrive_dst_result.no_space[EntityType.SHEEP]) + parseInt(arrive_dst_result.no_space[EntityType.WOLF_HUNGRY]) + parseInt(arrive_dst_result.no_space[EntityType.PIG]) + parseInt(arrive_dst_result.no_space[EntityType.FIRE_STATUE]);
                                } else death_count += parseInt(leave_src_result.leave[EntityType.SHEEP]) + parseInt(leave_src_result.leave[EntityType.WOLF_HUNGRY]) + parseInt(leave_src_result.leave[EntityType.PIG]) + parseInt(leave_src_result.leave[EntityType.FIRE_STATUE]);

                                break;
                            }
                    }

                    for (const island of islands.types[IslandType.WOLF_EATER_BLOCK_ISLAND]) {
                        const entities_on_island = Array.from(entities[island.pos.y * LEVEL_SIZE.x + island.pos.x], Number);
                        death_count += entities_on_island[EntityType.WOLF_FULL] + entities_on_island[EntityType.WOLF_HUNGRY];
                        entities_on_island[EntityType.WOLF_FULL] = 0;
                        entities_on_island[EntityType.WOLF_HUNGRY] = 0;
                        entities[island.pos.y * LEVEL_SIZE.x + island.pos.x] = entities_on_island.join("");
                    }

                    for (const island of islands.types[IslandType.HEATER_BLOCK_ISLAND]) {
                        const entities_on_island = Array.from(entities[island.pos.y * LEVEL_SIZE.x + island.pos.x], Number);
                        for (const type of [EntityType.SHEEP_HALF, EntityType.SHEEP, EntityType.PIG, EntityType.WOLF_HUNGRY, EntityType.WOLF_FULL]) {
                            if (entities_on_island[type] > 0) {
                                entities_on_island[type]--;
                                if (type != EntityType.SHEEP_HALF) death_count++;
                                break;
                            }
                        }

                        entities[island.pos.y * LEVEL_SIZE.x + island.pos.x] = entities_on_island.join("");
                    }

                    if (islands.types[IslandType.SWITCH_BLOCK_ISLAND] != null && entities[islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.y * LEVEL_SIZE.x + islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.x] == "000000") {
                        for (const island of islands.types[IslandType.FLAME_BLOCK_ISLAND]) {
                            const entities_on_island = Array.from(entities[island.pos.y * LEVEL_SIZE.x + island.pos.x], Number);
                            death_count += entities_on_island[EntityType.SHEEP];
                            death_count += entities_on_island[EntityType.PIG];
                            death_count += entities_on_island[EntityType.WOLF_HUNGRY];
                            death_count += entities_on_island[EntityType.WOLF_FULL];

                            entities[island.pos.y * LEVEL_SIZE.x + island.pos.x] = "00000" + entities_on_island[EntityType.FIRE_STATUE];
                        }
                    }

                    let [request_type, request_count] = request[0].split(":").map(Number);
                    let entities_on_boat;

                    if ((entities_on_boat = entities[islands.types[IslandType.DELIVERY_ISLAND].pos.y * LEVEL_SIZE.x + islands.types[IslandType.DELIVERY_ISLAND].pos.x]) != "000000" || (request_type == RequestType.SOUL && death_count != 0)) {
                        switch (request_type) {
                            case RequestType.SHEEP:
                                {
                                    if ([EntityType.WOLF_HUNGRY, EntityType.PIG, EntityType.FIRE_STATUE].some(type => entities_on_boat[type] != "0")) continue;
                                    request_count -= parseInt(entities_on_boat[EntityType.SHEEP]) + parseInt(entities_on_boat[EntityType.SHEEP_HALF]) / 2;
                                    break;
                                }
                            case RequestType.WOLF:
                                {
                                    if ([EntityType.SHEEP, EntityType.SHEEP_HALF, EntityType.PIG, EntityType.FIRE_STATUE].some(type => entities_on_boat[type] != "0")) continue;
                                    request_count -= parseInt(entities_on_boat[EntityType.WOLF_HUNGRY]);
                                    break;
                                }
                            case RequestType.PIG:
                                {
                                    if ([EntityType.SHEEP, EntityType.SHEEP_HALF, EntityType.WOLF_HUNGRY, EntityType.FIRE_STATUE].some(type => entities_on_boat[type] != "0")) continue;
                                    request_count -= parseInt(entities_on_boat[EntityType.PIG]);
                                    break;
                                }
                            case RequestType.FIRE_STATUE:
                                {
                                    if ([EntityType.SHEEP, EntityType.SHEEP_HALF, EntityType.WOLF_HUNGRY, EntityType.PIG].some(type => entities_on_boat[type] != "0")) continue;
                                    request_count -= parseInt(entities_on_boat[EntityType.FIRE_STATUE]);
                                    break;
                                }
                            case RequestType.MEAT:
                                {
                                    if (entities_on_boat[EntityType.FIRE_STATUE] != "0") continue loop;
                                    request_count -= parseInt(entities_on_boat[EntityType.SHEEP]) + parseInt(entities_on_boat[EntityType.SHEEP_HALF]) / 2 + parseInt(entities_on_boat[EntityType.WOLF_HUNGRY]) + parseInt(entities_on_boat[EntityType.PIG]);
                                    break;
                                }
                            case RequestType.SOUL:
                                {
                                    request_count -= death_count;
                                    break;
                                }
                        }

                        if (request_count < 0) continue loop;
                        (request_count == 0) ? request.shift() : request[0] = request_type + ":" + request_count;
                        entities[islands.types[IslandType.DELIVERY_ISLAND].pos.y * LEVEL_SIZE.x + islands.types[IslandType.DELIVERY_ISLAND].pos.x] = "000000";
                    }

                    states.push({ "parent": state, "move": { "src": { x: x, y: y }, "dst": { x: dst.x, y: dst.y } }, "entities": entities, "request": request });
                }
            }
        }

        return states;
    }

    static isImpossibleToSolve(state, islands) {
        if (state.request.map(request => parseInt(request.split(":")[0])).some(value => [RequestType.SHEEP, RequestType.WOLF, RequestType.PIG].includes(value))) {
            const entities_on_islands = state.entities.map(entities => entities ? Array.from(entities, Number) : [0, 0, 0, 0, 0, 0]).reduce((acc, a) => { return acc.map((value, index) => a[index] + value); }, [0, 0, 0, 0, 0, 0]);
            entities_on_islands[EntityType.SHEEP] += entities_on_islands[EntityType.SHEEP_HALF] / 2;

            for (const request of state.request) {
                const [request_type, request_count] = request.split(":").map(Number);

                switch (request_type) {
                    case RequestType.SHEEP:
                        {
                            entities_on_islands[EntityType.SHEEP] -= request_count;
                            if (entities_on_islands[EntityType.SHEEP] < 0) return true;
                            break;
                        }
                    case RequestType.WOLF:
                        {
                            entities_on_islands[EntityType.WOLF_HUNGRY] -= request_count;
                            if (entities_on_islands[EntityType.WOLF_HUNGRY] < 0) return true;
                            break;
                        }
                    case RequestType.PIG:
                        {
                            entities_on_islands[EntityType.PIG] -= request_count;
                            if (entities_on_islands[EntityType.PIG] < 0) return true;
                            break;
                        }
                    case RequestType.FIRE_STATUE:
                        {
                            entities_on_islands[EntityType.FIRE_STATUE] -= request_count;
                            if (entities_on_islands[EntityType.FIRE_STATUE] < 0) return true;
                            break;
                        }
                }
            }
        }

        if (!state.request.map(request => request.split(":")[0]).every(value => value == RequestType.SOUL)) {
            for (const direction of ["LEFT", "RIGHT", "UP", "DOWN"]) {
                const pos = { x: islands.types[IslandType.DELIVERY_ISLAND].pos.x + Direction[direction].x, y: islands.types[IslandType.DELIVERY_ISLAND].pos.y + Direction[direction].y };
                if (pos.x >= 0 && pos.y >= 0 && pos.x < LEVEL_SIZE.x && pos.y < LEVEL_SIZE.y && islands.grid[pos.y][pos.x] != null && state.entities[pos.y * LEVEL_SIZE.x + pos.x] != null) return false;
            }

            return true;
        }

        return false;
    }
}