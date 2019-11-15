var view;
var ctx;
var scene;
var tempvertices = [];

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
		
				/*
			vrp: Vector3(0, 0, -54),
            vpn: Vector3(0, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(8, 8, 30),
            clip: [-1, 17, -1, 17, 2, -23]
		*/
			
			

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

	if(scene.view.type === "perspective"){
		var transMatrix = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		//console.log("This is NPer" + transMatrix.values);
		var ogData = scene.models[0].vertices;
		//will need to loop though all models later on.
		for (var i = 0; i < scene.models[0].vertices.length; i++) {
			//will give in terms of tiny window 
			tempvertices[i] = Matrix.multiply(transMatrix, scene.models[0].vertices[i]);
			//console.log("verticies in -1 to 1 " + scene.models[0].vertices[i].values)
        }
        
		ClipPerspective();
	}
	else if(scene.view.type === "parallel"){
		console.log("Back to parallel");
		console.log("Check prp", scene.view.prp);
		var transMatrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		//console.log("This is NPer" + transMatrix.values);
		var ogData = scene.models[0].vertices;
		//will need to loop though all models later on.
		for (var i = 0; i < scene.models[0].vertices.length; i++) {
			//will give in terms of tiny window 
			tempvertices[i] = Matrix.multiply(transMatrix, scene.models[0].vertices[i]);
			//console.log("verticies in -1 to 1 " + scene.models[0].vertices[i].values)
		}
		
//added just to draw the correct lines		
	// for (var i = 0; i < scene.models[0].edges.length; i++) {
    //     //index j is vert0
    //     for (var j = 0; j < scene.models[0].edges[i].length-1; j++) {
    //         console.log("I: "+i+" J:" + j);
    //         //index k is vert1
    //         var k = j + 1;
    //         //n is value for vert0 index
    //         var n = scene.models[0].edges[i][j];
    //         //m is value for vert0 index
    //         var m = scene.models[0].edges[i][k];

    //         var vert0 = scene.models[0].vertices[n];
    //         var vert1 = scene.models[0].vertices[m];
			
	// 	            fbMatrix = new Matrix(4, 4);
    //                 fbMatrix.values = [[view.width / 2, 0, 0, view.width / 2],
    //                                    [0, view.height / 2, 0, view.height / 2],
    //                                    [0, 0, 1, 0],
    //                                    [0, 0, 0, 1]];
    //                 vert0 = new Vector(fbMatrix.mult(vert0));
    //                 vert1 = new Vector(fbMatrix.mult(vert1));
					
    //                 DrawLine(vert0.x/vert0.w, vert0.y/vert0.w, vert1.x/vert1.w, vert1.y/vert1.w);			
			
	// 	}
	// }
		

		
		ClipParallel();
	}
	else{}
	
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
    //console.log(scene);
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
var horizontalMovement = 0;
var depth = 0;
// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
				view = document.getElementById('view');
			ctx.clearRect(0, 0, view.width, view.height);
			ctx = view.getContext('2d');
	var n = new Vector(scene.view.vpn);
    n.normalize();
    var u = scene.view.vup.cross(n);
    u.normalize();
    var v = n.cross(u);
    switch (event.keyCode) {
		
        case 37: // LEFT Arrow
            scene.view.vrp = scene.view.vrp.subtract(u)
			DrawScene();
            break;
        case 38: // UP Arrow
            scene.view.vrp = scene.view.vrp.subtract(n)
			DrawScene();
            break;	
        case 39: // RIGHT Arrow
			horizontalMovement ++;
			scene.view.vrp = scene.view.vrp.add(u)
			DrawScene();
            break;
        case 40: // DOWN Arrow
            scene.view.vrp = scene.view.vrp.add(n)
			DrawScene();
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

	var LEFT = 32;
    var RIGHT = 16;
    var BOTTOM = 8;
    var TOP = 4;
    var INFRONT = 2;
    var BEHIND = 1;
	
	
function ClipParallel() {


    //i is the index in edges
    //loop through each set of edges
    for (var i = 0; i < scene.models[0].edges.length; i++) {
        //index j is vert0
        for (var j = 0; j < scene.models[0].edges[i].length-1; j++) {
            console.log("I: "+i+" J:" + j);
            //index k is vert1
            var k = j + 1;
            //n is value for vert0 index
            var n = scene.models[0].edges[i][j];
            //m is value for vert0 index
            var m = scene.models[0].edges[i][k];

            var vert0 = new Vector(tempvertices[n]);
            var vert1 = new Vector(tempvertices[m]);

            var outcode0 = GetOutCodeParallel(vert0);
            var outcode1 = GetOutCodeParallel(vert1);

            var delta_x = vert1.values[0] - vert0.values[0];
            var delta_y = vert1.values[1] - vert0.values[1];
			var delta_z = vert1.values[2] - vert0.values[2];
            var done = false;
           while (!done) {
                if ((outcode0 | outcode1) === 0) { //trivial accept
					console.log("Trival accept");
                    done = true;
					
                    fbMatrix = new Matrix(4, 4);
                    fbMatrix.values = [[view.width / 2, 0, 0, view.width / 2],
                                       [0, view.height / 2, 0, view.height / 2],
                                       [0, 0, 1, 0],
                                       [0, 0, 0, 1]];
                    vert0 = new Vector(fbMatrix.mult(vert0));
                    vert1 = new Vector(fbMatrix.mult(vert1));
					
                    DrawLine(vert0.x/vert0.w, vert0.y/vert0.w, vert1.x/vert1.w, vert1.y/vert1.w);
                }
                else if ((outcode0 & outcode1) !== 0) {
                    console.log("trivial reject")
                    done = true;
                }
                else {
                    console.log("neither trivial accept nor reject")
                    var selected_pt;
                    var selected_outcode;
                    if (outcode0 > 0) {
                        selected_pt = new Vector(vert0);
                        selected_outcode = outcode0;
                    }
                    else {
                        selected_pt =  new Vector(vert1);
                        selected_outcode = outcode1;
                    }
                    console.log("before changing selected_pt.values: "+selected_pt.values)
                    if ((selected_outcode & LEFT) === LEFT) {
                        var t = (-1-selected_pt.x)/delta_x;
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);
                    }
                    else if ((selected_outcode & RIGHT) === RIGHT) {
                        var t = (1-selected_pt.x)/delta_x;
						console.log("t is:" + t + " Delta y" + delta_y + " delta x: " + delta_x);
						console.log("Before change selected point y is:" + selected_pt.y);
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);
						console.log("After change selected point y is:" + selected_pt.y);
						console.log("after changing right selected_pt.values: "+selected_pt.values)
                    }
                    else if ((selected_outcode & BOTTOM) === BOTTOM) {
                        var t = (-1-selected_pt.y)/delta_y;
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);
                    }
                    else if ((selected_outcode & TOP) === TOP){
                        var t = (1-selected_pt.y)/delta_y;
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);
                    }
                    else if ((selected_outcode & INFRONT) === INFRONT){
                        var t = (-selected_pt.z)/delta_z;
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);
                    }
                    else{
                        var t = (-1-selected_pt.z)/delta_z;
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);                
                    }
                    if (outcode0 > 0) {
                        vert0.data = selected_pt.data; 
                        outcode0 = GetOutCodeParallel(selected_pt);
                    }
                    else {
                        vert1.data = selected_pt.data;
                        outcode1 = GetOutCodeParallel(selected_pt);
                    }
                }
            }//end while loop
        }
    }
}
function ClipPerspective() {
	
	var zmin = (-1) * (((-1)*scene.view.prp.z) + scene.view.clip[4])/ ((-1)*(scene.view.prp.z) + scene.view.clip[5]);
	console.log("zmin is" + zmin);

    //i is the index in edges
    //loop through each set of edges
    for (var i = 0; i < scene.models[0].edges.length; i++) {
        //index j is vert0
        for (var j = 0; j < scene.models[0].edges[i].length-1; j++) {
            //console.log("I: "+i+" J:" + j);
            //index k is vert1
            var k = j + 1;
            //n is value for vert0 index
            var n = scene.models[0].edges[i][j];
            //m is value for vert0 index
            var m = scene.models[0].edges[i][k];

            var vert0 = new Vector(tempvertices[n]);
            var vert1 = new Vector(tempvertices[m]);
            console.log("Vert0: ",vert0);
            console.log("Vert1: ",vert1);

            var outcode0 = GetOutCodePerspective(vert0, zmin);
            var outcode1 = GetOutCodePerspective(vert1, zmin);

            var delta_x = vert1.x - vert0.x;
            var delta_y = vert1.y - vert0.y;
			var delta_z=  vert1.z - vert0.z;
            var done = false;
            
            //outcode0 = 0;
            //outcode1 = 0;
            while (!done) {
			   console.log("outcode0 " + outcode0 + " outcode1 " + outcode1);
                if ((outcode0 | outcode1) === 0) { //trivial accept
                    done = true;
					
					//Mper
					
					mPer = new Matrix(4, 4);
                    mPer.values = [[1, 0, 0, 0],
                                   [0, 1, 0, 0],
                                   [0, 0, 1, 0],
                                   [0, 0, -1, 0]];
					vert0 = mPer.mult(vert0);
                    vert1 = mPer.mult(vert1);
					
					
                    fbMatrix = new Matrix(4, 4);
                    fbMatrix.values = [[view.width / 2, 0, 0, view.width / 2],
                                       [0, view.height / 2, 0, view.height / 2],
                                       [0, 0, 1, 0],
                                       [0, 0, 0, 1]];
                    vert0 = new Vector(fbMatrix.mult(vert0));
                    vert1 = new Vector(fbMatrix.mult(vert1));
                    DrawLine(vert0.x/vert0.w, vert0.y/vert0.w, vert1.x/vert1.w, vert1.y/vert1.w);
                }
                else if ((outcode0 & outcode1) !== 0) {
                    console.log("trivial reject")
                    done = true;
                }
                else {
                    console.log("neither trivial accept nor reject")
                    var selected_pt;
                    var selected_outcode;
                    if (outcode0 > 0) {
                        selected_pt = vert0;
                        selected_outcode = outcode0;
                    }
                    else {
                        selected_pt = vert1;
                        selected_outcode = outcode1;
                    }
                    console.log("selected_pt.values: "+selected_pt.values)
                    if ((selected_outcode & LEFT) === LEFT) {
                        var t = (-vert0.x + vert0.z)/(delta_x-delta_z);
                        console.log("LEFT t = "+t);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
						
                    }
                    else if ((selected_outcode & RIGHT) === RIGHT) {
                        var t = (vert0.x + vert0.z)/(-delta_x-delta_z);
                        console.log("RIGHT t = "+t);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else if ((selected_outcode & BOTTOM) === BOTTOM) {
                        var t = (-vert0.y + vert0.z)/(delta_y-delta_z);
                        console.log("BOTTOM t = "+t);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else if ((selected_outcode & TOP) === TOP){
                        var t = (vert0.y + vert0.z)/(-delta_y-delta_z);
                        console.log("TOP t = "+t);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else if ((selected_outcode & INFRONT) === INFRONT){
                        var t = (vert0.z -zmin )/(-delta_z);
                        console.log("NEAR t = "+t);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else{
                        var t = (-vert0.z -1 )/(delta_z);
                        console.log("FAR t = "+t);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);               
                    }
                    if (outcode0 > 0) {
                        vert0.data = selected_pt.data; 
                        outcode0 = GetOutCodePerspective(selected_pt, zmin);
                    }
                    else {
                        vert1.data = selected_pt.data;
                        outcode1 = GetOutCodePerspective(selected_pt, zmin);
                    }

                }
            }//end while loop
        }
    }
}

function GetOutCodeParallel(vector) {
    var outcode = 0;
    //left right
    console.log("XXXX: "+vector.values[0])
    if (vector.x < -1) {
        outcode += 32;
    }
    else if (vector.x > 1) {
        outcode += 16
    }
    //top bottom
    if (vector.y < -1) {
        outcode += 8
    }
    else if (vector.y > 1) {
        outcode += 4
    }
    //near far
    if (vector.z > 0) {
        outcode += 2
    }
    else if (vector.z < -1) {
        outcode += 1
    }
    return outcode;
}

function GetOutCodePerspective(vector, zmin) {
    var outcode = 0;
	//console.log("x is " + vector.values[0][0] + " y is " + vector.values[1][0] + " z is " + vector.values[2][0]);
    //left right
    if (vector.x < vector.z) {
        outcode += 32;
		//console.log("left of left");
    }
    else if (vector.x > -vector.z) {
        outcode += 16
		//console.log("right of right");
    }
    //top bottom
    if (vector.y < vector.z) {
        outcode += 8
		//console.log("bottom of bottom");
    }
    else if (vector.y > -vector.z) {
        outcode += 4
		//console.log("top of top");
    }
    //near far
    if (vector.z > zmin) {
        outcode += 2
		//console.log("near of near");
    }
    else if (vector.z < -1) {
        outcode += 1
		//console.log("back of back");
    }
    return outcode;
}

/*

function ClipLine(pt0, pt1, view) {


}

 */