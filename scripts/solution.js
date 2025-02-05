class Solution {
    constructor(data) {
        this.islands = data.islands;
        this.state = data.state;

        keyPressed = (event) => {
            if (event.code == "Space" && this.state && this.state.next) {
                this.state = this.state.next;
                this.display();
            }
        }
    }

    display() {
        background(37, 207, 238);

        for (let y = 0; y < LEVEL_SIZE.y; y++) {
            for (let x = 0; x < LEVEL_SIZE.x; x++) {
                let island;
                if ((island = this.islands.grid[y][x]) == null) continue;

                push();

                translate((x * 6 + 2) * TILE_SIZE, (y * 6 + 2) * TILE_SIZE);

                for (const direction of ["LEFT", "RIGHT", "UP", "DOWN"]) {
                    if (island.walls[direction] == null) continue;

                    push();
                    translate(Direction[direction].x * 3 * TILE_SIZE, Direction[direction].y * 3 * TILE_SIZE);
                    rotate(radians(["LEFT", "RIGHT"].includes(direction) ? 90 : 0));
                    imageMode(CENTER);
                    image(images[island.walls[direction]], 0, 0, 3 * TILE_SIZE, TILE_SIZE);
                    pop();
                }

                if (this.state.entities[y * LEVEL_SIZE.x + x] != null) {
                    switch (island.type) {
                        case IslandType.DELIVERY_ISLAND:
                            {
                                imageMode(CENTER);
                                image(images.BOAT, 0, 0, 4 * TILE_SIZE, 4 * TILE_SIZE);

                                for (const [index, request] of this.state.request.entries()) {
                                    imageMode(CENTER);
                                    image(request_image_map[["SHEEP", "WOLF", "SOUL", "PIG", "MEAT", "FIRE_STATUE"][request.split(":")[0]]], 0, 0 + (index - 1 + (3 - this.state.request.length)) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                                    fill(255);
                                    textSize(40);
                                    textAlign(CENTER, CENTER);
                                    textStyle(BOLD);
                                    text(request.split(":")[1], 0 + TILE_SIZE, 0 + (index - 1 + (3 - this.state.request.length)) * TILE_SIZE);
                                }

                                break;
                            }
                        case IslandType.BASE_BLOCK_ISLAND:
                        case IslandType.BOUNCE_BLOCK_ISLAND:
                        case IslandType.TNT_BLOCK_ISLAND:
                        case IslandType.WOLF_EATER_BLOCK_ISLAND:
                        case IslandType.HEATER_BLOCK_ISLAND:
                        case IslandType.FLAME_BLOCK_ISLAND:
                        case IslandType.SWITCH_BLOCK_ISLAND:
                            {
                                push();

                                translate(- 1.5 * TILE_SIZE, - 1.5 * TILE_SIZE);

                                for (let y = 0; y < 3; y++) {
                                    for (let x = 0; x < 3; x++) {
                                        if (IslandLayout[island.block_count][y][x] == 0 && island.has_portal) {
                                            imageMode(CORNER);
                                            image(images.PORTAL_BLOCK, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                                            continue;
                                        }

                                        if (IslandLayout[island.block_count][y][x] == 0 && !island.has_portal) {
                                            tint(80);
                                            imageMode(CORNER);
                                            image(block_image_map[island.type], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                                            noTint();
                                            continue;
                                        }

                                        if (IslandLayout[island.block_count][y][x] == 1) {
                                            imageMode(CORNER);
                                            image(block_image_map[island.type], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                                            if (island.type == IslandType.FLAME_BLOCK_ISLAND && this.state.entities[this.islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.y * LEVEL_SIZE.x + this.islands.types[IslandType.SWITCH_BLOCK_ISLAND].pos.x] == "000000") image(images["FLAME"], x * TILE_SIZE, (y - 0.15) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                                            continue;
                                        }
                                    }
                                }

                                pop();

                                imageMode(CENTER);
                                if (island.has_border) image(images.BORDER, 0, 0);

                                for (const [index, arrow] of island.arrows.entries()) {
                                    push();

                                    imageMode(CENTER);
                                    rotate(radians({ "RIGHT": 0, "DOWN": 90, "LEFT": 180, "UP": 270 }[arrow]));
                                    tint(index == 0 ? 255 : 100);
                                    image(images.BOUNCE_ARROW, TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE);
                                    noTint();

                                    pop();
                                }

                                break;
                            }
                    }

                    const entity_count = this.state.entities[y * LEVEL_SIZE.x + x].replaceAll("0", "").length;
                    if (entity_count <= 3) translate(0, - TILE_SIZE);
                    if (entity_count == 4) translate(0, - 1.5 * TILE_SIZE);

                    for (const type of ["SHEEP", "WOLF_HUNGRY", "WOLF_FULL", "SHEEP_HALF", "PIG", "FIRE_STATUE"]) {
                        if (this.state.entities[y * LEVEL_SIZE.x + x][EntityType[type]] != "0") {
                            image(entity_image_map[type], 0, 0, TILE_SIZE, TILE_SIZE);

                            fill(255);
                            textSize(40);
                            textAlign(CENTER, CENTER);
                            textStyle(BOLD);
                            text(parseInt(this.state.entities[y * LEVEL_SIZE.x + x][EntityType[type]]), TILE_SIZE, 0);

                            translate(0, TILE_SIZE);
                        }
                    }
                }

                pop();
            }
        }

        if (this.state.next != null) {
            const move = this.state.next.move;

            push();
            imageMode(CENTER);
            translate(((move.src.x + move.dst.x) * 3 + 2) * TILE_SIZE, ((move.src.y + move.dst.y) * 3 + 2) * TILE_SIZE);
            rotate(atan2(move.dst.y - move.src.y, move.dst.x - move.src.x));
            image(images.ARROW, 0, 0, 2 * TILE_SIZE, 2 * TILE_SIZE);
            pop();
        }
    }
}