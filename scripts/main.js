const IslandType = Object.freeze({
    DELIVERY_ISLAND: "DELIVERY_ISLAND",
    BASE_BLOCK_ISLAND: "BASE_BLOCK_ISLAND",
    BOUNCE_BLOCK_ISLAND: "BOUNCE_BLOCK_ISLAND",
    TNT_BLOCK_ISLAND: "TNT_BLOCK_ISLAND",
    WOLF_EATER_BLOCK_ISLAND: "WOLF_EATER_BLOCK_ISLAND",
    HEATER_BLOCK_ISLAND: "HEATER_BLOCK_ISLAND",
    FLAME_BLOCK_ISLAND: "FLAME_BLOCK_ISLAND",
    SWITCH_BLOCK_ISLAND: "SWITCH_BLOCK_ISLAND",
});

const EntityType = Object.freeze({
    SHEEP: 0,
    WOLF_HUNGRY: 1,
    WOLF_FULL: 2,
    SHEEP_HALF: 3,
    PIG: 4,
    FIRE_STATUE: 5
});

const RequestType = Object.freeze({
    SHEEP: 0,
    WOLF: 1,
    SOUL: 2,
    PIG: 3,
    MEAT: 4,
    FIRE_STATUE: 5
});

const Direction = Object.freeze({
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
});

const WallType = Object.freeze({
    BLOCKING_WALL: "BLOCKING_WALL",
    LASER_WALL: "LASER_WALL"
});

const IslandLayout = {
    1: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    2: [[0, 0, 0], [0, 1, 1], [0, 0, 0]],
    3: [[0, 1, 0], [0, 1, 0], [0, 1, 0]],
    4: [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    5: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    6: [[0, 1, 0], [1, 1, 1], [1, 1, 0]],
    7: [[0, 1, 1], [1, 1, 1], [1, 1, 0]],
    8: [[1, 1, 1], [1, 1, 1], [1, 1, 0]],
    9: [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
}

const TILE_SIZE = 45;
const LEVEL_SIZE = { x: 4, y: 3 };

const images = {};
const block_image_map = {};
const entity_image_map = {};
const request_image_map = {};

function preload() {
    images["BASE_BLOCK"] = [loadImage("assets/base_block_0.png"), loadImage("assets/base_block_1.png"), loadImage("assets/base_block_2.png"), loadImage("assets/base_block_3.png"), loadImage("assets/base_block_4.png")];
    images["PORTAL_BLOCK"] = loadImage("assets/portal_block.png");
    images["BOAT"] = loadImage("assets/boat.png");

    block_image_map[IslandType.BASE_BLOCK_ISLAND] = images["BASE_BLOCK"][0];
    block_image_map[IslandType.BOUNCE_BLOCK_ISLAND] = loadImage("assets/bounce_block.png");
    block_image_map[IslandType.TNT_BLOCK_ISLAND] = loadImage("assets/tnt_block.png");
    block_image_map[IslandType.WOLF_EATER_BLOCK_ISLAND] = loadImage("assets/wolf_eater_block.png");
    block_image_map[IslandType.HEATER_BLOCK_ISLAND] = loadImage("assets/heater_block.png");
    block_image_map[IslandType.FLAME_BLOCK_ISLAND] = loadImage("assets/flame_block.png");
    block_image_map[IslandType.SWITCH_BLOCK_ISLAND] = loadImage("assets/switch_block.png");

    images["SHEEP"] = loadImage("assets/sheep.png");
    images["WOLF_HUNGRY"] = loadImage("assets/wolf_hungry.png");
    images["WOLF_FULL"] = loadImage("assets/wolf_full.png");
    images["SHEEP_HALF"] = loadImage("assets/sheep_half.png");
    images["PIG"] = loadImage("assets/pig.png");
    images["FIRE_STATUE"] = loadImage("assets/fire_statue.png");
    images["SOUL"] = loadImage("assets/soul.png");
    images["MEAT"] = loadImage("assets/meat.png");

    images[WallType.BLOCKING_WALL] = loadImage("assets/blocking_wall.png");
    images[WallType.LASER_WALL] = loadImage("assets/laser_wall.png");

    entity_image_map["SHEEP"] = images["SHEEP"];
    entity_image_map["WOLF_HUNGRY"] = images["WOLF_HUNGRY"];
    entity_image_map["WOLF_FULL"] = images["WOLF_FULL"];
    entity_image_map["SHEEP_HALF"] = images["SHEEP_HALF"];
    entity_image_map["PIG"] = images["PIG"];
    entity_image_map["FIRE_STATUE"] = images["FIRE_STATUE"];

    request_image_map["SHEEP"] = images["SHEEP"];
    request_image_map["WOLF"] = images["WOLF_HUNGRY"];
    request_image_map["SOUL"] = images["SOUL"];
    request_image_map["PIG"] = images["PIG"];
    request_image_map["MEAT"] = images["MEAT"];
    request_image_map["FIRE_STATUE"] = images["FIRE_STATUE"];

    images["BORDER"] = loadImage("assets/border.png");
    images["ARROW"] = loadImage("assets/arrow.png");
    images["BOUNCE_ARROW"] = loadImage("assets/bounce_arrow.png");
    images["FLAME"] = loadImage("assets/flame.png");
}

function setup() {
    const data = {
        labels:
            [
                "Ice World - Level 16",
                "Ice World - Level 17",
                "Ice World - Level 20",
                "Ice World - Level 26",
                "Dark World - Level 26",
                "Spring World - Level 30",
                "World of Ruins - Level 28"
            ],
        datasets:
            [
                {
                    data: [0.35, 0.57, 0.63, 0.36, 3.31, 1.68, 0.37],
                    backgroundColor: [...Array(4).fill("rgba(0, 148, 255, 0.5)"), ...Array(1).fill("rgba(115, 78, 168,0.5)"), ...Array(1).fill("rgba(219, 50, 87,0.5)"), ...Array(1).fill("rgba(211, 70, 0,0.5)")],
                    borderColor: [...Array(4).fill("#0A5BFF"), ...Array(1).fill("#5D36A5"), ...Array(1).fill("#D81741"), ...Array(1).fill("#D3320A")],
                    borderWidth: 4,
                }
            ]
    };

    new Chart("chart", {
        type: "bar",
        data: data,
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            barPercentage: 0.9,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    font: { size: 16 },
                    anchor: "end",
                    align: "end",
                }
            },
            indexAxis: "y",
            scales: {
                x: {
                    type: "linear",
                    beginAtZero: true,
                    max: 4,
                    title: {
                        display: true,
                        text: "Seconds",
                        font: { size: 16 }
                    },
                    ticks: {
                        font: { size: 16 },
                        stepSize: 0.2,
                        autoSkip: false,
                        minRotation: 45,
                        callback: (value) => value.toFixed(1)
                    }
                },
                y: {
                    ticks: {
                        font: { size: 16 }
                    }
                }
            },
        },
    });

    const canvas = createCanvas((6 * LEVEL_SIZE.x - 2) * TILE_SIZE, (6 * LEVEL_SIZE.y - 2) * TILE_SIZE).parent("#canvas-container");
    pixelDensity(1);

    canvas.drop((file) => {
        document.getElementById("world-level-description").textContent = "Custom level";
        DivideBySheep.solve(Level.load(file.data)).display();
    });

    textFont("mono_space");
    noLoop();

    select("#world-0-button").mousePressed(() => createLevelSelectButtons(0));
    select("#world-1-button").mousePressed(() => createLevelSelectButtons(1));
    select("#world-2-button").mousePressed(() => createLevelSelectButtons(2));
    select("#world-3-button").mousePressed(() => createLevelSelectButtons(3));
    select("#world-4-button").mousePressed(() => createLevelSelectButtons(4));
    createLevelSelectButtons(0);

    loadJSON("levels/00/00.json", (data) => DivideBySheep.solve(Level.load(data)).display());
}

function keyPressed() { }

function createLevelSelectButtons(world) {
    const button_container = document.getElementById("level-select-button-container");
    button_container.innerHTML = "";

    for (let level = 0; level < 30; level++) {
        const button = createButton((level + 1).toString().padStart(2, "0"));

        button.addClass("level-select-button");
        button.addClass("world-" + world + "-button");

        button.mousePressed(() => {
            document.getElementById("world-level-description").textContent = ["Green World", "Ice World", "Dark World", "Spring World", "World of Ruins"][world] + " - Level " + (level + 1).toString().padStart(2, "0");
            block_image_map[IslandType.BASE_BLOCK_ISLAND] = images["BASE_BLOCK"][world];

            loadJSON("levels/" + (world).toString().padStart(2, "0") + "/" + (level).toString().padStart(2, "0") + ".json", (data) => {
                DivideBySheep.solve(Level.load(data)).display();
            });

        });

        button.parent(button_container);
    }
}