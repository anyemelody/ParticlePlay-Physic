var world, particleShape, particleMat, particleBody, groundShape, groundMat, groundBody, timeStep=1/60,particleBodies;

initThree();
initCannon();
animate();

      function initCannon() {
          world = new CANNON.World();
          world.gravity.set(0, -1, 0);
          world.broadphase = new CANNON.NaiveBroadphase();
          world.solver.iterations = 10;
          world.defaultContactMaterial.contactEquationStiffness = 1e10;
          world.defaultContactMaterial.contactEquationRelaxation = 10;
          ///////////////////////////
          // particle body
          particleShape = new CANNON.Sphere(0.05);
          particleMat = new CANNON.Material();
          for(var x = -6; x<6; x++){
           for(var y = 0; y<6; y++){
            for (var z =-6; z<6; z++){
              var body = new CANNON.Body({mass: 0.05, material: particleMat});
              body.addShape(particleShape);
              body.angularVelocity.set(0,10,0);
              body.angularDamping = 0.5;
              body.position.set(x*0.5, y*0.5+3, z*0.5);
              world.addBody(body);
            }
           }
          }
          // ground plane
          groundShape = new CANNON.Plane();
          groundMat = new CANNON.Material();
          groundBody = new CANNON.Body({
              mass: 0,
              position: new CANNON.Vec3(0,-1,0),
              material: groundMat
          });
          groundBody.addShape(groundShape);
          groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
          world.addBody(groundBody);

          var pTOgMat = new CANNON.ContactMaterial(groundMat, particleMat, {friction: 0.4, restitution:0.7});
          var pTOpMat = new CANNON.ContactMaterial(particleMat, particleMat, {friction: 0.1, restitution:0.3});
          world.addContactMaterial(pTOpMat);
          world.addContactMaterial(pTOgMat);
      }

var camera, scene, renderer, geometry, material, mesh, plane,particleGroup;
      function initThree() {
          scene = new THREE.Scene();

          camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 );
          camera.position.set(0, 1, 5);
          scene.add( camera );

          var axesHelper = new THREE.AxesHelper(5);
          scene.add(axesHelper);

          controls = new THREE.OrbitControls(camera);

          scene.add( new THREE.AmbientLight( 0x222222 ) );
	        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	        directionalLight.position.set( 1, 1, 1 ).normalize();
	        scene.add( directionalLight );

          renderer = new THREE.WebGLRenderer();
          renderer.setSize( window.innerWidth, window.innerHeight );
          document.body.appendChild( renderer.domElement );

          particleGroup = new THREE.Group;

          //add sphere geometry
          geometry = new THREE.SphereBufferGeometry( 0.05, 32, 32);
          material = new THREE.MeshPhysicalMaterial( { color: 0x2194ce, metalness:0.4, roughness:0.5, reflectivity: 0.3 });
          for(var x = -6; x<6; x++){
           for(var y = 0; y<6; y++){
            for (var z =-6; z<6; z++){
              var sphere = new THREE.Mesh(geometry, material);
              particleGroup.add(sphere);
            }
           }
          }
          scene.add(particleGroup);

          //plane
          var geometry = new THREE.PlaneBufferGeometry( 20, 20, 32 );
          var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
          plane = new THREE.Mesh( geometry, material );
          plane.position.set(0,-2,0);
          plane.rotation.set(Math.PI/2,0,0);
          scene.add( plane );
      }


      function animate() {
          requestAnimationFrame( animate );
          updatePhysics();
          render();
      }


      function updatePhysics() {
          // Step the physics world
          world.step(timeStep);
          // Copy coordinates from Cannon.js to Three.js
          for(var i=0; i<particleGroup.children.length; i++){
             var particle = particleGroup.getObjectById(14+i);
             var body = world.bodies[i];
          particle.position.copy(body.position);
          particle.quaternion.copy(body.quaternion);
          }

          // Copy coordinates from Cannon.js to Three.js
          plane.position.copy(groundBody.position);
          plane.quaternion.copy(groundBody.quaternion);
      }


      function render() {
          renderer.render( scene, camera );
      }
