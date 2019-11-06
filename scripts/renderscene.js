var view;
var ctx;
var scene;

// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        /*
        sphere stuff he wrote on the board
        
        increment = 2pi/sides
        x = center.x + radius*cos(theta)
        y = center.y - height/z
        z = center.z + radius*sin(theta)
        */


        view: {
            type: 'perspective',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-20, 20, -4, 36, 1, -50]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4(0, 0, -30, 1),
                    Vector4(20, 0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4(0, 12, -30, 1),
                    Vector4(0, 0, -60, 1),
                    Vector4(20, 0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4(0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            }
        ]
    };
    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    DrawScene();
}

// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {

    //all for parallel ones
    var transMatrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip)
    var ogData = scene.models[0].vertices;
    //will need to loop though all models later on.
    for(var i = 0; i<scene.models[0].vertices.length; i++){
        //will give in terms of tiny window 
        scene.models[0].vertices[i] = transMatrix.mult(scene.models[0].vertices[i])
        console.log("verticies in -1 to 1 " + scene.models[0].vertices[i].values)
        //!!!!!There is something wrong with our transformations because this gives us vaules from -1 to 1
        //!!!!!!!!!!!!!!
        //!!!!!!!!!!!!!
    }


    //I think there is something wrong with this matrix
    fbMatrix = new Matrix(4,4);
    fbMatrix.values[0][0] = (view.width/2);
    fbMatrix.values[0][3] = (view.width/2);
    fbMatrix.values[1][1] = (view.height/2);
    fbMatrix.values[1][3] = (view.height/2);
    fbMatrix.values[2][2] = 1;
    fbMatrix.values[3][3] = 1;

    for(var i = 0; i<scene.models[0].vertices.length; i++){
        //put into framebuffer coordinates
        scene.models[0].vertices[i] = fbMatrix.mult(scene.models[0].vertices[i])
        console.log("framebuffer coords: "+scene.models[0].vertices[i].data)
    }
    
    for(var i = 0; i<scene.models[0].edges.length; i++){
        //loop through each set of edges
        for(var j = 0; j<scene.models[0].edges[i].length; j++){
            //j is vertex index
            var k = j+1;
            //k should be second vertex index
            if(k == scene.models[0].edges[i].length){
                k = 0;
            }
            var n = scene.models[0].edges[i][j];
            var m = scene.models[0].edges[i][k];

            console.log("Point 1x: "+scene.models[0].vertices[n].values[0]);
            console.log("Point 1y: "+scene.models[0].vertices[n].values[1]);

            DrawLine(scene.models[0].vertices[n].values[0], scene.models[0].vertices[n].values[1], scene.models[0].vertices[m].values[0], scene.models[0].vertices[m].values[1])
        }
    }   

    /*
    //CLEAR OLD 
    view = document.getElementById('view');
    ctx.clearRect(0, 0, view.width, view.height);

    //ANIMATION
    var start_time;
    var prev_time;

    function Animate(timestamp) {
        // step 1: calculate time (time since start) 
                and/or delta time (time between successive frames)
        // step 2: transform models based on time or delta time
        // step 3: draw scene
        // step 4: request next animation frame (recursively calling same function)


        var time = time_stamp - start_time;
        var dt = timestamp - prev_time;
        prev_time = time_stamp;

        // ... step 2

        DrawScene();

        window.requestAnimationFrame(Animate);
    }

    start_time = performance.now(); // current timestamp in milliseconds
    prev_time = start_time;
    window.requestAnimationFrame(Animate);
    */


    //will need to get the tranformation matrix, which should be return by the parallel and perpective calculations
    //take this matrix and multiply it by the verticies
    //then the veritices will be scaled to the window size and we will need to clip them to fit within

    console.log(scene);
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                        scene.models[i].vertices[j][1],
                        scene.models[i].vertices[j][2],
                        1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                    scene.models[i].center[1],
                    scene.models[i].center[2],
                    1);
            }
        }

        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 38: // UP Arrow
            console.log("up");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 40: // DOWN Arrow
            console.log("down");
            break;
    }
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
