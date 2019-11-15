var view;
var ctx;
var scene;
var tempvertices = [];
var starttime;
var prevtime;
var animeIndex;
var rps;


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
            },
			{
                type: 'generic',
                vertices: [
                    Vector4(5, 0, -20, 1),
                    Vector4(10, 0, -20, 1),
                    Vector4(10, 5, -20, 1),
                    Vector4(5, 5, -20, 1),
					Vector4(5, 0, -25, 1),
                    Vector4(10, 0, -25, 1),
                    Vector4(10, 5, -25, 1),
                    Vector4(5, 5, -25, 1)

                ],
                edges: [
                    [0, 1, 2, 3, 0],
                    [4, 5, 6, 7, 4],
                    [0, 4],
                    [1, 5],
                    [2, 6],
                    [3, 7]
                ]
            }
        ]
    };

    document.addEventListener('keydown', OnKeyDown, false);

	starttime = performance.now(); // current timestamp in milliseconds
    prevtime = starttime;
	window.requestAnimationFrame(Animate);
	
}

function DrawScene() {

	if(scene.view.type === "perspective"){
		var transMatrix = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var j
		for( j=0; j< scene.models.length; j++){
			var ogData = scene.models[j].vertices;
			for (var i = 0; i < scene.models[j].vertices.length; i++) {
				tempvertices[i] = Matrix.multiply(transMatrix, scene.models[j].transform, scene.models[j].vertices[i]);
			}
			ClipPerspective(j);
		}
	}
	else if(scene.view.type === "parallel"){
		var transMatrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var j
		for( j=0; j< scene.models.length; j++){
			var ogData = scene.models[j].vertices;
			for (var i = 0; i < scene.models[j].vertices.length; i++) {
				tempvertices[i] = Matrix.multiply(transMatrix, scene.models[j].transform, scene.models[j].vertices[i]);
			}
			ClipParallel(j);
		}
	}
	else{}
	
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    view = document.getElementById('view');
    ctx.clearRect(0, 0, view.width, view.height);
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
			else if (scene.models[i].type === 'cube') {                
                //make the front of the cube.
				
                var x = scene.models[i].center[0] - (scene.models[i].width/2);
                var z = scene.models[i].center[2] + (scene.models[i].width/2);
                var y = scene.models[i].center[1] - (scene.models[i].height/2);
                console.log("trying " + x,y,z);
                var v0 = new Vector4(x,y,z,1);
                x = x + scene.models[i].width;
                var v1 = new Vector4(x,y,z,1);
                console.log("v0 " ,v0);
                //creating front top verticies
                y = y + scene.models[i].height;
                var v2 = new Vector4(x,y,z,1);
                x = x - scene.models[i].width;
                var v3 = new Vector4(x,y,z,1);
                //back verticies -- starting with back bottom left
                y = y-scene.models[i].height;
                z = z - scene.models[i].width;
                var v4 = new Vector4(x,y,z,1);
                x = x + scene.models[i].width;
                var v5 = new Vector4(x,y,z,1);
                y = y + scene.models[i].height;
                var v6 = new Vector4(x,y,z,1);
                x = x - scene.models[i].width;
                var v7 = new Vector4(x, y,z,1);
                scene.models[i].vertices = [v0,v1,v2,v3,v4,v5,v6,v7];
				scene.models[i].edges = [
                            [0, 1, 2, 3, 0],
                            [4, 5, 6, 7, 4],
                            [0, 4],
                            [1, 5],
                            [2, 6],
                            [3, 7]
                        ]
            }
			else if (scene.models[i].type === 'cylinder') {
                var height = scene.models[i].height;
                var sides = scene.models[i].sides;
                var r = scene.models[i].radius;
                var incrementAngle = (2 * Math.PI)/sides;
                var a = scene.models[i].center[0];
                var b = scene.models[i].center[2];
                var y = scene.models[i].center[1] - (scene.models[i].height/2);
                var bottomCircle = CreateCirclePoints(y, sides, r, incrementAngle, a,b);
                
                y = y + height;
                var topCircle = CreateCirclePoints(y, sides, r, incrementAngle, a,b);
                var edges = [];
                for (var j = 0; j<topCircle.vertices.length; j++) {
                    bottomCircle.vertices.push(topCircle.vertices[j]);
                }
                edges[0] = bottomCircle.edges;
                for (var j = 0; j<bottomCircle.edges.length; j++) {
                    topCircle.edges[j] = j + bottomCircle.edges.length-1;
                }
                topCircle.edges[topCircle.edges.length-1] = topCircle.edges[0];
                edges[1] = topCircle.edges;
                for (var j=2; j<bottomCircle.vertices.length-2; j++) {
                    edges[j] = [j-2, j + bottomCircle.edges.length -3];
                }
                scene.models[i].vertices = bottomCircle.vertices;
				scene.models[i].edges = edges;

            }
			else if (scene.models[i].type === 'cone') {
                var height = scene.models[i].height;
                var sides = scene.models[i].sides;
                var r = scene.models[i].radius;
                var incrementAngle = (2 * Math.PI)/sides;
                var a = scene.models[i].center[0];
                var b = scene.models[i].center[2];
                var y = scene.models[i].center[1] - (scene.models[i].height/2);
                var bottomCircle = CreateCirclePoints(y, sides, r, incrementAngle, a,b);
                y = y + height;
                var topPoint = new Vector4(a, y, b, 1);
                bottomCircle.vertices.push(topPoint);
                var edges = [];
                edges[0] = bottomCircle.edges;
                edges[1] = [sides];
                for(var j=2; j<bottomCircle.edges.length; j++) {
                    edges[j] = [j-1, edges[1]];
                }     
                scene.models[i].vertices = bottomCircle.vertices;
				scene.models[i].edges = edges;
			}
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                    scene.models[i].center[1],
                    scene.models[i].center[2],
                    1);
            }
        }	
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

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
            break;
        case 38: // UP Arrow
            scene.view.vrp = scene.view.vrp.subtract(n)
            break;	
        case 39: // RIGHT Arrow
			scene.view.vrp = scene.view.vrp.add(u)
            break;
        case 40: // DOWN Arrow
            scene.view.vrp = scene.view.vrp.add(n)
            break;
		case 78: //n
			scene.view.prp= scene.view.prp.subtract(u)

			break;
		case 77:
			scene.view.prp = scene.view.prp.add(u)
			break;
    }
}
function Animate(timestamp) {
		view = document.getElementById('view');
		ctx.clearRect(0, 0, view.width, view.height);
        var time = timestamp - starttime;
        var dt = timestamp - prevtime;
        prevtime = timestamp;
		var j
		for( j=0; j< scene.models.length; j++){
			var transformMat;
			if(scene.models[j].animation != undefined)
			{
				var theta = ((2*Math.PI))*scene.models[j].animation.rps*(time/1000);
				console.log("Theta is: " + theta + " rps: " + scene.models[j].animation.rps + " time: " + time);
				
				var center = scene.models[j].center;
				result1 = mat4x4translate(-center[0], -center[1], -center[2]);
				if(scene.models[j].animation.axis == "x"){
					result2 = mat4x4rotatex(theta);
				}
				else if(scene.models[j].animation.axis == "y"){
					result2 = mat4x4rotatey(theta);
				}
				else{
					result2 = mat4x4rotatez(theta);
				}
				result3= mat4x4translate(center[0], center[1], center[2]);					
				var finalresult = Matrix.multiply(result3, result2, result1);
				transformMat = finalresult;
				var ogData = scene.models[j].vertices;
			}
			else{
				transformMat= mat4x4identity();
			}
			scene.models[j].transform = transformMat;
			DrawScene();			
		}
        window.requestAnimationFrame(Animate);
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
		
function ClipParallel(index) {
    for (var i = 0; i < scene.models[index].edges.length; i++) {
        //index j is vert0
        for (var j = 0; j < scene.models[index].edges[i].length-1; j++) {
            console.log("I: "+i+" J:" + j);
            //index k is vert1
            var k = j + 1;
            //n is value for vert0 index
            var n = scene.models[index].edges[i][j];
            //m is value for vert0 index
            var m = scene.models[index].edges[i][k];

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
                    if ((selected_outcode & LEFT) === LEFT) {
                        var t = (-1-selected_pt.x)/delta_x;
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);
                    }
                    else if ((selected_outcode & RIGHT) === RIGHT) {
                        var t = (1-selected_pt.x)/delta_x;
                        selected_pt.x = selected_pt.x + (t*delta_x);
                        selected_pt.y = selected_pt.y + (t*delta_y);
						selected_pt.z = selected_pt.z + (t*delta_z);
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
function ClipPerspective(index) {
	
	var zmin = (-1) * (((-1)*scene.view.prp.z) + scene.view.clip[4])/ ((-1)*(scene.view.prp.z) + scene.view.clip[5]);
    for (var i = 0; i < scene.models[index].edges.length; i++) {
        //index j is vert0
        for (var j = 0; j < scene.models[index].edges[i].length-1; j++) {
            var k = j + 1;
            //n is value for vert0 index
            var n = scene.models[index].edges[i][j];
            //m is value for vert0 index
            var m = scene.models[index].edges[i][k];

            var vert0 = new Vector(tempvertices[n]);
            var vert1 = new Vector(tempvertices[m]);


            var outcode0 = GetOutCodePerspective(vert0, zmin);
            var outcode1 = GetOutCodePerspective(vert1, zmin);

            var delta_x = vert1.x - vert0.x;
            var delta_y = vert1.y - vert0.y;
			var delta_z=  vert1.z - vert0.z;
            var done = false;
            
            //outcode0 = 0;
            //outcode1 = 0;
            while (!done) {
                if ((outcode0 | outcode1) === 0) { //trivial accept
                    done = true;
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
                    done = true;
                }
                else {
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
                    if ((selected_outcode & LEFT) === LEFT) {
                        var t = (-vert0.x + vert0.z)/(delta_x-delta_z);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
						
                    }
                    else if ((selected_outcode & RIGHT) === RIGHT) {
                        var t = (vert0.x + vert0.z)/(-delta_x-delta_z);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else if ((selected_outcode & BOTTOM) === BOTTOM) {
                        var t = (-vert0.y + vert0.z)/(delta_y-delta_z);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else if ((selected_outcode & TOP) === TOP){
                        var t = (vert0.y + vert0.z)/(-delta_y-delta_z);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else if ((selected_outcode & INFRONT) === INFRONT){
                        var t = (vert0.z -zmin )/(-delta_z);
                        selected_pt.x = vert0.x + (t*delta_x);
                        selected_pt.y = vert0.y + (t*delta_y);
						selected_pt.z = vert0.z + (t*delta_z);
                    }
                    else{
                        var t = (-vert0.z -1 )/(delta_z);
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
	var epsilon = .00000001;
    if (vector.x < vector.z-epsilon) {
        outcode += 32;
    }
    else if (vector.x > -vector.z+epsilon) {
        outcode += 16
    }
    if (vector.y < vector.z-epsilon) {
        outcode += 8
    }
    else if (vector.y > -vector.z+epsilon) {
        outcode += 4
    }
    //near far
    if (vector.z > zmin+epsilon) {
        outcode += 2
    }
    else if (vector.z < -1) {
        outcode += 1
    }
    return outcode;
}
function CreateCirclePoints(y, sides, r, incrementAngle, a,b) {
    var createdVertices = [];
    createdVertices.length = sides;
   var t=0;
    var vx;
    var vz;
    for (var i=0; i<sides; i++){

        vx = a + r*Math.cos(t);
        vz = b + r*Math.sin(t);
        var tempVert = new Vector4(vx,y,vz,1)
        createdVertices[i] = tempVert;

        t = t + incrementAngle;
    }
    var edges = [];

    for (var i=0; i<createdVertices.length; i++) {
        edges[i] = i;
    }
    edges[edges.length]= 0;
        
    var returnObject = {"vertices": createdVertices,"edges": edges};

    return returnObject;
}