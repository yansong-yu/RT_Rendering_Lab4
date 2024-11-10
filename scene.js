function create_windmill(){
    // use the lower plane as the root
    let base = new Shape(generateCube([3, 0.1, 3]), [0.490, 0.627, 0.412]);
    let body = new Shape(generateCylinder(0.9, 0.6, 3.5, 100, 10), [0.941, 0.922, 0.863])
    let bearing_stand = new Shape(generateCylinder(0.1, 0.1, 0.4, 100, 2), [0.545, 0.271, 0.075])
    let bearing = new Shape(generateSphere(0.1, 100, 100), [0.545, 0.271, 0.075]);
    let topper_base = new Shape(generateCylinder(0.1, 0.1, 0.1, 100, 10), [0.788, 0.427, 0.290])
    let topper_stick = new Shape(generateCylinder(0.05, 0.05, 1, 100, 10), [0.788, 0.427, 0.290])
    let topper_ball = new Shape(generateSphere(0.2, 100, 100), [0.671, 0.522, 0.376])
    
    let stick1 = new Shape(generateCylinder(0.1, 0.1, 4.5, 100, 10), [0.871, 0.722, 0.529])
    let leaf1 = new Shape(generateCube([2, 0.01, 0.6]), [0.871, 0.722, 0.529])


    // base.scale(0.5)

    base.add_child(body)

    body.add_child(bearing_stand)
    body.add_child(topper_base)
    bearing_stand.translate(0, 3, 0.5)
    bearing_stand.rotate(90, 0, 0)

    topper_base.translate(0, 3.5, 0)
    topper_base.add_child(topper_stick)

    topper_stick.add_child(topper_ball)

    topper_ball.translate(0, 1, 0)


    ///////////// create bearing //////////////
    bearing_stand.add_child(bearing)
    bearing.translate(0, 0.5, 0)
    bearing.add_child(stick1)
    
    stick1.add_child(leaf1)
    stick1.rotate(0, 0, 90);
    stick1.scale(0.5)
    leaf1.rotate(0, 0, -90)
    leaf1.translate(0.1, 2.8, 0)

    let stick2 = new Shape(generateCylinder(0.1, 0.1, 4.5, 100, 10), [0.871, 0.722, 0.529])
    let leaf2 = new Shape(generateCube([2, 0.01, 0.6]), [0.871, 0.722, 0.529])

    bearing.add_child(stick2)

    stick2.rotate(0, -90, 0)
    stick2.add_child(leaf2)
    stick2.rotate(0, 0, 90);
    stick2.scale(0.5)
    leaf2.rotate(0, 0, -90)
    leaf2.translate(0.1, 2.8, 0)

    let stick3 = new Shape(generateCylinder(0.1, 0.1, 4.5, 100, 10), [0.871, 0.722, 0.529])
    let leaf3 = new Shape(generateCube([2, 0.01, 0.6]), [0.871, 0.722, 0.529])

    bearing.add_child(stick3)

    stick3.rotate(0, -180, 0)
    stick3.add_child(leaf3)
    stick3.rotate(0, 0, 90);
    stick3.scale(0.5)
    leaf3.rotate(0, 0, -90)
    leaf3.translate(0.1, 2.8, 0)


    let stick4 = new Shape(generateCylinder(0.1, 0.1, 4.5, 100, 10), [0.871, 0.722, 0.529])
    let leaf4 = new Shape(generateCube([2, 0.01, 0.6]), [0.871, 0.722, 0.529])

    bearing.add_child(stick4)

    stick4.rotate(0, -270, 0)
    stick4.add_child(leaf4)
    stick4.rotate(0, 0, 90);
    stick4.scale(0.5)
    leaf4.rotate(0, 0, -90)
    leaf4.translate(0.1, 2.8, 0)
    scene = base;
    return scene;
}

